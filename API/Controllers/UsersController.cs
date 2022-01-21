using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly IUnitOfWork _unitOfWork;

        public UsersController(IUnitOfWork unitOfWork , IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _photoService = photoService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery]UserParams userParams)
        {
            var gender = await _unitOfWork.UserRepository.GetUserGender(User.GetUserName());
            userParams.CurrentUserName = User.GetUserName();
            if (string.IsNullOrEmpty(userParams.Gender)){
                userParams.Gender = gender == "male" ? "female" : "male";
            }

            //return Ok(_mapper.Map<IEnumerable<MemberDto>>(await _unitOfWork.UserRepository.GetUsersAsync()));
            var users = await _unitOfWork.UserRepository.GetMembersAsync(userParams);
            Response.AddPaginationHeader(users.CurrentPage,users.PageSize,
                users.TotalCount,users.TotalPages);

            return Ok(users);
        }

        [HttpGet("{username}",Name ="GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            //return Ok(_mapper.Map<MemberDto>(await _unitOfWork.UserRepository.GetUserByUsernameAsync(username)));
            return await _unitOfWork.UserRepository.GetMemberAsync(username,isCurrentUser: username == User.GetUserName());

        }

        // [HttpGet("{username}")]
        // public async Task<ActionResult<AppUser>> GetUserByName(string username)
        // {
        //     var user = await _dataContext.Users.SingleOrDefaultAsync(x => x.UserName == username);
        //     if(user == null) return NotFound("User not found");
        //      return user;

        // }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDTO memberUpdateDTO){
            var username = User.GetUserName(); //User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            _mapper.Map(memberUpdateDTO,user);
            _unitOfWork.UserRepository.Update(user);
            if(await _unitOfWork.Complete()) return NoContent();
            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file){
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUserName());
            var result = await _photoService.AddPhotoAsync(file);
            if(result.Error != null ) return BadRequest(result.Error.Message);
            
            var photo = new Photo(){
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };
            //if(user.Photos.Count == 0) photo.IsMain = true;
            user.Photos.Add(photo);
            if(await _unitOfWork.Complete()) {
                //return _mapper.Map<PhotoDto>(photo);
                return CreatedAtRoute("GetUser",new {username = user.UserName}, _mapper.Map<PhotoDto>(photo));
            }
            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId){
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUserName());
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return BadRequest($"Photo with id {photoId} does not exists.");
            if (photo.IsMain) return BadRequest("This is already your main photo");
            var currentMain = user.Photos.FirstOrDefault( x => x.IsMain);
            if (currentMain != null) currentMain.IsMain=false;
            photo.IsMain = true;
            if (await _unitOfWork.Complete()) return NoContent();
            return BadRequest("Problem setting main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId){
            //var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUserName());
            var user = await _unitOfWork.UserRepository.GetUserByPhotoId(photoId);
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return NotFound();
            if (photo.IsMain) return BadRequest("Main photo cannot be deleted");
            if (photo.PublicId != null){
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
            user.Photos.Remove(photo);
            if (await _unitOfWork.Complete()) return Ok();
            return BadRequest("Problem deleting photo");
        }
    }
}