using ContractMind.BLL;
using ContractMindModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace ContractMind.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            List<userModel> users = await clsUsers.GetAllUsers();

      
            if (users == null || !users.Any())
            {
                return NotFound(new { message = "No users found." });
            }
            return Ok(users);
        }

        [HttpGet("get-user-by-Id/{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            clsUsers user = await clsUsers.Find(id);
            if (user == null)
            {
                return NotFound(new { message = $"User with ID {id} was not found." });
            }
            return Ok(user.Model);
        }

        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] userModel model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Invalid user data." });
            }
           
            clsUsers newUser = new clsUsers
            {
                FullName = model.FullName,
                Email = model.Email,
                PasswordHash = clsPasswordHelper.HashPassword(model.PasswordHash),
                Role = model.Role,
                CreatedAt = model.CreatedAt ?? DateTime.UtcNow
            };

            bool isSaved = await newUser.Save();
            if (!isSaved)
            {
                return StatusCode(500, new { message = "An error occurred while saving the user." });
            }

            return CreatedAtAction(nameof(GetUserById), new { id = newUser.UserId }, newUser.Model);
        }

        [HttpDelete("delete-user/{id:int}")]
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

        [HttpPut("update-user/{id:int}")]
        public async Task<IActionResult> UpdateUser(int id,[FromBody] userModel model)
        {
            var userFound = await clsUsers.Find(id);
            if (userFound==null)
            {
                return NotFound(new { message = $"User with ID {id} was not found or could not be update." });
            }
            string hashPassword = clsPasswordHelper.HashPassword(model.PasswordHash);
            userFound.FullName = model.FullName;
            userFound.Email = model.Email;
            if (!string.IsNullOrEmpty(model.PasswordHash))
            {
                userFound.PasswordHash = clsPasswordHelper.HashPassword(model.PasswordHash);
            }
            userFound.Role = model.Role;

            bool isUpdated = await userFound.Save();
            if (!isUpdated)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user." });
            }

            return Ok(new { message = "User updated successfully.", data = userFound.Model });
        }
    }
}