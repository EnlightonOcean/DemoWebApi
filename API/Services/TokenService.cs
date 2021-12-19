using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;
        private readonly UserManager<AppUser> _userManager;
        public TokenService(IConfiguration config, UserManager<AppUser> userManager)
        {
            _userManager = userManager;
            _key= new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));
        }
        public async Task<string> CreateToken(AppUser user)
        {
           var claims = new List<Claim>{
               new Claim(JwtRegisteredClaimNames.NameId,user.Id.ToString()),
               new Claim(JwtRegisteredClaimNames.UniqueName,user.UserName)
               //new Claim(JwtRegisteredClaimNames.)
           };
           var roles = await _userManager.GetRolesAsync(user);
           claims.AddRange(roles.Select(x => new Claim(ClaimTypes.Role, x))); 
           var cred = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
           var tokenDescriptor= new SecurityTokenDescriptor{
               Issuer = "Civix",
               Audience = "abc.com",
               Subject = new ClaimsIdentity(claims),
               Expires = DateTime.UtcNow.AddMinutes(20),
               SigningCredentials = cred
           };

           var tokenHandler = new JwtSecurityTokenHandler();

           var token=tokenHandler.CreateToken(tokenDescriptor);

           return tokenHandler.WriteToken(token);

        }
    }
}