using Microsoft.AspNetCore.Identity;

namespace ContractMind.BLL
{
    public class clsPasswordHelper
    {

       private static readonly PasswordHasher<object> _passwordHasher = new PasswordHasher<object>();

        public static string HashPassword(string Password)
        {
            return _passwordHasher.HashPassword(null, Password);
        }

        public static bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            var result = _passwordHasher.VerifyHashedPassword(null, hashedPassword, providedPassword);
            return result==PasswordVerificationResult.Success;

        }


    }
}
