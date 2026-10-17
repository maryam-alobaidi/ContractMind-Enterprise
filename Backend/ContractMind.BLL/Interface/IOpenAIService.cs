using ContractMindModel;


namespace ContractMind.BLL.Interface
{
    public interface IOpenAIService
    {
        Task<AiAnalysisResultModel> AnalyzeContractTextAsync(string contractText, string language = "en");
    }
}
