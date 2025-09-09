import { dbPool } from "../config/database.js";
import TutorModel from "../models/TutorModel.js";
import ReportModel from "../models/ReportModel.js";
import ScheduleModel from "../models/ScheduleModel.js";
import PresenceReportNoteModel from "../models/PresenceReportNoteModel.js";
import PresenceScheduleNoteModel from "../models/PresenceScheduleNoteModel.js";
import DayModel from "../models/DayModel.js";
import FilterParams from "../utils/requests/filterParams.js";
import moment from "moment/moment.js";
import NotFound from "../utils/errors/NotFound.js";
import StudentModel from "../models/StudentModel.js";

export default {

    async getSchedules(filter, page, perPage){

        const connection = await dbPool.getConnection();

        try {

            const dayList = await DayModel.getDayList(connection);
            
            const data = [];
            
            if(filter.scheduleMode === 'tutor'){
                const tutorIDList = await TutorModel.getTutorIDWithSchedule(filter, page, perPage, connection);

                for(const tutorID of tutorIDList){
                    filter.tutorID = tutorID;
                    
                    const tutorDetail = await TutorModel.getTutorShortDetail(filter, connection);

                    const dailyData = [];

                    const tutorSchedules = await ScheduleModel.getSchedulesByTutorID(filter, connection);

                    const isEmpty = tutorSchedules.length == 0
                    
                    if(!isEmpty){
                        dayList.forEach(date => {
                            let schedules = tutorSchedules.filter(schedule => {
                                return date.DayOfTheWeek === schedule.DayOfTheWeek;
                            })
                            
                            dailyData.push({
                                day: date.Name,
                                schedules: schedules
                            })
                        })
    
                        data.push({
                            detail: tutorDetail,
                            dailyData: dailyData
                        });
                    }
                }
            }
            else if(filter.scheduleMode === 'student'){
                const studentIDList = await StudentModel.getActiveStudentID(filter, page, perPage, connection);

                for(const studentID of studentIDList){
                    filter.studentID = studentID;
                    
                    const studentDetail = await StudentModel.getStudentShortDetail(filter, connection);

                    const dailyData = [];

                    const studentSchedules = await ScheduleModel.getSchedulesByStudentID(filter, connection);

                    const isEmpty = studentSchedules.length == 0

                    if(!isEmpty){
                        dayList.forEach(date => {
                            let schedules = studentSchedules.filter(schedule => {
                                return date.DayOfTheWeek === schedule.DayOfTheWeek;
                            })
    
                            dailyData.push({
                                day: date.Name,
                                schedules: schedules
                            })
                        })
    
                        data.push({
                            detail: studentDetail,
                            dailyData: dailyData
                        });
                    }
                }
            }

            return {
                message: "Get Generated Schedule Successfully",
                data : {
                    schedules: data,
                    days: dayList,
                }
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getSchedulesByTutorID(filter){
        const connection = await dbPool.getConnection();

        try {
            const data = await ScheduleModel.getSchedulesByTutorID(filter, connection);

            return {
                message: "Get Schedules Successfully",
                data : data
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getScheduleDetail(filter){
        const connection = await dbPool.getConnection()

        try {
            const scheduleDetail = await ScheduleModel.getScheduleDetail(filter, connection)

            return {
                message: "Get Schedule Detail Successfully",
                data: scheduleDetail,
            }


        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async createPresenceScheduleNote(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const insertedID = await PresenceScheduleNoteModel.createPresenceScheduleNote(data, connection)

            const filter = new FilterParams()
            filter.id = insertedID
            

            const insertedData = await PresenceScheduleNoteModel.getPresenceScheduleNote(filter, connection)
            
            connection.commit()

            return {
                message: "Berhasil Membuat Catatan Presensi",
                data : insertedData
            }
            
        } catch (error) {
            connection.rollback()
            throw error;
        } finally{
            connection.release()
        }
    },
    async updatePresenceScheduleNote(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await PresenceScheduleNoteModel.updatePresenceScheduleNote(data, id, connection)

            if(affectedRows === 1){
                const filter = new FilterParams()
                filter.id = id
                
                const updatedData = await PresenceScheduleNoteModel.getPresenceScheduleNote(filter, connection)                

                connection.commit()

                return {
                    message: "Berhasil Mengubah Catatan Presensi",
                    data : updatedData
                }
            }else{
                throw new NotFound("Item yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },
    async deletePresenceScheduleNote(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await PresenceScheduleNoteModel.deletePresenceScheduleNote(id, connection)

            if(affectedRows === 1){
                connection.commit()
                return {
                    message:"Berhasil Menghapus Catatan Presensi",
                    data:{
                        deletedID: id
                    }
                }
            }else{
                throw new NotFound("Item yang ingin dihapus tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },
    async createPresenceReportNote(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const insertedID = await PresenceReportNoteModel.createPresenceReportNote(data, connection)

            const filter = new FilterParams()
            filter.id = insertedID
            

            const insertedData = await PresenceReportNoteModel.getPresenceReportNote(filter, connection)
            
            connection.commit()

            return {
                message: "Berhasil Membuat Catatan Presensi",
                data : insertedData
            }
            
        } catch (error) {
            connection.rollback()
            throw error;
        } finally{
            connection.release()
        }
    },
    async updatePresenceReportNote(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await PresenceReportNoteModel.updatePresenceReportNote(data, id, connection)

            if(affectedRows === 1){
                const filter = new FilterParams()
                filter.id = id
                
                const updatedData = await PresenceReportNoteModel.getPresenceReportNote(filter, connection)                

                connection.commit()

                return {
                    message: "Berhasil Mengubah Catatan Presensi",
                    data : updatedData
                }
            }else{
                throw new NotFound("Item yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },
    async deletePresenceReportNote(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await PresenceReportNoteModel.deletePresenceReportNote(id, connection)

            if(affectedRows === 1){
                connection.commit()
                return {
                    message:"Berhasil Menghapus Catatan Presensi",
                    data:{
                        deletedID: id
                    }
                }
            }else{
                throw new NotFound("Item yang ingin dihapus tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },
    async createSchedule(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const scheduleID = await ScheduleModel.createSchedule(data, connection)

            connection.commit()

            return {
                message: "Create Schedule Successfully",
                ScheduleID: scheduleID
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },
    async updateSchedule(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const affectedScheduleRows = await ScheduleModel.updateSchedule(data, id, connection)            

            if(affectedScheduleRows === 1){

                connection.commit()

                return {
                    message:"Update Schedule Succesfully",
                    data: {
                        ScheduleID : id
                    }
                }
            }else{
                throw new NotFound("Data jadwal yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },
    async deleteSchedule(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedPresenceNoteRows = await PresenceScheduleNoteModel.deletePresenceScheduleNoteByScheduleID(id, connection)

            const affectedRows = await ScheduleModel.deleteSchedule(id, connection)

            if(affectedRows === 1){
                connection.commit()
                return {
                    message:"Berhasil Menghapus Jadwal",
                    data:{
                        deletedID: id
                    }
                }
            }else{
                throw new NotFound("Item yang ingin dihapus tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    
}