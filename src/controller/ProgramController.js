import ProgramService from "../services/ProgramService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getAllPrograms = async (req, res) => {
    
    try {

        const data = await ProgramService.getAllPrograms();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};