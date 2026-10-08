using ContractMindModel;

namespace ContractMind.BLL
{
    public class clsAuditLogs
    {
        public enum enMode { addNew = 0, update = 1 }
        public enMode Mode = enMode.addNew;

        public int LogId { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; }
        public DateTime? Timestamp { get; set; }

        public clsAuditLogs()
        {
            this.LogId = -1;
            this.UserId = null;
            this.Action = string.Empty;
            this.Timestamp = null;
            this.Mode = enMode.addNew;
        }

     
        private clsAuditLogs(auditLogsModel model)
        {
            this.LogId = model.LogId;
            this.UserId = model.UserId;
            this.Action = model.Action;
            this.Timestamp = model.Timestamp;
            this.Mode = enMode.update;
        }

  
        private async Task<bool> _AddNewAuditLogs()
        {
            int? newId = await clsAuditLogsData.AddNewAuditLogs(this.UserId ?? 0, this.Action, this.Timestamp ?? DateTime.Now);
            this.LogId = newId ?? -1;
            return (this.LogId != -1);
        }


        private async Task<bool?> _UpdateAuditLogs()
        {
            bool? isUpdated = await clsAuditLogsData.UpdateAuditLogs(this.LogId, this.UserId ?? 0, this.Action, this.Timestamp ?? DateTime.Now);
            return isUpdated;
        }


        public static async Task<bool> Delete(int logId)
        {
            return await clsAuditLogsData.DeleteAuditLogs(logId);
        }


        public static async Task<clsAuditLogs> Find(int logId)
        {
            auditLogsModel model = await clsAuditLogsData.FindByID(logId);
            if (model != null)
            {
                return new clsAuditLogs(model);
            }
            return null;
        }

        public static async Task<List<auditLogsModel>> GetAllAuditLogs()
        {
            return await clsAuditLogsData.GetAllAuditLogs();
        }


        public async Task<bool> Save()
        {
            switch (Mode)
            {
                case enMode.addNew:
                    if (await _AddNewAuditLogs())
                    {
                        Mode = enMode.update; 
                        return true;
                    }
                    return false;

                case enMode.update:
                    return await _UpdateAuditLogs() ?? false;
            }
            return false;
        }
    }
}