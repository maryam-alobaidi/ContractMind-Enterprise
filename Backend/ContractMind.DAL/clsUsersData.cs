using ContractMind.DAL;
using ContractMindModel;
using Microsoft.Data.SqlClient;
using System.Data;

public static class clsUsersData
{
    public static async Task<int?> AddNewUsers(string fullName, string email, string passwordHash, string role, DateTime createdAt)
    {
        using (SqlCommand command = new SqlCommand("Sp_AddNewUsers"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@FullName", fullName);
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", passwordHash);
            command.Parameters.AddWithValue("@Role", role);
            command.Parameters.AddWithValue("@CreatedAt", createdAt);

            SqlParameter idParam = new SqlParameter("@NewAddClass", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(idParam);

            return await clsPrimaryFunctions.Add(command);
        }
    }

    public static async Task<bool> DeleteUsers(int userId)
    {
        using (SqlCommand command = new SqlCommand("Sp_DeleteUsers"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserId", userId);
            return await clsPrimaryFunctions.Delete(command);
        }
    }

    public static async Task<bool?> UpdateUsers(int userId, string fullName, string email, string passwordHash, string role, DateTime createdAt)
    {
        using (SqlCommand command = new SqlCommand("Sp_UpdateUsers"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserId", userId);
            command.Parameters.AddWithValue("@FullName", fullName);
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", passwordHash);
            command.Parameters.AddWithValue("@Role", role);
            command.Parameters.AddWithValue("@CreatedAt", createdAt);

            return await clsPrimaryFunctions.Update(command);
        }
    }

    public static async Task<List<userModel>> GetAllUsers()
    {
        using (SqlCommand command = new SqlCommand("Sp_GetAllUsers"))
        {
            command.CommandType = CommandType.StoredProcedure;

            return await clsPrimaryFunctions.GetListAsync<userModel>(command, reader => new userModel
            {
                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : -1,
                FullName = reader["FullName"] != DBNull.Value ? reader["FullName"].ToString() : string.Empty,
                Email = reader["Email"] != DBNull.Value ? reader["Email"].ToString() : string.Empty,
                PasswordHash = reader["PasswordHash"] != DBNull.Value ? reader["PasswordHash"].ToString() : string.Empty,
                Role = reader["Role"] != DBNull.Value ? reader["Role"].ToString() : string.Empty,
                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : null,
                ResetToken = reader["ResetToken"] != DBNull.Value ? reader["ResetToken"].ToString() : null,
                ResetTokenExpires = reader["ResetTokenExpires"] != DBNull.Value ? Convert.ToDateTime(reader["ResetTokenExpires"]) : null
            });
        }
    }

    public static async Task<userModel> FindByID(int userId)
    {
        userModel model = null;
        using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
        {
            using (SqlCommand command = new SqlCommand("Sp_GetUsersByID", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserId", userId);
                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            model = new userModel
                            {
                                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : -1,
                                FullName = reader["FullName"] != DBNull.Value ? reader["FullName"].ToString() : string.Empty,
                                Email = reader["Email"] != DBNull.Value ? reader["Email"].ToString() : string.Empty,
                                PasswordHash = reader["PasswordHash"] != DBNull.Value ? reader["PasswordHash"].ToString() : string.Empty,
                                Role = reader["Role"] != DBNull.Value ? reader["Role"].ToString() : string.Empty,
                                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : null,
                                ResetToken = reader["ResetToken"] != DBNull.Value ? reader["ResetToken"].ToString() : null,
                                ResetTokenExpires = reader["ResetTokenExpires"] != DBNull.Value ? Convert.ToDateTime(reader["ResetTokenExpires"]) : null
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

    public static async Task<userModel> FindByEmailAsync(string email)
    {
        userModel model = null;
        using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
        {
            using (SqlCommand command = new SqlCommand("Sp_GetUserByEmail", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@Email", email);
                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            model = new userModel
                            {
                                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : -1,
                                FullName = reader["FullName"] != DBNull.Value ? reader["FullName"].ToString() : string.Empty,
                                Email = reader["Email"] != DBNull.Value ? reader["Email"].ToString() : string.Empty,
                                PasswordHash = reader["PasswordHash"] != DBNull.Value ? reader["PasswordHash"].ToString() : string.Empty,
                                Role = reader["Role"] != DBNull.Value ? reader["Role"].ToString() : string.Empty,
                                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : null,
                                ResetToken = reader["ResetToken"] != DBNull.Value ? reader["ResetToken"].ToString() : null,
                                ResetTokenExpires = reader["ResetTokenExpires"] != DBNull.Value ? Convert.ToDateTime(reader["ResetTokenExpires"]) : null
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


    public static async Task<bool> SavePasswordResetToken(string email, string resetToken, DateTime resetTokenExpires)
    {
        using (SqlCommand command = new SqlCommand("Sp_UpdatePasswordResetToken"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@ResetToken", resetToken);
            command.Parameters.AddWithValue("@ResetTokenExpires", resetTokenExpires);

            return await clsPrimaryFunctions.Update(command) ?? false;
        }
    }

    public static async Task<bool> ResetPasswordAsync(string email, string newPasswordHash)
    {
        using (SqlCommand command = new SqlCommand("Sp_ResetPassword"))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", newPasswordHash);

            return await clsPrimaryFunctions.Update(command) ?? false;
        }
    }
}