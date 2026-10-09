using ContractMindModel;
using Microsoft.AspNetCore.Mvc;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatHistoryController : ControllerBase
    {
      
        [HttpGet]
        public async Task<IActionResult> GetAllChatHistory()
        {
            List<chatHistoryModel> chatList = await clsChatHistory.GetAllChatHistory();
            if (chatList == null || !chatList.Any())
            {
                return NotFound(new { message = "No chat history found." });
            }
            return Ok(chatList);
        }

        
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetChatHistoryById(long id)
        {
            var chat = await clsChatHistory.FindByID(id);
            if (chat == null)
            {
                return NotFound(new { message = $"Chat history with ID {id} was not found." });
            }
            return Ok(chat.Model);
        }

        
        [HttpPost]
        public async Task<IActionResult> CreateChatHistory([FromBody] chatHistoryModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid chat data." });
            }

            clsChatHistory newChat = new clsChatHistory
            {
                ContractId = model.ContractId,
                Sender = model.Sender,
                MessageText = model.MessageText,
                Timestamp = model.Timestamp ?? DateTime.Now
            };

            bool isSaved = await newChat.Save();
            if (!isSaved)
            {
                return StatusCode(500, new { message = "An error occurred while saving the chat message." });
            }

            return CreatedAtAction(nameof(GetChatHistoryById), new { id = newChat.MessageId }, newChat.Model);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteChatHistory(long id)
        {
            bool isDeleted = await clsChatHistory.Delete(id);
            if (!isDeleted)
            {
                return NotFound(new { message = $"Chat history with ID {id} was not found or could not be deleted." });
            }

            return Ok(new { message = "Chat history deleted successfully." });
        }
    }
}