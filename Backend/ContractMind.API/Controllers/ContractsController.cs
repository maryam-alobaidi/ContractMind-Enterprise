using ContractMindModel;
using Microsoft.AspNetCore.Mvc;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractsController : ControllerBase
    {
     
        [HttpGet]
        public async Task<IActionResult> GetAllContracts()
        {
            List<contractsModel> contractsList = await clsContracts.GetAllContracts();
            if (contractsList == null || !contractsList.Any())
            {
                return NotFound(new { message = "No contracts found." });
            }
            return Ok(contractsList);
        }

    
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetContractById(int id)
        {
            clsContracts contract = await clsContracts.Find(id);
            if (contract == null)
            {
                return NotFound(new { message = $"Contract with ID {id} was not found." });
            }
            return Ok(contract.Model);
        }

      
        [HttpPost]
        public async Task<IActionResult> CreateContract([FromBody] contractsModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid contract data." });
            }

            clsContracts newContract = new clsContracts
            {
                UserId = model.UserId ?? -1,
                FileName = model.FileName,
                FilePath = model.FilePath,
                ExtractedText = model.ExtractedText,
                Summary = model.Summary,
                RiskScore = model.RiskScore ?? 0,
                UploadDate = model.UploadDate ?? DateTime.Now
            };

            bool isSaved = await newContract.Save();
            if (!isSaved)
            {
                return StatusCode(500, new { message = "An error occurred while saving the contract." });
            }

            return CreatedAtAction(nameof(GetContractById), new { id = newContract.ContractId }, newContract.Model);
        }

      
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateContract(int id, [FromBody] contractsModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid contract data." });
            }

            clsContracts contractFound = await clsContracts.Find(id);
            if (contractFound == null)
            {
                return NotFound(new { message = $"Contract with ID {id} was not found." });
            }

            contractFound.UserId = model.UserId ?? contractFound.UserId;
            contractFound.FileName = model.FileName;
            contractFound.FilePath = model.FilePath;
            contractFound.ExtractedText = model.ExtractedText;
            contractFound.Summary = model.Summary;
            contractFound.RiskScore = model.RiskScore ?? contractFound.RiskScore;
            contractFound.UploadDate = model.UploadDate ?? contractFound.UploadDate;

            bool isUpdated = await contractFound.Save();
            if (!isUpdated)
            {
                return StatusCode(500, new { message = "An error occurred while updating the contract." });
            }

            return Ok(new { message = "Contract updated successfully.", data = contractFound.Model });
        }

     
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteContract(int id)
        {
            bool isDeleted = await clsContracts.Delete(id);
            if (!isDeleted)
            {
                return NotFound(new { message = $"Contract with ID {id} was not found or could not be deleted." });
            }

            return Ok(new { message = "Contract deleted successfully." });
        }
    }
}