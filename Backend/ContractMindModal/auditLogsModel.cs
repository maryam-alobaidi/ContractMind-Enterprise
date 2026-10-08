
namespace ContractMindModel
{
    public class auditLogsModel
    {
        public int LogId { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; } //  Uploaded Contract, Deleted File
        public DateTime? Timestamp { get; set; }
    }
}
