

namespace ContractMindModel
{
    public class contractsModel
    {
        public int ContractId { get; set; }
        public int? UserId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string ExtractedText { get; set; }
        public string? Summary { get; set; }
        public decimal? RiskScore { get; set; }= -1;
        public DateTime? UploadDate { get; set; }
    }
}
