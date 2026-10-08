
using ContractMindModel; 

public class clsUsers
{
    public enum enMode { addNew = 0, update = 1 }
    public enMode Mode = enMode.addNew;

 
    public userModel Model { get; set; }

    public int UserId
    {
        get => Model.UserId;
        set => Model.UserId = value;
    }

    public string FullName
    {
        get => Model.FullName;
        set => Model.FullName = value;
    }

    public string Email
    {
        get => Model.Email;
        set => Model.Email = value;
    }

    public string PasswordHash
    {
        get => Model.PasswordHash;
        set => Model.PasswordHash = value;
    }

    public string Role
    {
        get => Model.Role;
        set => Model.Role = value;
    }

    public DateTime? CreatedAt
    {
        get => Model.CreatedAt;
        set => Model.CreatedAt = value;
    }

    public clsUsers()
    {
        this.Model = new userModel
        {
            UserId = -1,
            FullName = string.Empty,
            Email = string.Empty,
            PasswordHash = string.Empty,
            Role = string.Empty,
            CreatedAt = null
        };
        this.Mode = enMode.addNew;
    }

    private clsUsers(userModel model)
    {
        this.Model = model;
        this.Mode = enMode.update;
    }

    private async Task<bool> _AddNewUsers()
    {
        int? newId = await clsUsersData.AddNewUsers(this.FullName, this.Email, this.PasswordHash, this.Role, this.CreatedAt ?? DateTime.Now);
        if (newId.HasValue)
        {
            this.UserId = newId.Value;
        }
        return (this.UserId != -1);
    }

    private async Task<bool> _UpdateUsers()
    {
        return await clsUsersData.UpdateUsers(this.UserId, this.FullName, this.Email, this.PasswordHash, this.Role, this.CreatedAt ?? DateTime.Now) ?? false;
    }

    public async Task<bool> Save()
    {
        switch (Mode)
        {
            case enMode.addNew:
                Mode = enMode.update;
                return await _AddNewUsers();
            case enMode.update:
                return await _UpdateUsers();
        }
        return false;
    }

    public static async Task<bool> Delete(int userId)
    {
        return await clsUsersData.DeleteUsers(userId);
    }

    public static async Task<clsUsers> Find(int userId)
    {
        userModel model = await clsUsersData.FindByID(userId);
        if (model != null)
            return new clsUsers(model);

        return null;
    }

    public static async Task<List<userModel>> GetAllUsers()
    {
        return await clsUsersData.GetAllUsers();
    }
}