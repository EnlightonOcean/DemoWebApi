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
        private readonly IUserRepository _userRepository;

        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService)
        {
            _photoService = photoService;
            _mapper = mapper;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery]UserParams userParams)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
            userParams.CurrentUserName = user.UserName;
            if (string.IsNullOrEmpty(userParams.Gender)){
                userParams.Gender = user.Gender == "male" ? "female" : "male";
            }

            //return Ok(_mapper.Map<IEnumerable<MemberDto>>(await _userRepository.GetUsersAsync()));
            var users = await _userRepository.GetMembersAsync(userParams);
            Response.AddPaginationHeader(users.CurrentPage,users.PageSize,
                users.TotalCount,users.TotalPages);

            return Ok(users);
        }

        [HttpGet("{username}",Name ="GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            //return Ok(_mapper.Map<MemberDto>(await _userRepository.GetUserByUsernameAsync(username)));
            return await _userRepository.GetMemberAsync(username);

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
            var user = await _userRepository.GetUserByUsernameAsync(username);
            _mapper.Map(memberUpdateDTO,user);
            _userRepository.Update(user);
            if(await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file){
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
            var result = await _photoService.AddPhotoAsync(file);
            if(result.Error != null ) return BadRequest(result.Error.Message);
            
            var photo = new Photo(){
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };
            if(user.Photos.Count == 0) photo.IsMain = true;
            user.Photos.Add(photo);
            if(await _userRepository.SaveAllAsync()) {
                //return _mapper.Map<PhotoDto>(photo);
                return CreatedAtRoute("GetUser",new {username = user.UserName}, _mapper.Map<PhotoDto>(photo));
            }
            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId){
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return BadRequest($"Photo with id {photoId} does not exists.");
            if (photo.IsMain) return BadRequest("This is already your main photo");
            var currentMain = user.Photos.FirstOrDefault( x => x.IsMain);
            if (currentMain != null) currentMain.IsMain=false;
            photo.IsMain = true;
            if (await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Problem setting main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId){
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUserName());
            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
            if (photo == null) return NotFound();
            if (photo.IsMain) return BadRequest("Main photo cannot be deleted");
            if (photo.PublicId != null){
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
            user.Photos.Remove(photo);
            if (await _userRepository.SaveAllAsync()) return Ok();
            return BadRequest("Problem deleting photo");
        }
    }
}