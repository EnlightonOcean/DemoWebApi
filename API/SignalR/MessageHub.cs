using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub 
    {
        private readonly IMapper _mapper;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly Presencetracker _tracker;
        private readonly IUnitOfWork _unitOfWork;
        public MessageHub(IUnitOfWork unitOfWork, IMapper mapper, 
            IHubContext<PresenceHub> presenceHub,Presencetracker tracker)
        {
            _unitOfWork = unitOfWork;
            _tracker = tracker;
            _presenceHub = presenceHub;
            _mapper = mapper;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.GetUserName(),otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId,groupName);
            
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup",group);

            var messages = await _unitOfWork.MessageRepository.GetMessageThread(Context.User.GetUserName(),otherUser);
            if(_unitOfWork.HasChanges())  await _unitOfWork.Complete();
            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User.GetUserName();
            if (username.Equals(createMessageDto.RecipientUsername.ToLower())) throw new HubException("You cannot send message to yourself");
            var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var recipient = await _unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);
            if (recipient == null) throw new HubException("Recipient not found");
            var message = new Message
            {
                Sender = sender,
                Recipient = recipient,
                SenderUserName = username,
                RecipientUserName = createMessageDto.RecipientUsername,
                Content = createMessageDto.Content
            };
            var groupName = GetGroupName(username, createMessageDto.RecipientUsername);
            var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);
            if(group.Connections.Any(x => x.Username == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;                   
            }
            else
            {
                var connections = await _tracker.GetConnectionsForUser(recipient.UserName);
                if(connections != null)
                {
                    await _presenceHub.Clients.Clients(connections).SendAsync("NewMessageRecieved",new {
                        username = sender.UserName,
                        knownAs = sender.KnownAs
                    });
                }

            }
            _unitOfWork.MessageRepository.AddMessage(message);
            if (await _unitOfWork.Complete()) {
                
                await Clients.Group(groupName).SendAsync("NewMessage",_mapper.Map<MessageDto>(message));
            }
        }

        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);
            if(group == null){
                group = new Group(groupName);
                _unitOfWork.MessageRepository.AddGroup(group);
            }
            var connection = new Connection(Context.ConnectionId,Context.User.GetUserName());
            group.Connections.Add(connection);
            if(await _unitOfWork.Complete()) return group;
            throw new HubException("Failed to join group");

        }

        private async Task<Group> RemoveFromMessageGroup()
        {
            var group = await _unitOfWork.MessageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group.Connections.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId);
            _unitOfWork.MessageRepository.RemoveConnection(connection);
            if(await _unitOfWork.Complete()) return group;
            throw new HubException("Failed to remove from Group");
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup",group);
            await base.OnDisconnectedAsync(ex);
        }
    }
}