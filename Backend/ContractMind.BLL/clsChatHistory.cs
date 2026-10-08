using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ContractMindModel;

public class clsChatHistory
{
    public enum enMode { addNew = 0, update = 1 }
    public enMode Mode = enMode.addNew;

    
    public chatHistoryModel Model { get; set; }

    public long MessageId
    {
        get => Model.MessageId;
        set => Model.MessageId = value;
    }
    public int? ContractId
    {
        get => Model.ContractId;
        set => Model.ContractId = value;
    }
    public string Sender
    {
        get => Model.Sender;
        set => Model.Sender = value;
    }
    public string MessageText
    {
        get => Model.MessageText;
        set => Model.MessageText = value;
    }
    public DateTime? Timestamp
    {
        get => Model.Timestamp;
        set => Model.Timestamp = value;
    }


    public clsChatHistory()
    {
        this.Model = new chatHistoryModel
        {
            MessageId = -1,
            ContractId = -1,
            Sender = string.Empty,
            MessageText = string.Empty,
            Timestamp = null
        };
        this.Mode = enMode.addNew;
    }


    private clsChatHistory(chatHistoryModel model)
    {
        this.Model = model;
        this.Mode = enMode.update;
    }

    private async Task<bool> _AddNewChatHistory()
    {
        long? newId = await clsChatHistoryData.AddNewChatHistory(this.ContractId ?? 0, this.Sender, this.MessageText, this.Timestamp ?? DateTime.Now);
        if (newId.HasValue)
        {
            this.MessageId = newId.Value;
        }
        return (this.MessageId != -1);
    }

    private async Task<bool> _UpdateChatHistory()
    {
        return await clsChatHistoryData.UpdateChatHistory(this.MessageId, this.ContractId ?? 0, this.Sender, this.MessageText, this.Timestamp ?? DateTime.Now) ?? false;
    }

    public async Task<bool> Save()
    {
        switch (Mode)
        {
            case enMode.addNew:
                Mode = enMode.update;
                return await _AddNewChatHistory();
            case enMode.update:
                return await _UpdateChatHistory();
        }
        return false;
    }

    public static async Task<bool> Delete(long messageId)
    {
        return await clsChatHistoryData.DeleteChatHistory(messageId);
    }

    public static async Task<clsChatHistory> FindByID(long messageId)
    {
        chatHistoryModel model = await clsChatHistoryData.FindByID(messageId);
        if (model != null)
            return new clsChatHistory(model);

        return null;
    }

    public static async Task<List<chatHistoryModel>> GetAllChatHistory()
    {
        return await clsChatHistoryData.GetAllChatHistory();
    }
}