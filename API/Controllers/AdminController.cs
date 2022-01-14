using System.Linq;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        public AdminController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles(){
            var users = await _userManager.Users
                        .Include(x => x.UserRoles)
                        .ThenInclude(x => x.Role)
                        .OrderBy(x => x.UserName)
                        .Select(x => new{
                            x.Id,
                            x.UserName,
                            Roles = x.UserRoles.Select(x => x.Role.Name).ToList()
                        })
                        .ToListAsync();
            return Ok(users);            
            //return Ok("Only Admin can see this");
        }

        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username,[FromQuery] string roles){
            var selectedRoles = roles.Split(",").ToArray();
            var user = await _userManager.FindByNameAsync(username);
            if(user == null) return NotFound("Could not find user");
            var userRoles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.AddToRolesAsync(user,selectedRoles.Except(userRoles));
            if(!result.Succeeded) return BadRequest("Failed to add to roles");
            result = await _userManager.RemoveFromRolesAsync(user,userRoles.Except(selectedRoles));
            if(!result.Succeeded) return BadRequest("Failed to remove from roles");
            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public ActionResult GetPhotosForModeration(){
            return Ok("Admin or moderator can see this");
        }
    }
}