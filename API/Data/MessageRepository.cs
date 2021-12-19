using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interface;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages
                .Include(x => x.Sender)
                .Include(x => x.Recipient)
                .SingleOrDefaultAsync(x => x.Id == id);
            // .FindAsync(id);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<PageList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var qMessages = _context.Messages
                            .OrderByDescending(x => x.MessageSent)
                            .AsQueryable();
            qMessages = messageParams.Container switch
            {
                "Inbox" => qMessages.Where(x => x.Recipient.UserName == messageParams.Username 
                    && !x.RecipientDeleted),
                "Outbox" => qMessages.Where(x => x.Sender.UserName == messageParams.Username 
                    && !x.SenderDeleted),
                _ => qMessages.Where(x => x.Recipient.UserName == messageParams.Username 
                    && x.DateRead == null 
                    && !x.RecipientDeleted)
            };

            var messages = qMessages.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);
            return await PageList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUserName, 
            string recipientUserName)
        {
            var messages = await _context.Messages
                            .Include(x => x.Sender).ThenInclude(x => x.Photos)
                            .Include(x => x.Recipient).ThenInclude(x => x.Photos)
                            .Where(x => x.Recipient.UserName == currentUserName
                                && !x.RecipientDeleted
                                && x.Sender.UserName == recipientUserName
                                || x.Recipient.UserName == recipientUserName
                                && !x.SenderDeleted
                                && x.Sender.UserName == currentUserName
                            )
                            .OrderBy( x => x.MessageSent)
                            .ToListAsync();
            var unreadMessages = messages.Where(x => x.DateRead == null 
                                && x.Recipient.UserName == currentUserName).ToList();
            if(unreadMessages.Any()){
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.Now;
                }
                await _context.SaveChangesAsync();
            }
            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

    }
}