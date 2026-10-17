using ContractMind.BLL.Interface;
using ContractMindModel;
using Microsoft.Extensions.Configuration;
using OpenAI.Chat;
using System.Text.Json;

namespace ContractMind.BLL.Services
{
    public class OpenAIService : IOpenAIService
    {
        private readonly ChatClient _chatClient;

        public OpenAIService(IConfiguration configuration)
        {
            string apiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API Key is missing.");

            // استخدام نموذج gpt-4o-mini المتاح والسريع
            _chatClient = new ChatClient("gpt-4o-mini", apiKey);
        }

        public async Task<AiAnalysisResultModel> AnalyzeContractTextAsync(string contractText, string language = "en")
        {
            try
            {
                string targetLanguageName = language switch
                {
                    "es" => "Spanish (Español)",
                    "ar" => "Arabic (العربية)",
                    _ => "English"
                };

                string systemInstruction = $"Please analyze the legal contract. Respond EXCLUSIVELY in valid JSON format with exactly two keys: \"summary\" and \"riskScore\". IMPORTANT: The value of the \"summary\" key MUST be written strictly in {targetLanguageName}. The \"riskScore\" key must be a number from 0 to 100.";

                // إرسال التعليمات والطلب بشكل رسائل واضحة للنموذج
                var messages = new ChatMessage[]
                {
                    new SystemChatMessage(systemInstruction),
                    new UserChatMessage(contractText)
                };

                // إعداد الخيارات لضمان عودة البيانات بصيغة JSON حصرياً
                ChatCompletionOptions options = new ChatCompletionOptions()
                {
                    ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
                };

                ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, options);
                string responseJson = completion.Content[0].Text;

                // طباعة النتيجة الخام في الـ Console للمراقبة والتأكد
                Console.WriteLine("Raw OpenAI JSON Response: " + responseJson);

                responseJson = responseJson.Replace("```json", "").Replace("```", "").Trim();

                var result = JsonSerializer.Deserialize<AiAnalysisResultModel>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? new AiAnalysisResultModel { Summary = "Analysis failed", RiskScore = 0 };
            }
            catch (Exception ex)
            {
                Console.WriteLine("OpenAI Service Exception: " + ex.ToString());
                return new AiAnalysisResultModel { Summary = "Error during AI analysis: " + ex.Message, RiskScore = 0 };
            }
        }
    }
}