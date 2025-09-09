import { dbPool } from "../config/database.js";
import ProvinceModel from "../models/ProvinceModel.js";
import CityModel from "../models/CityModel.js";

export default {

    async getAllProvinces(){

        const connection = await dbPool.getConnection();

        try {
            const result =  await ProvinceModel.getAllProvinces(connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },
    async getCitiesByProvinceID(filter){
        const connection = await dbPool.getConnection();

        try {
            const result = await CityModel.getCitiesByProvinceID(filter, connection);

            return result;
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    }

    
}