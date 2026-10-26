using ContractMind.BLL;
using ContractMindModel;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAngular")]
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


       
        [HttpGet("{id}")]
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

        [HttpPut("{id}")]
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

      
        [HttpDelete("{id}")]
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