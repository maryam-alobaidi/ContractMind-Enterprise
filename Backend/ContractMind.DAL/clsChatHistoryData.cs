using ContractMind.DAL;
using ContractMindModel;
using Microsoft.Data.SqlClient;
using System.Data;


public static class clsChatHistoryData
{
    public static async Task<long?> AddNewChatHistory(int contractId, string sender, string messageText, DateTime timestamp)
    {
        using (SqlCommand command = new SqlCommand("Sp_AddNewChatHistory"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@ContractId", contractId);
            command.Parameters.AddWithValue("@Sender", sender);
            command.Parameters.AddWithValue("@MessageText", messageText);
            command.Parameters.AddWithValue("@Timestamp", timestamp);

            int? result = await clsPrimaryFunctions.Add(command);
            return result.HasValue ? (long?)result.Value : null;
        }
    }

    public static async Task<bool> DeleteChatHistory(long messageId)
    {
        using (SqlCommand command = new SqlCommand("Sp_DeleteChatHistory"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@MessageId", messageId);
            return await clsPrimaryFunctions.Delete(command);
        }
    }

    // استخدام الدالة العامة لتجلب قائمة كاملة باستخدام chatHistoryModel
    public static async Task<List<chatHistoryModel>> GetAllChatHistory()
    {
        using (SqlCommand command = new SqlCommand("Sp_GetAllChatHistory"))
        {
            command.CommandType = CommandType.StoredProcedure;

            return await clsPrimaryFunctions.GetListAsync<chatHistoryModel>(command, reader => new chatHistoryModel
            {
                MessageId = reader["MessageId"] != DBNull.Value ? Convert.ToInt64(reader["MessageId"]) : -1,
                ContractId = reader["ContractId"] != DBNull.Value ? Convert.ToInt32(reader["ContractId"]) : -1,
                Sender = reader["Sender"] != DBNull.Value ? reader["Sender"].ToString() : string.Empty,
                MessageText = reader["MessageText"] != DBNull.Value ? reader["MessageText"].ToString() : string.Empty,
                Timestamp = reader["Timestamp"] != DBNull.Value ? Convert.ToDateTime(reader["Timestamp"]) : null
            });
        }
    }


    public static async Task<chatHistoryModel> FindByID(long messageId)
    {
        chatHistoryModel model = null;
        using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
        {
            using (SqlCommand command = new SqlCommand("Sp_GetChatHistoryByID", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@MessageId", messageId);
                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            model = new chatHistoryModel
                            {
                                MessageId = reader["MessageId"] != DBNull.Value ? Convert.ToInt64(reader["MessageId"]) : -1,
                                ContractId = reader["ContractId"] != DBNull.Value ? Convert.ToInt32(reader["ContractId"]) : -1,
                                Sender = reader["Sender"] != DBNull.Value ? reader["Sender"].ToString() : string.Empty,
                                MessageText = reader["MessageText"] != DBNull.Value ? reader["MessageText"].ToString() : string.Empty,
                                Timestamp = reader["Timestamp"] != DBNull.Value ? Convert.ToDateTime(reader["Timestamp"]) : null
                            };
                        }
                    }
                }
                catch (Exception ex)
                {
                    clsPrimaryFunctions.EntireInfoToEventLoge(ex.Message);
                }
            }
        }
        return model;
    }

    public static async Task<bool?> UpdateChatHistory(long messageId, int contractId, string sender, string messageText, DateTime timestamp)
    {
        using (SqlCommand command = new SqlCommand("Sp_UpdateChatHistory"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@MessageId", messageId);
            command.Parameters.AddWithValue("@ContractId", contractId);
            command.Parameters.AddWithValue("@Sender", sender);
            command.Parameters.AddWithValue("@MessageText", messageText);
            command.Parameters.AddWithValue("@Timestamp", timestamp);

            return await clsPrimaryFunctions.Update(command);
        }
    }
}