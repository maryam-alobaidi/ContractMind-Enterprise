
using ContractMindModel; 
public class clsContracts
{
    public enum enMode { addNew = 0, update = 1 }
    public enMode Mode = enMode.addNew;

    // استخدام الـ Model لتخزين البيانات مباشرة
    public contractsModel Model { get; set; }

    public int ContractId
    {
        get => Model.ContractId;
        set => Model.ContractId = value;
    }

    public int UserId
    {
        get => Model.UserId ?? -1;
        set => Model.UserId = value;
    }

    public string FileName
    {
        get => Model.FileName;
        set => Model.FileName = value;
    }

    public string FilePath
    {
        get => Model.FilePath;
        set => Model.FilePath = value;
    }

    public string ExtractedText
    {
        get => Model.ExtractedText;
        set => Model.ExtractedText = value;
    }

    public string Summary
    {
        get => Model.Summary;
        set => Model.Summary = value;
    }

    public decimal? RiskScore
    {
        get => Model.RiskScore ?? -1;
        set => Model.RiskScore = value;
    }

    public DateTime? UploadDate
    {
        get => Model.UploadDate;
        set => Model.UploadDate = value;
    }

    // Constructor للإضافة الجديدة
    public clsContracts()
    {
        this.Model = new contractsModel
        {
            ContractId = -1,
            UserId = -1,
            FileName = string.Empty,
            FilePath = string.Empty,
            ExtractedText = string.Empty,
            Summary = string.Empty,
            RiskScore = -1,
            UploadDate = null
        };
        this.Mode = enMode.addNew;
    }

    // Constructor خاص للتحديث (يستقبل المودل جاهزاً)
    private clsContracts(contractsModel model)
    {
        this.Model = model;
        this.Mode = enMode.update;
    }

    private async Task<bool> _AddNewContracts()
    {
        int? newId = await clsContractsData.AddNewContracts(this.UserId, this.FileName, this.FilePath, this.ExtractedText, this.Summary, this.RiskScore ?? 0, this.UploadDate ?? DateTime.Now);
        if (newId.HasValue)
        {
            this.ContractId = newId.Value;
        }
        return (this.ContractId != -1);
    }

    private async Task<bool> _UpdateContracts()
    {
        return await clsContractsData.UpdateContracts(this.ContractId, this.UserId, this.FileName, this.FilePath, this.ExtractedText, this.Summary, this.RiskScore ?? 0, this.UploadDate ?? DateTime.Now) ?? false;
    }

    public async Task<bool> Save()
    {
        switch (Mode)
        {
            case enMode.addNew:
                Mode = enMode.update;
                return await _AddNewContracts();
            case enMode.update:
                return await _UpdateContracts();
        }
        return false;
    }

    public static async Task<bool> Delete(int contractId)
    {
        return await clsContractsData.DeleteContracts(contractId);
    }

    public static async Task<clsContracts> Find(int contractId)
    {
        contractsModel model = await clsContractsData.FindByID(contractId);
        if (model != null)
            return new clsContracts(model);

        return null;
    }

    public static async Task<List<contractsModel>> GetAllContracts()
    {
        return await clsContractsData.GetAllContracts();
    }
}