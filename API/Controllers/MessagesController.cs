using API.DTOs;
using API.Helpers;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace API.Controllers;

[Authorize]
public class MessagesController : BaseApiController
{
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    public MessagesController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUserName();
        if (username.Equals(createMessageDto.RecipientUsername.ToLower())) return BadRequest("You cannot send message to yourself");
        var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
        var recipient = await _unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);
        if (recipient == null) return NotFound("Recipient not found");
        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUserName = username,
            RecipientUserName = createMessageDto.RecipientUsername,
            Content = createMessageDto.Content
        };
        _unitOfWork.MessageRepository.AddMessage(message);
        if (await _unitOfWork.Complete()) return Ok(_mapper.Map<MessageDto>(message));
        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery]
        MessageParams messageParams)
    {
        messageParams.Username = User.GetUserName();
        var messages = await _unitOfWork.MessageRepository.GetMessagesForUser(messageParams);
        Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize,
            messages.TotalCount, messages.TotalPages);
        return messages;
    }

    [HttpGet("thread/{recipient}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string recipient)
    {
        return Ok(await _unitOfWork.MessageRepository.GetMessageThread(User.GetUserName(), recipient));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var username = User.GetUserName();
        var message = await _unitOfWork.MessageRepository.GetMessage(id);
        if (message.Sender.UserName != username && message.Recipient.UserName != username) return Unauthorized("Not allowed to delete");
        if (message.Sender.UserName == username) message.SenderDeleted = true;
        if (message.Recipient.UserName == username) message.RecipientDeleted = true;
        if (message.RecipientDeleted && message.SenderDeleted) _unitOfWork.MessageRepository.DeleteMessage(message);
        if (await _unitOfWork.Complete()) return Ok();
        return BadRequest("Message deletion failed.");
    }
}
