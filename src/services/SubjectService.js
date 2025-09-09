import { dbPool } from "../config/database.js";
import SubjectModel from "../models/SubjectModel.js";

export default {

    async getSubjectList(){

        const connection = await dbPool.getConnection();

        try {
            const result =  await SubjectModel.getSubjectList(connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    }

    
}