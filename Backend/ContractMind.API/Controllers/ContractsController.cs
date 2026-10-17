using ContractMind.BLL.Interface;
using ContractMindModel;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Mvc;

using System.Text;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractsController : ControllerBase
    {

        private readonly IOpenAIService _aiService;

        public ContractsController(IOpenAIService aiService)
        {
            _aiService = aiService;
        }


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

        [HttpPost("upload-and-analyze")]
        public async Task<IActionResult> UploadAndAnalyzeContract(
        [FromForm] IFormFile file,
        [FromForm] int userId,
        [FromForm] string language = "en")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Please upload a valid file." });
                }

                // 1. فحص مجلد uploads
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }


                string extractedText = string.Empty;
                string fileExtension = Path.GetExtension(file.FileName).ToLower();
                try
                {
                    using (var stream = file.OpenReadStream())
                    {
                        if (fileExtension == ".pdf")
                        {
                            using (var pdfReader = new iText.Kernel.Pdf.PdfReader(stream))
                            {
                                using (var pdfDoc = new iText.Kernel.Pdf.PdfDocument(pdfReader))
                                {
                                    var textBuilder = new System.Text.StringBuilder();
                                    int numberOfPages = pdfDoc.GetNumberOfPages();

                                    for (int i = 1; i <= numberOfPages; i++)
                                    {
                                        var page = pdfDoc.GetPage(i);
                                        string pageText = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(
                                            page,
                                            new iText.Kernel.Pdf.Canvas.Parser.Listener.SimpleTextExtractionStrategy()
                                        );
                                        textBuilder.AppendLine(pageText);
                                    }
                                    extractedText = textBuilder.ToString();
                                }
                            }
                        }
                        else if (fileExtension == ".docx")
                        {
                            extractedText = ExtractTextFromDocx(stream);
                        }
                        else
                        {
                            return BadRequest(new { message = "Unsupported file format. Please upload PDF or DOCX files only." });
                        }
                    }
                }
                catch (Exception parseEx)
                {
                    Console.WriteLine("File Parsing Error: " + parseEx.Message);
                    return BadRequest(new { message = "Failed to read the file. It might be corrupted or protected." });
                }

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest(new { message = "Could not extract text from this file." });
                }

                // 3. تحليل OpenAI
                var aiResult = await _aiService.AnalyzeContractTextAsync(extractedText, language);

                if (aiResult == null)
                {
                    return StatusCode(500, new { message = "AI service failed to analyze the contract." });
                }

                Console.WriteLine("AI Summary Result: " + aiResult.Summary);
                Console.WriteLine("AI Risk Score Result: " + aiResult.RiskScore);

                // 4. حفظ قاعدة البيانات
                clsContracts newContract = new clsContracts
                {
                    UserId = userId > 0 ? userId : -1,
                    FileName = file.FileName,
                    FilePath = "uploads/" + uniqueFileName,
                    ExtractedText = extractedText,
                    Summary = aiResult.Summary,
                    RiskScore = aiResult.RiskScore,
                    UploadDate = DateTime.Now
                };

                bool isSaved = await newContract.Save();
                if (!isSaved)
                {
                    return StatusCode(500, new { message = "Failed to save to database." });
                }

                return Ok(new
                {
                    message = "Success",
                    contract = newContract,
                    aiAnalysis = aiResult
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Server Error: " + ex.ToString());
                return StatusCode(500, new { message = "Server Exception: " + ex.Message, stackTrace = ex.StackTrace });
            }
        }

        public static string ExtractTextFromDocx(Stream stream)
        {
            var textBuilder = new StringBuilder();
            using (var wordDoc = WordprocessingDocument.Open(stream, false))
            {
                var body = wordDoc.MainDocumentPart?.Document?.Body;
                if (body != null)
                {
                    foreach (var text in body.Descendants<DocumentFormat.OpenXml.Wordprocessing.Text>())
                    {
                        textBuilder.Append(text.Text);
                    }
                }
            }
            return textBuilder.ToString();
        }
    }
}