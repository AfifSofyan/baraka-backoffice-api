import { dbPool } from "../config/database.js";
import NotificationModel from "../models/NotificationModel.js";

export default {

    async createNotification(data){
        const connection = await dbPool.getConnection();

        try {
            const result =  await NotificationModel.createNotification(data, connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getUnreadNotifications(filter){

        const connection = await dbPool.getConnection();

        try {
            const result =  await NotificationModel.getUnreadNotifications(filter, connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getAllNotifications(filter, page, perPage){

        const connection = await dbPool.getConnection();

        try {
            const result =  await NotificationModel.getAllNotifications(filter, page, perPage, connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getNotificationDetail(filter){
        const connection = await dbPool.getConnection();

        try {
            const result =  await NotificationModel.getNotificationDetail(filter, connection);
    
            return result;   
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },
    
    async markNotificationAsRead(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const affectedNotificationRows = await  NotificationModel.markNotificationAsRead(id, connection)            

            if(affectedNotificationRows === 1){

                connection.commit()

                return {
                    message:"Notification has been marked as read",
                    data: {
                        NotificationID : id
                    }
                }
            }else{
                throw new NotFound("Data notifikasi yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },

    async markAllNotificationsAsRead(filter){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const affectedNotificationRows = await  NotificationModel.markAllNotificationsAsRead(filter, connection)            

            if(affectedNotificationRows > 0){

                connection.commit()

                return {
                    message:"All notification has been marked as read",
                }
            }else{
                throw new NotFound("Data notifikasi yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },
}