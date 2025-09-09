import ReportChangeLogService from "../services/ReportChangeLogService.js";
import AuthService from "../services/AuthService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getReportChangeLogs = async (req, res) => {
    
    try {
        const roleID = req.user.roleID
        await AuthService.isAuthorizedToAccess(roleID, "Log Perubahan")

        const filter = new FilterParams();

        filter.startDate = req.query.startDate;
        filter.endDate = req.query.endDate;
        filter.searchText = req.query.searchText;

        const page = req.query.page || 1;
        const perPage = req.query.perPage || 1000;

        const data = await ReportChangeLogService.getReportChangeLogs(filter, page, perPage);
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
}