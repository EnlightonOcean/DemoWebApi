using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<AppUser,MemberDto>()
            .ForMember( x =>x.PhotoUrl,
                        opt => opt.MapFrom( x => x.Photos.FirstOrDefault(y => y.IsMain).Url))
            .ForMember( x => x.Age, opt => opt.MapFrom(x => x.DateOfBirth.CalculateAge()));
            CreateMap<Photo,PhotoDto>();
            CreateMap<MemberUpdateDTO,AppUser>();
            CreateMap<RegisterDto,AppUser>();
            CreateMap<Message,MessageDto>()
            .ForMember(x => x.SenderPhotoUrl,
                        opt => opt.MapFrom( u => u.Sender.Photos.FirstOrDefault(x => x.IsMain).Url))
            .ForMember(x => x.RecipientPhotoUrl,
                        opt => opt.MapFrom( t => t.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url));
        }
    }
}