
namespace ContractMindModel
{
    public class ChatRequestDto
    {
        public int ContractId { get; set; }
        public string UserQuery { get; set; } = string.Empty;
        public string Language { get; set; } = "en";
    }
}
