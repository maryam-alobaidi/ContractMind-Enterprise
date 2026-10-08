

namespace ContractMindModel
{
    public class chatHistoryModel
    {
        public long MessageId { get; set; }          
        public int? ContractId { get; set; }         
        public string Sender { get; set; }      //user or ai     
        public string MessageText { get; set; }      
        public DateTime? Timestamp { get; set; }
    }
}
