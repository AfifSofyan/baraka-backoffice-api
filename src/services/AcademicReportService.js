import { dbPool } from "../config/database.js";
import TutorModel from "../models/TutorModel.js";
import ReportModel from "../models/ReportModel.js";
import InvoiceComponentModel from "../models/InvoiceComponentModel.js";
import ScheduleModel from "../models/ScheduleModel.js";
import PresenceReportNoteModel from "../models/PresenceReportNoteModel.js";
import PresenceScheduleNoteModel from "../models/PresenceScheduleNoteModel.js";
import FilterParams from "../utils/requests/filterParams.js";
import moment from "moment/moment.js";
import NotFound from "../utils/errors/NotFound.js";
import StudentModel from "../models/StudentModel.js";
import InvoiceModel from "../models/InvoiceModel.js";
import InvoiceItemModel from "../models/InvoiceItemModel.js";
import AutoNumbering from "../utils/autoNumbering/AutoNumbering.js";
import tables from "../utils/constants/tables.js";
import InvoiceStudentModel from "../models/InvoiceStudentModel.js";
import InternalServer from "../utils/errors/InternalServer.js";
import AcademicReportModel from "../models/AcademicReportModel.js";
import AcademicReportItemModel from "../models/AcademicReportItemModel.js";

export default {

    async generateAcademicReports(filter, page, perPage){
        const todayDate = moment().format('YYYY-MM-DD')

        const connection = await dbPool.getConnection();

        try {
            let studentIDList = []
            let paginationInfo = {}

            if(filter.studentID){
                studentIDList = [filter.studentID]
                paginationInfo = {
                    page,
                    totalPage: 1,
                    totalData: 1
                }
            }else{
                studentIDList = await StudentModel.getStudentIDWithReportWithoutAcademicReports(filter, page, perPage, connection)
                const totalData = (await StudentModel.getStudentIDWithReportWithoutAcademicReports(filter, 1, 999999, connection)).length
                const totalPage = Math.ceil(totalData / perPage)

                paginationInfo = {
                    page,
                    totalPage,
                    totalData
                }
            }

            const generatedAcademicReports = await Promise.all(studentIDList.map(async (studentID) => {
                const studentReportFilter = new FilterParams();
                studentReportFilter.studentID = studentID;
                studentReportFilter.startDate = filter.startDate;
                studentReportFilter.endDate = filter.endDate;
                let studentReportList = await ReportModel.getReports(studentReportFilter, 1, 99999, connection);
                studentReportList = studentReportList.data;

                const studentDetailFilter = new FilterParams
                studentDetailFilter.studentID = studentID;
                const studentDetail = await StudentModel.getStudentDetail(studentDetailFilter, connection);
    
                if(studentReportList.length > 0){

                    studentReportList = studentReportList.map(report => {
                        return {
                            ...report,
                            ReportID: report.ID
                        }
                    })

                    const academicReport = {
                        StudentID: studentID,
                        StudentName: studentDetail.Name,
                        GradeID: studentDetail.GradeID,
                        School: studentDetail.School,
                        ReportDate: todayDate,
                        StartDate: moment(filter.startDate).format('YYYY-MM-DD'),
                        EndDate: moment(filter.endDate).format('YYYY-MM-DD'),
                        IsDraft: true,
                        AcademicReportItems: [
                            ...studentReportList
                        ]
                    };

                    
        
                    return academicReport;
                }
            }));
    
            
            return {
                message: "Get Generated Academic Reports Successfully",
                data: generatedAcademicReports,
                paginationInfo
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async createAcademicReport(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const academicReportUniquePaths = await AcademicReportModel.getUniquePaths(connection)

            let uniquePath = this.generateRandomString(10)

            while(academicReportUniquePaths.includes(uniquePath)){
                uniquePath = this.generateRandomString(10)
            }

            data.UniquePath = uniquePath

            const academicReportID = await AcademicReportModel.createAcademicReport(data, connection)

            data.AcademicReportItems.forEach(async (item) => {
                item.AcademicReportID = academicReportID
                try {
                    await AcademicReportItemModel.createAcademicReportItem(item, connection)
                } catch (error) {
                    throw new InternalServer(`Gagal menambahkan data item pada laporan akademik tersebut: ${error}`)
                }
            })

            connection.commit()

            return {
                message:"Create Academic Report Succesfully",
                data: {
                    AcademicReportID : academicReportID
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateAcademicReport(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedAcademicReportRows = await AcademicReportModel.updateAcademicReport(data, id, connection)

                if(affectedAcademicReportRows !== 1){
                    throw new InternalServer(`Data laporan akademik yang ingin diedit tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal mengedit data fee: ${error}`)
            }

            connection.commit()

            return {
                message:"Update Laporan Akademik Succesfully",
                data: {
                    AcademicReportID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async deleteAcademicReport(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedAcademicReportItemRow = await AcademicReportItemModel.deleteAcademicReportItemByAcademicReportID(id, connection)

                if(affectedAcademicReportItemRow < 1){
                    throw new InternalServer(`Data item yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data item pada laporan akademik tersebut: ${error}`)
            }

            try {
                const affectedAcademicReportRows = await AcademicReportModel.deleteAcademicReport(id, connection)

                if(affectedAcademicReportRows !== 1){
                    throw new InternalServer(`Data laporan akademik yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data laporan akademik: ${error}`)
            }

            connection.commit()

            return {
                message:"Delete Academic Report Succesfully",
                data: {
                    AcademicReportID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },


    async getAcademicReportsDraft(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            const academicReportList = (await AcademicReportModel.getAcademicReportsDraft(filter, page, perPage, connection))

            const data = []

            for(const academicReport of academicReportList.data){
                const academicReportItems = await AcademicReportItemModel.getAcademicReportItems(academicReport.ID, connection)

                data.push({
                    ...academicReport,
                    AcademicReportItems: academicReportItems
                })
            }

            return {
                ...academicReportList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getSentAcademicReports(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            if(filter.userID){
                const studentDetail = await StudentModel.getStudentDetailByUserID(filter, connection)
                filter.studentID = studentDetail.ID
            }

            const academicReportList = (await AcademicReportModel.getSentAcademicReports(filter, page, perPage, connection))

            const data = []

            for(const academicReport of academicReportList.data){
                const academicReportItems = await AcademicReportItemModel.getAcademicReportItems(academicReport.ID, connection)

                data.push({
                    ...academicReport,
                    AcademicReportItems: academicReportItems
                })
            }

            return {
                ...academicReportList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getAcademicReportDetail(academicReportID){
        const connection = await dbPool.getConnection();

        try {

            let academicReport = await AcademicReportModel.getAcademicReportDetail(academicReportID, connection)
            
            const _academicReportItems = await AcademicReportItemModel.getAcademicReportItems(academicReport.ID, connection)

            const academicReportItems = []

            for( const report of _academicReportItems){
                const reportFilter = new FilterParams()
                reportFilter.reportID = report.ReportID
                const reportDetail = await ReportModel.getReportDetail(reportFilter, connection)

                academicReportItems.push({
                    ...report,
                    ...reportDetail
                })
            }

            academicReport = {
                ...academicReport,
                AcademicReportItems: academicReportItems,
            }         

            return academicReport
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getAcademicReportDetailByUniquePath(uniquePath){
        const connection = await dbPool.getConnection();

        try {

            let academicReport = await AcademicReportModel.getAcademicReportDetailByUniquePath(uniquePath, connection)
            
            const _academicReportItems = await AcademicReportItemModel.getAcademicReportItems(academicReport.ID, connection)

            const academicReportItems = []

            for( const report of _academicReportItems){
                const reportFilter = new FilterParams()
                reportFilter.reportID = report.ReportID
                const reportDetail = await ReportModel.getReportDetail(reportFilter, connection)

                academicReportItems.push({
                    ...academicReport,
                    ...reportDetail
                })
            }

            academicReport = {
                ...academicReport,
                AcademicReportItems: academicReportItems,
            }    

            return academicReport
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },    

    generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength);
            result += characters[randomIndex];
        }
    
        return result;
    }
}