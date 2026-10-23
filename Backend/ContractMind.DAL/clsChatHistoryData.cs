using ContractMind.DAL;
using ContractMindModel;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Reflection;


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
      

            SqlParameter idParam = new SqlParameter("@NewAddClass", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(idParam);


            return await clsPrimaryFunctions.Add(command);
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


    public static async Task<List<chatHistoryModel>> GetChatHistoryByContractId(int contractId)
    {
 
        var chatHistoryList = new List<chatHistoryModel>();

        using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
        {
            using (SqlCommand command = new SqlCommand("sp_GetChatHistoryByContractId", connection))
            {
                // تحديد نوع الأمر بأنه Stored Procedure
                command.CommandType = CommandType.StoredProcedure;

                // تمرير البارامتر
                command.Parameters.AddWithValue("@ContractId", contractId);

                await connection.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        chatHistoryList.Add(new chatHistoryModel
                        {
                            MessageId = reader.GetInt64(reader.GetOrdinal("MessageId")),
                            ContractId = reader.GetInt32(reader.GetOrdinal("ContractId")),
                            Sender = reader.GetString(reader.GetOrdinal("Sender")),
                            MessageText = reader.GetString(reader.GetOrdinal("MessageText")),
                            Timestamp = reader.GetDateTime(reader.GetOrdinal("Timestamp"))
                        });
                    }
                }
            }
        }

        return chatHistoryList;
    }
}