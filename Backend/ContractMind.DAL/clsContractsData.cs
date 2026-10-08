using ContractMind.DAL;
using ContractMindModel;
using Microsoft.Data.SqlClient;

using System.Data;


public static class clsContractsData
{
    public static async Task<int?> AddNewContracts(int userId, string fileName, string filePath, string extractedText, string summary, decimal riskScore, DateTime uploadDate)
    {
        using (SqlCommand command = new SqlCommand("Sp_AddNewContracts"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@FileName", fileName);
            command.Parameters.AddWithValue("@FilePath", filePath);
            command.Parameters.AddWithValue("@ExtractedText", extractedText);
            command.Parameters.AddWithValue("@Summary", (object)summary ?? DBNull.Value);
            command.Parameters.AddWithValue("@RiskScore", riskScore);
            command.Parameters.AddWithValue("@UploadDate", uploadDate);

            return await clsPrimaryFunctions.Add(command);
        }
    }

    public static async Task<bool> DeleteContracts(int contractId)
    {
        using (SqlCommand command = new SqlCommand("Sp_DeleteContracts"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@ContractId", contractId);
            return await clsPrimaryFunctions.Delete(command);
        }
    }

  
    public static async Task<List<contractsModel>> GetAllContracts()
    {
        using (SqlCommand command = new SqlCommand("Sp_GetAllContracts"))
        {
            command.CommandType = CommandType.StoredProcedure;

            return await clsPrimaryFunctions.GetListAsync<contractsModel>(command, reader => new contractsModel
            {
                ContractId = reader["ContractId"] != DBNull.Value ? Convert.ToInt32(reader["ContractId"]) : -1,
                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : null,
                FileName = reader["FileName"] != DBNull.Value ? reader["FileName"].ToString() : string.Empty,
                FilePath = reader["FilePath"] != DBNull.Value ? reader["FilePath"].ToString() : string.Empty,
                ExtractedText = reader["ExtractedText"] != DBNull.Value ? reader["ExtractedText"].ToString() : string.Empty,
                Summary = reader["Summary"] != DBNull.Value ? reader["Summary"].ToString() : string.Empty,
                RiskScore = reader["RiskScore"] != DBNull.Value ? Convert.ToInt32(reader["RiskScore"]) : null,
                UploadDate = reader["UploadDate"] != DBNull.Value ? Convert.ToDateTime(reader["UploadDate"]) : null
            });
        }
    }

 
    public static async Task<contractsModel> FindByID(int contractId)
    {
        contractsModel model = null;
        using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
        {
            using (SqlCommand command = new SqlCommand("Sp_GetContractsByID", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@ContractId", contractId);
                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            model = new contractsModel
                            {
                                ContractId = reader["ContractId"] != DBNull.Value ? Convert.ToInt32(reader["ContractId"]) : -1,
                                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : null,
                                FileName = reader["FileName"] != DBNull.Value ? reader["FileName"].ToString() : string.Empty,
                                FilePath = reader["FilePath"] != DBNull.Value ? reader["FilePath"].ToString() : string.Empty,
                                ExtractedText = reader["ExtractedText"] != DBNull.Value ? reader["ExtractedText"].ToString() : string.Empty,
                                Summary = reader["Summary"] != DBNull.Value ? reader["Summary"].ToString() : string.Empty,
                                RiskScore = reader["RiskScore"] != DBNull.Value ? Convert.ToInt32(reader["RiskScore"]) : null,
                                UploadDate = reader["UploadDate"] != DBNull.Value ? Convert.ToDateTime(reader["UploadDate"]) : null
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

    public static async Task<bool?> UpdateContracts(int contractId, int userId, string fileName, string filePath, string extractedText, string summary, decimal riskScore, DateTime uploadDate)
    {
        using (SqlCommand command = new SqlCommand("Sp_UpdateContracts"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@ContractId", contractId);
            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@FileName", fileName);
            command.Parameters.AddWithValue("@FilePath", filePath);
            command.Parameters.AddWithValue("@ExtractedText", extractedText);
            command.Parameters.AddWithValue("@Summary", (object)summary ?? DBNull.Value);
            command.Parameters.AddWithValue("@RiskScore", riskScore);
            command.Parameters.AddWithValue("@UploadDate", uploadDate);

            return await clsPrimaryFunctions.Update(command);
        }
    }
}