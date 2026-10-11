using ContractMind.BLL;
using ContractMindModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
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

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
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
    }
}