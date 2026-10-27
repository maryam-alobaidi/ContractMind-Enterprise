using ContractMind.BLL;
using ContractMind.BLL.Interface;
using ContractMindModel;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Tesseract;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractsController : ControllerBase
    {

        private readonly IOpenAIService _aiService;
        private readonly IPrivacyService _privacyService;

        public ContractsController(IOpenAIService aiService, IPrivacyService privacyService)
        {
            _aiService = aiService;
            _privacyService = privacyService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllContracts()
        {
            List<contractsModel> contractsList = await clsContracts.GetAllContracts();
            if (contractsList == null || !contractsList.Any())
            {
                return NotFound(new { message = "No contracts found." });
            }

            var contracts = contractsList.OrderByDescending(c => c.UploadDate)
               .ToList();

            return Ok(contracts);
        }

        [HttpGet("resent")]
        public async Task<IActionResult> GetResentContracts()
        {
            List<contractsModel> contractsList = await clsContracts.GetAllContracts();
            if (contractsList == null || !contractsList.Any())
            {
                return NotFound(new { message = "No contracts found." });
            }
            var contracts = contractsList.OrderByDescending(c => c.UploadDate).Take(10)
              .ToList();
            return Ok(contracts);
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
        [Authorize]// for every one who login the program
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteContract(int id)
        {
            var contract = await clsContracts.Find(id);
            if (contract == null)
            {
                return NotFound("Contract not found..");
            }

            bool isDeleted = await clsContracts.Delete(id);
            if (!isDeleted)
            {
                return NotFound(new { message = $"Contract with ID {id} was not found or could not be deleted." });
            }

            var fileName = contract.FileName?.Length > 60
    ? contract.FileName.Substring(0, 60) + "..."
    : contract.FileName;

            clsAuditLogs auditLogs = new clsAuditLogs()
            {
                UserId = contract.UserId,
                Action= $"DELETE / {fileName}",
                Timestamp=DateTime.Now

            };

            auditLogs.Save();

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

                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

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
                            using (var pdfDocument = UglyToad.PdfPig.PdfDocument.Open(stream))
                            {
                                var textBuilder = new System.Text.StringBuilder();
                                foreach (var page in pdfDocument.GetPages())
                                {
                                    textBuilder.AppendLine(page.Text);
                                }
                                extractedText = textBuilder.ToString();
                            }
                        }
                        else if (fileExtension == ".docx")
                        {
                            extractedText = ExtractTextFromDocx(stream);
                        }
                    }
                }
                catch (Exception) { }

                // تفعيل الـ OCR إذا كان النص بحاجة לכך
                if (string.IsNullOrWhiteSpace(extractedText) || extractedText.Contains("ѧ") || extractedText.Contains("؂") || extractedText.Length < 100)
                {
                    try
                    {
                        string tessDataPath = Path.Combine(Directory.GetCurrentDirectory(), "tessdata");

                        if (fileExtension == ".png" || fileExtension == ".jpg" || fileExtension == ".jpeg")
                        {
                            using (var engine = new TesseractEngine(tessDataPath, "ara", EngineMode.Default))
                            {
                                using (var img = Tesseract.Pix.LoadFromFile(filePath))
                                {
                                    using (var page = engine.Process(img))
                                    {
                                        extractedText = page.GetText();
                                    }
                                }
                            }
                        }
                        else if (fileExtension == ".pdf")
                        {
                            using (var pdfDoc = PdfiumViewer.PdfDocument.Load(filePath))
                            {
                                // مصفوفة لتخزين نصوص الصفحات بترتيبها الصحيح لتجنب مشاكل التداخل
                                string[] pageTexts = new string[pdfDoc.PageCount];

                                // استخدام Parallel.For لمعالجة عدة صفحات في نفس الوقت عبر أنوية المعالج (CPU)
                                Parallel.For(0, pdfDoc.PageCount, i =>
                                {
                                    // إنشاء محرك Tesseract خاص بكل خيط (Thread) لأنه غير آمن للمشاركة المباشرة
                                    using (var localEngine = new TesseractEngine(tessDataPath, "ara", EngineMode.Default))
                                    {
                                        using (var bitmap = pdfDoc.Render(i, 150, 150, PdfiumViewer.PdfRenderFlags.CorrectFromDpi))
                                        {
                                            string tempImgPath = Path.Combine(uploadsFolder, $"page_{i}_{Guid.NewGuid()}.png");
                                            bitmap.Save(tempImgPath, System.Drawing.Imaging.ImageFormat.Png);

                                            using (var pix = Tesseract.Pix.LoadFromFile(tempImgPath))
                                            {
                                                using (var ocrPage = localEngine.Process(pix))
                                                {
                                                    pageTexts[i] = ocrPage.GetText();
                                                }
                                            }

                                            if (System.IO.File.Exists(tempImgPath))
                                            {
                                                System.IO.File.Delete(tempImgPath);
                                            }
                                        }
                                    }
                                });

                                extractedText = string.Join("\n", pageTexts);
                            }
                        }
                    }
                    catch (Exception ocrEx)
                    {
                        return StatusCode(500, new { message = "OCR Processing Error: " + ocrEx.Message });
                    }
                }

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest(new { message = "Failed to extract readable text via OCR. Please check file format." });
                }

                string safeTextForAI = _privacyService.MaskSensitiveData(extractedText);
                var aiResult = await _aiService.AnalyzeContractTextAsync(safeTextForAI, language);

                if (aiResult == null)
                {
                    return StatusCode(500, new { message = "AI analysis failed." });
                }

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

                await newContract.Save();

                return Ok(new
                {
                    message = "Success",
                    contract = newContract,
                    aiAnalysis = aiResult
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server Exception: " + ex.Message });
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


        [HttpGet("stats")]
        public async Task<IActionResult> GetDeshboardStats()
        {
            var contracts = await clsContracts.GetAllContracts();
            var totalActive = contracts.Count();

            var pendingReview = 0;
            var riskFlagsCount = contracts.Count(c => c.RiskScore > 50);

            return Ok(new
            {
                totalActiveContracts = totalActive,
                pendingReview = pendingReview,
                riskFlag = riskFlagsCount
            });
        }


        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentContracts()
        {
            var contracts = await clsContracts.GetAllContracts();

            if (contracts == null || !contracts.Any())
            {
                return NotFound(new { message = "No contracts found." });
            }


            var recentContracts = contracts.OrderByDescending(c => c.UploadDate)
                 .Take(10).ToList();
            return Ok(recentContracts);
        }


        [HttpPost("Chat")]
        public async Task<IActionResult> ChatWithContract([FromBody] ChatRequestDto request)
        {

            try
            {
                // 1. جلب العقد من قاعدة البيانات باستخدام ContractId
                var contract = await clsContracts.Find(request.ContractId);
                if (contract == null)
                {
                    return NotFound(new { message = "Contract not found." });
                }

                // 2. تعقيم نص العقد حماية للخصوصية
                string safeContractText = _privacyService.MaskSensitiveData(contract.ExtractedText);

                // 3. جلب آخر سجلات المحادثة السابقة من جدول ChatHistory لضمان استمرار السياق
                // 1. جلب كافة رسائل المحادثة الخاصة بهذا العقد على شكل قائمة
                var previousChatRecords = await clsChatHistory.GetChatHistoryByContractId(request.ContractId); 

                // 2. تحويلها إلى قائمة من نوع ChatMessageItemModel (التي أنشأناها سابقاً لـ OpenAI)
                var previousMessagesForAI = previousChatRecords.Select(r => new ChatMessageItemModel
                {
                    Sender = r.Sender,
                    MessageText = r.MessageText
                }).ToList();

                // 4. استدعاء OpenAI للحصول على الإجابة
                string aiResponse = await _aiService.ChatWithContractAsync(safeContractText, request.UserQuery, previousMessagesForAI, request.Language);

                // 5. حفظ سؤال المستخدم في جدول ChatHistory
                var userMessageLog = new clsChatHistory
                {
                    ContractId = request.ContractId,
                    Sender = "User",
                    MessageText = request.UserQuery,
                    Timestamp = DateTime.Now
                };
                await userMessageLog.Save();

                // 6. حفظ إجابة المساعد الذكي في جدول ChatHistory
                var aiMessageLog = new clsChatHistory
                {
                    ContractId = request.ContractId,
                    Sender = "Assistant",
                    MessageText = aiResponse,
                    Timestamp = DateTime.Now
                };
                await aiMessageLog.Save();


               var fileName = contract.FileName?.Length > 60
                  ? contract.FileName.Substring(0, 60) + "..."
                  : contract.FileName;
                var auditLog = new clsAuditLogs
                {
                    UserId = contract.UserId,
                    Action = $"AI_CHAT / {fileName}",

                    Timestamp = DateTime.Now
                };
                await auditLog.Save();

                return Ok(new
                {
                    success = true,
                    response = aiResponse
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during the chat.", error = ex.Message });
            }
        }


        [HttpGet("History/{contractId}")]
        public async Task<IActionResult> GetChatHistoryByContractId(int contractId)
        {

            var chatHistoryList = await clsChatHistory.GetChatHistoryByContractId(contractId);

            if (chatHistoryList == null || !chatHistoryList.Any())
            {
                return Ok(new List<object>()); 
            }

            return Ok(chatHistoryList);
        }
    }
}