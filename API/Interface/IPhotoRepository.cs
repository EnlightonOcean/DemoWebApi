using API.DTOs;
using API.Entities;

namespace API.Interface
{
    public interface IPhotoRepository
    {
        Task<IEnumerable<PhotoForApprovalDto>> GetUnApprovedPhotos();
        Task<Photo> GetPhotoById(int Id);
        void RemovePhoto(Photo photo);
    }
}