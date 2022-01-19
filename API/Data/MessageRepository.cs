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

      

        public async Task<PageList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var qMessages = _context.Messages
                            .OrderByDescending(x => x.MessageSent)
                            .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                            .AsQueryable();
            qMessages = messageParams.Container switch
            {
                "Inbox" => qMessages.Where(x => x.RecipientUserName == messageParams.Username 
                    && !x.RecipientDeleted),
                "Outbox" => qMessages.Where(x => x.SenderUserName == messageParams.Username 
                    && !x.SenderDeleted),
                _ => qMessages.Where(x => x.RecipientUserName == messageParams.Username 
                    && x.DateRead == null 
                    && !x.RecipientDeleted)
            };

            return await PageList<MessageDto>.CreateAsync(qMessages, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUserName, 
            string recipientUserName)
        {
            var messages = await _context.Messages
                            .Where(x => x.Recipient.UserName == currentUserName
                                && !x.RecipientDeleted
                                && x.Sender.UserName == recipientUserName
                                || x.Recipient.UserName == recipientUserName
                                && !x.SenderDeleted
                                && x.Sender.UserName == currentUserName
                            )
                            .OrderBy( x => x.MessageSent)
                            .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                            .ToListAsync();
            var unreadMessages = messages.Where(x => x.DateRead == null 
                                && x.RecipientUserName == currentUserName).ToList();
            if(unreadMessages.Any()){
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.UtcNow;
                }
            }
            return messages;
        }

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }

        public async Task<Connection> GetConnection(string connectonId)
        {
            return await _context.Connections.FindAsync(connectonId);
        }

        public async Task<Group> GetMessageGroup(string groupName)
        {
            return await _context.Groups
                .Include(x => x.Connections)
                .SingleOrDefaultAsync(x => x.Name == groupName);
        }

        public async Task<Group> GetGroupForConnection(string connectionId)
        {
             return await _context.Groups
                .Include(x => x.Connections)
                .SingleOrDefaultAsync(x => x.Connections.Any(x => x.ConnectionId == connectionId ));  
        }
    }
}