import { dbPool } from "../config/database.js";
import TutorModel from "../models/TutorModel.js";
import ReportModel from "../models/ReportModel.js";
import ScheduleModel from "../models/ScheduleModel.js";
import PresenceReportNoteModel from "../models/PresenceReportNoteModel.js";
import PresenceScheduleNoteModel from "../models/PresenceScheduleNoteModel.js";
import FilterParams from "../utils/requests/filterParams.js";
import moment from "moment/moment.js";
import NotFound from "../utils/errors/NotFound.js";
import StudentModel from "../models/StudentModel.js";

export default {

    async getPresence(filter, page, perPage){

        const connection = await dbPool.getConnection();

        try {

            const currentDate = new Date(filter.startDate);
            const finalDate = new Date(filter.endDate);
            const listOfDate = [];

            while(currentDate <= finalDate){
                listOfDate.push(moment(currentDate).format('yyyy-MM-DD'));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const data = [];

            const presenceReportNotes = await PresenceReportNoteModel.getPresenceReportNote(filter, connection);
                
            const presenceScheduleNotes = await PresenceScheduleNoteModel.getPresenceScheduleNote(filter, connection);
            
            if(filter.presenceMode === 'tutor'){
                const tutorIDList = await TutorModel.getTutorIDWithScheduleOrReport(filter, page, perPage, connection);

                for(const tutorID of tutorIDList){
                    filter.tutorID = tutorID;
                    
                    const tutorDetail = await TutorModel.getTutorShortDetail(filter, connection);

                    const dailyData = [];

                    const tutorReports = await ReportModel.getReportsForPresenceByTutorID(filter, connection);

                    const tutorSchedules = await ScheduleModel.getSchedulesByTutorID(filter, connection);

                    const isEmpty = tutorReports.length == 0 && tutorSchedules.length == 0

                    if(!isEmpty){
                        listOfDate.forEach(date => {
                            let reports = tutorReports.filter(report => moment(report.Date).format('YYYY-MM-DD') === date)
                            let schedules = tutorSchedules.filter(schedule => {
                                const isReportExistForThisSchedule = reports.filter(report => report.StudentID === schedule.StudentID).length > 0;
                                const isDayMatched = moment(date, "YYYY-MM-DD").weekday() === schedule.DayOfTheWeek;
                                
                                return isDayMatched && !isReportExistForThisSchedule;
                            })
    
                            reports = reports.map(report => {
                                return {
                                    ...report,
                                    PresenceNote: presenceReportNotes.find(presenceNote => {
                                        return moment(presenceNote.Date).format('YYYY-MM-DD') == date && presenceNote.ReportID == report.ID
                                    })
                                }
                            })
    
                            schedules = schedules.map(schedule => {
                                return {
                                    ...schedule,
                                    PresenceNote: presenceScheduleNotes.find(presenceNote => {
                                        return moment(presenceNote.Date).format('YYYY-MM-DD') == date && presenceNote.ScheduleID == schedule.ID
                                    })
                                }
                            })
    
                            dailyData.push({
                                date: date,
                                reports: reports,
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
            else if(filter.presenceMode === 'student'){
                const studentIDList = await StudentModel.getActiveStudentID(filter, page, perPage, connection);

                for(const studentID of studentIDList){
                    filter.studentID = studentID;
                    
                    const studentDetail = await StudentModel.getStudentShortDetail(filter, connection);

                    const dailyData = [];

                    const studentReports = await ReportModel.getReportsForPresenceByStudentID(filter, connection);

                    const studentSchedules = await ScheduleModel.getSchedulesByStudentID(filter, connection);

                    const isEmpty = studentReports.length == 0 && studentSchedules.length == 0

                    if(!isEmpty){
                        listOfDate.forEach(date => {
                            let reports = studentReports.filter(report => moment(report.Date).format('YYYY-MM-DD') === date)
                            let schedules = studentSchedules.filter(schedule => {
                                const isReportExistForThisSchedule = reports.filter(report => report.StudentID === schedule.StudentID).length > 0;
                                const isDayMatched = moment(date, "YYYY-MM-DD").weekday() === schedule.DayOfTheWeek;
                                
                                return isDayMatched && !isReportExistForThisSchedule;
                            })
    
                            reports = reports.map(report => {
                                return {
                                    ...report,
                                    PresenceNote: presenceReportNotes.find(presenceNote => {
                                        return moment(presenceNote.Date).format('YYYY-MM-DD') == date && presenceNote.ReportID == report.ID
                                    })
                                }
                            })
    
                            schedules = schedules.map(schedule => {
                                return {
                                    ...schedule,
                                    PresenceNote: presenceScheduleNotes.find(presenceNote => {
                                        return moment(presenceNote.Date).format('YYYY-MM-DD') == date && presenceNote.ScheduleID == schedule.ID
                                    })
                                }
                            })
    
                            dailyData.push({
                                date: date,
                                reports: reports,
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
                message: "Get Generated Presence Successfully",
                data : {
                    presence: data,
                    dates: listOfDate,
                }
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
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
    }

    
}