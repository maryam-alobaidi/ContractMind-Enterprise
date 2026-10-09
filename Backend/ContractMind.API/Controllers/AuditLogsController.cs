using ContractMindModel;
using Microsoft.AspNetCore.Mvc;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
      
        [HttpGet]
        public async Task<IActionResult> GetAllAuditLogs()
        {
            var logsList = await clsAuditLogsData.GetAllAuditLogs();
            if (logsList == null || !logsList.Any())
            {
                return NotFound(new { message = "No audit logs found." });
            }
            return Ok(logsList);
        }

      
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetAuditLogById(int id)
        {
            var log = await clsAuditLogsData.FindByID(id);
            if (log == null)
            {
                return NotFound(new { message = $"Audit log with ID {id} was not found." });
            }
            return Ok(log);
        }

       
        [HttpPost]
        public async Task<IActionResult> CreateAuditLog([FromBody] auditLogsModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid audit log data." });
            }

            int? newId = await clsAuditLogsData.AddNewAuditLogs(
                model.UserId ?? -1,
                model.Action,
                model.Timestamp ?? DateTime.Now
            );

            if (!newId.HasValue || newId.Value == -1)
            {
                return StatusCode(500, new { message = "An error occurred while saving the audit log." });
            }

            var createdLog = await clsAuditLogsData.FindByID(newId.Value);
            return CreatedAtAction(nameof(GetAuditLogById), new { id = newId.Value }, createdLog);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAuditLog(int id)
        {
            bool isDeleted = await clsAuditLogsData.DeleteAuditLogs(id);
            if (!isDeleted)
            {
                return NotFound(new { message = $"Audit log with ID {id} was not found or could not be deleted." });
            }

            return Ok(new { message = "Audit log deleted successfully." });
        }
    }
}
