import DashboardService from "../services/DashboardService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getDashboardInformation = async (req, res) => {
    try {
        
        const data = await DashboardService.getDashboardInformation(req)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};