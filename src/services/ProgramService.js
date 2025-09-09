import { dbPool } from "../config/database.js";
import ProgramModel from "../models/ProgramModel.js";

export default {

    async getAllPrograms(){

        const connection = await dbPool.getConnection();

        try {
            const result =  await ProgramModel.getAllPrograms(connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    }

    
}