using ContractMindModel;


namespace ContractMind.BLL.Interface
{
    public interface IOpenAIService
    {
        Task<AiAnalysisResultModel> AnalyzeContractTextAsync(string contractText, string language = "en");

        Task<string> ChatWithContractAsync(string safeContractText, string userQuery, List<ChatMessageItemModel> previousMessages, string language = "en");
    }
}
