using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;

        private readonly IMapper _mapper;

        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            _mapper = mapper;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
            //return Ok(_mapper.Map<IEnumerable<MemberDto>>(await _userRepository.GetUsersAsync()));
            return Ok(await _userRepository.GerMembersAsync());
        }


        [HttpGet("{username}")]
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
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetUserByUsernameAsync(username);
            _mapper.Map(memberUpdateDTO,user);
            _userRepository.Update(user);
            if(await _userRepository.SaveAllAsync()) return NoContent();
            return BadRequest("Failed to update user");
        }

    }
}