import CapabilityService from "../services/CapabilityService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getAllCapabilities = async (req, res) => {
    
    try {

        const data = await CapabilityService.getAllCapabilities();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};