import { dbPool } from "../config/database.js";
import CapabilityModel from "../models/CapabilityModel.js";

export default {

    async getAllCapabilities(){

        const connection = await dbPool.getConnection();

        try {
            const result =  await CapabilityModel.getAllCapabilities(connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    }

    
}