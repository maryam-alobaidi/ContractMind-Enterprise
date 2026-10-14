using ContractMind.BLL;
using ContractMind.BLL.Services;
using ContractMindModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto.Generators;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ContractMind.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;

        public AuthController(IConfiguration configuration,IEmailSender emailSender)
        {
            _configuration = configuration;
            _emailSender = emailSender;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid user data." });
            }

            var users = await clsUsers.GetAllUsers();
            if (users == null)
            {
                return BadRequest(new { message = "No users found" });
            }

            var user = users.FirstOrDefault(u => u.Email == model.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid user data." });
            }


            bool isPasswordValid = clsPasswordHelper.VerifyPassword(user.PasswordHash, model.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid user data." });
            }

            return Ok(new
            {
                message = "Login successful.",
                token = GenerateJwtToken(user),
                user = new
                {
                    id = user.UserId,
                    name = user.FullName,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        private string GenerateJwtToken(dynamic user)
        {
            var secretKey = _configuration["JwtSettings:Secret"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Secret is not configured in User Secrets or AppSettings.");
            }

            var key = Encoding.UTF8.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] forgotPasswordDto model)
        {
            if (string.IsNullOrEmpty(model.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var user=await clsUsers.FindByEmailAsync(model.Email);

            if (user==null)
            {
                return Ok(new { message = "If your email is registered, you will receive a password reset link." });
            }



          
            var resetToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"); 
            var tokenExpires = DateTime.UtcNow.AddHours(1); 

           
            await clsUsers.SavePasswordResetToken(model.Email, resetToken, tokenExpires);


            var resetLink = $"http://localhost:4200/reset-password?email={Uri.EscapeDataString(model.Email)}&token={Uri.EscapeDataString(resetToken)}";

            //send email
            var subject = "ContractMind - Password Reset Request";
            var message = $"<h3>Reset Your Password</h3><p>Click the link below to reset your password:</p><p><a href='{resetLink}'>Reset Password</a></p>";

            await _emailSender.SendEmailAsync(model.Email, subject, message);

            return Ok(new { message = "If your email is registered, you will receive a password reset link." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var user = await clsUsers.FindByEmailAsync(model.Email);

            if (user == null || user.ResetToken != model.Token || user.ResetTokenExpires < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired password reset token." });
            }


            string newPasswordHash = clsPasswordHelper.HashPassword(model.NewPassword);

         
            await clsUsersData.ResetPasswordAsync(model.Email, newPasswordHash);

            return Ok(new { message = "Password has been successfully reset." });
        }
    }
}