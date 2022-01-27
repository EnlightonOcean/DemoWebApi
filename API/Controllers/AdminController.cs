using API.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace API.Controllers;

public class AdminController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPhotoService _photoService;
    public AdminController(UserManager<AppUser> userManager, IUnitOfWork unitOfWork, IPhotoService photoService)
    {
        _photoService = photoService;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await _userManager.Users
                    .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                    .OrderBy(x => x.UserName)
                    .Select(x => new
                    {
                        x.Id,
                        x.UserName,
                        Roles = x.UserRoles.Select(x => x.Role.Name).ToList()
                    })
                    .ToListAsync();
        return Ok(users);
        //return Ok("Only Admin can see this");
    }

    [HttpPost("edit-roles/{username}")]
    public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
    {
        var selectedRoles = roles.Split(",").ToArray();
        var user = await _userManager.FindByNameAsync(username);
        if (user == null) return NotFound("Could not find user");
        var userRoles = await _userManager.GetRolesAsync(user);
        var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
        if (!result.Succeeded) return BadRequest("Failed to add to roles");
        result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
        if (!result.Succeeded) return BadRequest("Failed to remove from roles");
        return Ok(await _userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photos-to-moderate")]
    public async Task<ActionResult> GetPhotosForModeration()
    {
        var photos = await _unitOfWork.PhotoRepository.GetUnApprovedPhotos();
        return Ok(photos);
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpPost("approve-photo/{photoId}")]
    public async Task<ActionResult> ApprovePhoto(int photoId)
    {
        var photo = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
        if (photo == null) return NotFound("Could not find photo");
        photo.IsApproved = true;
        var user = await _unitOfWork.UserRepository.GetUserByPhotoId(photoId);
        if (!user.Photos.Any(x => x.IsMain)) photo.IsMain = true;
        if (!await _unitOfWork.Complete()) return BadRequest("Failed to Approve Photo");
        //return Ok($"Photo with id {photoId} approved");
        return Ok();
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpPost("reject-photo/{photoId}")]
    public async Task<ActionResult> RejectPhoto(int photoId)
    {
        var photo = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
        if (photo.PublicId != null)
        {
            var result = await _photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Result == "ok")
            {
                _unitOfWork.PhotoRepository.RemovePhoto(photo);
            }
            else
                return BadRequest("Failed to remove photo from Cloudinary");
        }
        else
        {
            _unitOfWork.PhotoRepository.RemovePhoto(photo);
        }

        if (!await _unitOfWork.Complete()) return BadRequest("Failed to Reject Photo");
        return Ok();
    }

}
