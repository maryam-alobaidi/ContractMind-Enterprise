using ContractMind.BLL;
using ContractMindModel;
using Microsoft.AspNetCore.Mvc;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        
        [HttpGet()]
        public async Task<IActionResult> GetAllUsers()
        {
            List<userModel> users = await clsUsers.GetAllUsers();

            if (users == null || !users.Any())
            {
                return NotFound(new { message = "No users found." });
            }

           
            foreach (var u in users)
            {
                u.PasswordHash = string.Empty;
            }

            return Ok(users);
        }

        
        [HttpGet("id")]
        public async Task<IActionResult> GetUserById(int id)
        {
            clsUsers user = await clsUsers.Find(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} was not found." });
            }

            var model = user.Model;
            model.PasswordHash = string.Empty; 

            return Ok(model);
        }

        
        [HttpPost()]
        public async Task<IActionResult> CreateUser([FromBody] userModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.PasswordHash))
            {
                return BadRequest(new { message = "Invalid user data. Email and password are required." });
            }

            // التحقق من صحة الـ Role
            string normalizedRole = NormalizeRole(model.Role);

            clsUsers newUser = new clsUsers
            {
                FullName = model.FullName,
                Email = model.Email.Trim().ToLower(),
                PasswordHash = clsPasswordHelper.HashPassword(model.PasswordHash),
                Role = normalizedRole,
                CreatedAt = model.CreatedAt ?? DateTime.UtcNow
            };

            bool isSaved = await newUser.Save();
            if (!isSaved)
            {
                return StatusCode(500, new { message = "An error occurred while saving the user." });
            }

            var responseModel = newUser.Model;
            responseModel.PasswordHash = string.Empty;

            return CreatedAtAction(nameof(GetUserById), new { id = newUser.UserId }, responseModel);
        }

        
        [HttpPut("id")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] userModel model)
        {
            var userFound = await clsUsers.Find(id);
            if (userFound == null)
            {
                return NotFound(new { message = $"User with ID {id} was not found." });
            }

            userFound.FullName = model.FullName;
            userFound.Email = model.Email.Trim().ToLower();
            userFound.Role = NormalizeRole(model.Role);

            // تشفير كلمة المرور فقط إذا تم تمرير كلمة مرور جديدة
            if (!string.IsNullOrWhiteSpace(model.PasswordHash))
            {
                userFound.PasswordHash = clsPasswordHelper.HashPassword(model.PasswordHash);
            }

            bool isUpdated = await userFound.Save();
            if (!isUpdated)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user." });
            }

            var updatedModel = userFound.Model;
            updatedModel.PasswordHash = string.Empty;

            return Ok(new { message = "User updated successfully.", data = updatedModel });
        }

        [HttpDelete("id")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            clsUsers user = await clsUsers.Find(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} was not found." });
            }

            bool isDeleted = await clsUsers.Delete(id);
            if (!isDeleted)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the user." });
            }

            return Ok(new { message = "User deleted successfully." });
        }

        
        private string NormalizeRole(string role)
        {
            if (string.IsNullOrWhiteSpace(role)) return "User";

            switch (role.Trim().ToLower())
            {
                case "admin":
                    return "Admin";
                case "manager":
                    return "Manager";
                default:
                    return "User";
            }
        }
    }
}