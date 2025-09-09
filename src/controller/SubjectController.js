import SubjectService from "../services/SubjectService.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const getSubjectList = async (req, res) => {
    
    try {

        const data = await SubjectService.getSubjectList();
    
        res.json(data)   
    } catch (error) {
        HandleError(error, res);
    }
};