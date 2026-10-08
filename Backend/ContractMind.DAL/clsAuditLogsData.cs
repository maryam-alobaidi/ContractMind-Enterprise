using ContractMind.DAL;
using ContractMindModel;
using Microsoft.Data.SqlClient;
using System.Data;


public static class clsAuditLogsData
	{

	public static async Task<int?> AddNewAuditLogs(int UserId, string Action, DateTime Timestamp)
	{
		using(SqlCommand command = new SqlCommand("Sp_AddNewAuditLogs"))
			{
					command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserId", UserId);
                command.Parameters.AddWithValue("@Action", Action);
                command.Parameters.AddWithValue("@Timestamp", Timestamp);

				return await clsPrimaryFunctions.Add(command);
			}
		}

	public static async Task<bool> DeleteAuditLogs(int LogId ) 
	{
		using(SqlCommand command = new SqlCommand("Sp_DeleteAuditLogs"))
		{
			 command.CommandType = CommandType.StoredProcedure;
			 command.Parameters.AddWithValue("@LogId", LogId);
		return await clsPrimaryFunctions.Delete(command);
	}
	}

    public static async Task<List<auditLogsModel>> GetAllAuditLogs()
    {
        using (SqlCommand command = new SqlCommand("Sp_GetAllAuditLogs"))
        {
            command.CommandType = CommandType.StoredProcedure;

            return await clsPrimaryFunctions.GetListAsync<auditLogsModel>(command, reader => new auditLogsModel
            {
                LogId = reader["LogId"] != DBNull.Value ? Convert.ToInt32(reader["LogId"]) : -1,
                UserId = reader["UserId"] != DBNull.Value ? (int?)reader["UserId"] : null,
                Action = reader["Action"] != DBNull.Value ? reader["Action"].ToString() : string.Empty,
                Timestamp = reader["Timestamp"] != DBNull.Value ? (DateTime?)reader["Timestamp"] : null
            });
        }
    }

    public static async Task<auditLogsModel> FindByID(int LogId)
    {
        auditLogsModel model = null;

        using (SqlConnection connection = new SqlConnection("Server=.;Database=ContractMindDB;User ID=sa;Password=Haider2016"))
        {
            using (SqlCommand command = new SqlCommand("Sp_GetAuditLogsByID", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@LogId", LogId);

                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            model = new auditLogsModel
                            {
                                LogId = reader["LogId"] != DBNull.Value ? Convert.ToInt32(reader["LogId"]) : -1,
                                UserId = reader["UserId"] != DBNull.Value ? (int?)reader["UserId"] : null,
                                Action = reader["Action"] != DBNull.Value ? reader["Action"].ToString() : string.Empty,
                                Timestamp = reader["Timestamp"] != DBNull.Value ? (DateTime?)reader["Timestamp"] : null
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

public static async Task<bool?> UpdateAuditLogs(int LogId, int UserId, string Action, DateTime Timestamp)
	{
		using(SqlCommand command = new SqlCommand("Sp_UpdateAuditLogs"))
		{
		command.CommandType= CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@LogId", LogId);
                command.Parameters.AddWithValue("@UserId", UserId);
                command.Parameters.AddWithValue("@Action", Action);
                command.Parameters.AddWithValue("@Timestamp", Timestamp);

		return await clsPrimaryFunctions.Update(command);
		}
	}

}
