using Microsoft.Data.SqlClient;
using System.Data;



namespace ContractMind.DAL
{
    public static class clsPrimaryFunctions
    {

        public static async Task<int?> Add(SqlCommand command)
        {
            using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
            {
                command.Connection = connection;
                try
                {
                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    SqlParameter outParam = command.Parameters
                        .Cast<SqlParameter>()
                        .FirstOrDefault(p => p.Direction == ParameterDirection.Output);

                    if (outParam != null && outParam.Value != null && outParam.Value != DBNull.Value)
                    {
                        return Convert.ToInt32(outParam.Value);
                    }
                }
                catch (Exception ex)
                {
                    EntireInfoToEventLoge(ex.Message);
                }
            }
            return null;
        }


        public static async Task<bool?> Update(SqlCommand command)
        {
            using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
            {
                command.Connection = connection;
                try
                {
                    await connection.OpenAsync();
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
                catch (Exception ex)
                {
                    EntireInfoToEventLoge(ex.Message);
                    return false;
                }
            }
        }

        public static async Task<bool> Delete(SqlCommand command)
        {
            using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
            {
                command.Connection = connection;
                try
                {
                    await connection.OpenAsync();
                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
                catch (Exception ex)
                {
                    EntireInfoToEventLoge(ex.Message);
                    return false;
                }
            }
        }

        
        public static async Task<List<T>> GetListAsync<T>(SqlCommand command, Func<SqlDataReader, T> mapFunc)
        {
            var list = new List<T>();
            using (SqlConnection connection = new SqlConnection(clsSetting.ConnectionString))
            {
                command.Connection = connection;
                try
                {
                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(mapFunc(reader));
                        }
                    }
                }
                catch (Exception ex)
                {
                    EntireInfoToEventLoge(ex.Message);
                }
            }
            return list;
        }


        public static void EntireInfoToEventLoge(string errorMessage)
        {
            try
            {
                // تحديد مسار مجلد السجلات داخل مشروعك
                string logDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");

                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }


                string filePath = Path.Combine(logDirectory, $"ErrorLog_{DateTime.Now:yyyy-MM-dd}.txt");


                string logMessage = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] ERROR: {errorMessage}{Environment.NewLine}";


                File.AppendAllText(filePath, logMessage);
            }
            catch (Exception ex)
            {

                Console.WriteLine($"[FATAL LOGGING ERROR]: {ex.Message} | Original Error: {errorMessage}");
            }
        }
    }
}