import { dbPool } from "../config/database.js"
import AdminModel from "../models/AdminModel.js"
import UserModel from "../models/UserModel.js"
import FilterParams from "../utils/requests/filterParams.js"
import NotFound from "../utils/errors/NotFound.js"
import InternalServer from "../utils/errors/InternalServer.js"

export default {

    async getAdminDetailByUserID(filter){
        const connection = await dbPool.getConnection()

        try {
            const result = await AdminModel.getAdminDetailByUserID(filter, connection)

            return {
                message: "Get Admin Detail Successfully",
                data: result,
            }

        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getAdminList(){
        const connection = await dbPool.getConnection()

        try {
            const data = await UserModel.getAdmins(connection)

            return {
                statusCode: 200,
                message: "Get admin list successfully",
                data: data
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async updateAdminByUserID(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const filter = new FilterParams()
            filter.adminID = id

            const affectedAdminRows = await AdminModel.updateAdminByUserID(data, id, connection)            

            if(affectedAdminRows === 1){

                connection.commit()

                return {
                    message:"Update Admin Succesfully",
                    data: {
                        AdminID : id
                    }
                }
            }else{
                throw new NotFound("Data admin yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    
}