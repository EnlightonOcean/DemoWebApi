using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interface;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        private readonly DataContext _context;
        public LikesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<UserLike> GetUserLike(int sourceUserId, int likedUserId)
        {
            return await _context.Likes.FindAsync(sourceUserId,likedUserId);
        }

        public async Task<PageList<LikeDto>> GetUserLikes(LikesParams likesParams)
        {
            var qUsers = _context.Users.OrderBy(x => x.UserName).AsQueryable();
            var qLikes = _context.Likes.AsQueryable();
            switch (likesParams.Predicate.ToLower())
            {
                case "liked":
                    qLikes = qLikes.Where(x => x.SourceUserId == likesParams.UserId);
                    qUsers = qLikes.Select(x => x.LikedUser);
                    break;
                case "likedby":
                    qLikes = qLikes.Where(x => x.LikedUserId == likesParams.UserId);
                    qUsers = qLikes.Select(x => x.SourceUser);
                    break;       
                default:
                    break;
            }
            
            var likedUsers= qUsers.Select( x => new LikeDto{
                Id = x.Id,
                UserName = x.UserName,
                Age = x.DateOfBirth.CalculateAge(),
                KnownAs = x.KnownAs,
                City = x.City,
                PhotoUrl = x.Photos.FirstOrDefault( x=> x.IsMain == true).Url
            });
            
            return await PageList<LikeDto>.CreateAsync(likedUsers,likesParams.PageNumber,likesParams.PageSize);

        }

        public async Task<AppUser> GetUserWithLikes(int userId)
        {
            return await _context.Users
            .Include(x => x.LikedUsers)
            .FirstOrDefaultAsync(x => x.Id == userId);
        }
    }
}