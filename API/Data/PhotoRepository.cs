using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class PhotoRepository : IPhotoRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public PhotoRepository(DataContext context,IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<Photo> GetPhotoById(int Id)
        {
            return await _context.Photos
                            .IgnoreQueryFilters()
                            .SingleOrDefaultAsync(X => X.Id == Id);
        }

        public async Task<IEnumerable<PhotoForApprovalDto>> GetUnApprovedPhotos()
        {
            return await _context.Photos
                        .Where(x => x.IsApproved == false)
                        .ProjectTo<PhotoForApprovalDto>(_mapper.ConfigurationProvider)
                        .IgnoreQueryFilters()
                        .ToListAsync();            
        }

        public void RemovePhoto(Photo photo)
        {
            _context.Photos.Remove(photo);
        }
    }
}