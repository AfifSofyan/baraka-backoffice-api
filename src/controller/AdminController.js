import AdminService from "../services/AdminService.js";
import FilterParams from "../utils/requests/filterParams.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const updateAdmin = async (req, res) => {
    try {
        const data = await AdminService.updateAdmin(req.body, req.params['id']);

        res.json(data)
    } catch (error) {
        HandleError(error, res);
    }
};

export const getAdminDetailByUserID = async (req, res) => {
    try {
        const filter = new FilterParams()

        filter.userID = req.params['id']

        const data = await AdminService.getAdminDetailByUserID(filter)

        res.json(data)
    } catch (error) {
        HandleError(error, res)
    }
};