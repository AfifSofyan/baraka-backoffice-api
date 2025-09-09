import { dbPool } from "../config/database.js";
import ReportModel from "../models/ReportModel.js";
import InvoiceComponentModel from "../models/InvoiceComponentModel.js";
import FilterParams from "../utils/requests/filterParams.js";
import moment from "moment/moment.js";
import StudentModel from "../models/StudentModel.js";
import InvoiceModel from "../models/InvoiceModel.js";
import InvoiceItemModel from "../models/InvoiceItemModel.js";
import AutoNumbering from "../utils/autoNumbering/AutoNumbering.js";
import tables from "../utils/constants/tables.js";
import InvoiceStudentModel from "../models/InvoiceStudentModel.js";
import InternalServer from "../utils/errors/InternalServer.js";

export default {

    async generateInvoices(filter, page, perPage){
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
                studentIDList = await StudentModel.getStudentIDWithReportWithoutInvoice(filter, page, perPage, connection)
                const totalData = (await StudentModel.getStudentIDWithReportWithoutInvoice(filter, 1, 999999, connection)).length
                const totalPage = Math.ceil(totalData / perPage)

                paginationInfo = {
                    page,
                    totalPage,
                    totalData
                }
            }

            const invoiceComponentFilter = new FilterParams()
            invoiceComponentFilter.isActive = true
            let invoiceComponents = await InvoiceComponentModel.getInvoiceComponents(invoiceComponentFilter, connection)
            
            invoiceComponents.map(component => {
                component.ReferenceIDs = typeof component.ReferenceIDs === 'string' ? JSON.parse(component.ReferenceIDs) : component.ReferenceIDs
                return component
            })


            const invoiceComponentsReferredByCourses = invoiceComponents.filter(component => component.ReferredBy === 'course')

            let courseReferenceIDs = []

            invoiceComponentsReferredByCourses.forEach(component => {
                const referenceIDs = component.ReferenceIDs
                referenceIDs.forEach(referenceID => {
                    if(!courseReferenceIDs.includes(referenceID)){
                        courseReferenceIDs.push(referenceID)
                    }
                })
            })


            const generatedInvoices = await Promise.all(studentIDList.map(async (studentID) => {
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
                    const invoice = {
                        IsDraft: true,
                        InvoiceDate: todayDate,
                        StartDate: moment(filter.startDate).format('YYYY-MM-DD'),
                        EndDate: moment(filter.endDate).format('YYYY-MM-DD'),
                        Discount: 0,
                        InvoiceStudents: [
                            {
                                StudentID: studentID,
                                StudentName: studentDetail.Name,
                                GradeID: studentDetail.GradeID,
                                School: studentDetail.School,
                            }
                        ]
                    };
        
                    let invoiceItems = [];
    
                    let total = 0;
    
                    studentReportList.forEach(report => {
                        let selectedInvoiceComponent = null;
                        if (courseReferenceIDs.includes(report.SubjectID)) {
                            selectedInvoiceComponent = invoiceComponentsReferredByCourses.find(component => component.ReferenceIDs.includes(report.SubjectID) && component.ModeID === report.ModeID);
                        } else {
                            selectedInvoiceComponent = invoiceComponents.find(component => component.ReferredBy === 'grade' && component.ReferenceIDs.includes(studentDetail.GradeID) && component.ModeID === report.ModeID);
                        }

                        const quantity = report.Duration === 60 ? 1 : Math.round((report.Duration / 90) *100) / 100
                        
                        const subtotal = report.Duration === 60 ? quantity * selectedInvoiceComponent.CostForSixtyMinutes : Math.round(quantity * selectedInvoiceComponent.Cost / 100) * 100

                        total += subtotal
    
                        invoiceItems.push({
                            InvoiceComponentID: selectedInvoiceComponent.ID,
                            Duration: report.Duration,
                            SixtyMinutesDuration: report.Duration == 60,
                            Quantity: quantity,
                            Name: report.Duration == 60 ? `${selectedInvoiceComponent.Name} 60 Menit` :  selectedInvoiceComponent.Name,
                            Cost: report.Duration == 60 ? selectedInvoiceComponent.CostForSixtyMinutes : selectedInvoiceComponent.Cost,
                            Subtotal: subtotal
                        });
                    });

                    invoiceItems = invoiceItems.reduce((acc, curr) => {
                        const existing = acc.find(item => item.InvoiceComponentID === curr.InvoiceComponentID && item.SixtyMinutesDuration === curr.SixtyMinutesDuration)

                        if(existing){
                            existing.Duration += curr.Duration
                            existing.Quantity += curr.Quantity
                            existing.Subtotal += curr.Subtotal
                        }else{
                            acc.push({...curr})
                        }
                        return acc
                    }, [])
    
                    invoice.Total = total
                    invoice.InvoiceItems = invoiceItems;
    
                    return invoice;
                }
            }));
    
            
            return {
                statusCode: 200,
                message: "Get Generated Invoices Successfully",
                data: generatedInvoices,
                paginationInfo
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getInvoiceComponents(filter){
        const connection = await dbPool.getConnection();

        try {

            const result = await InvoiceComponentModel.getInvoiceComponents(filter, connection)

            return {
                statusCode: 200,
                message: "Get invoice components successfully",
                data: result
            }
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async createInvoice(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const invoiceCode = await AutoNumbering.generateDocumentAutoNumber(tables.INVOICES, connection)

            const invoiceUniquePaths = await InvoiceModel.getUniquePaths(connection)

            let uniquePath = this.generateRandomString(10)

            while(invoiceUniquePaths.includes(uniquePath)){
                uniquePath = this.generateRandomString(10)
            }

            data.InvoiceCode = invoiceCode
            data.UniquePath = uniquePath

            const invoiceID = await InvoiceModel.createInvoice(data, connection)

            for(const item of data.InvoiceItems){
                item.InvoiceID = invoiceID
                try {
                    await InvoiceItemModel.createInvoiceItem(item, connection)
                } catch (error) {
                    throw new InternalServer(`Gagal menambahkan data item pada invoice tersebut: ${error}`)
                }
            }

            for(const student of data.InvoiceStudents){
                const {StudentID, GradeID, School} = student
                let studentData = null;

                const studentFilter = new FilterParams()
                studentFilter.studentID = StudentID
                const studentDetail = await StudentModel.getStudentDetail(studentFilter, connection)

                student.UserID = studentDetail.UserID

                studentData = {
                    InvoiceID: invoiceID,
                    StudentID: studentDetail.ID,
                    GradeID: studentDetail.GradeID,
                    School: studentDetail.School
                }
                
                try {
                    await InvoiceStudentModel.createInvoiceStudent(studentData, connection)                   
                } catch (error) {
                    throw new InternalServer(`Gagal menambahkan data siswa dengan invoice tersebut: ${error}`)
                }
            }

            connection.commit()

            return {
                statusCode: 200,
                message:"Create Invoice Succesfully",
                data: {
                    InvoiceID: invoiceID,
                    ...data
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateInvoice(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedInvoiceRows = await InvoiceModel.updateInvoice(data, id, connection)

                if(affectedInvoiceRows !== 1){
                    throw new InternalServer(`Data invoice yang ingin diedit tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal mengedit data invoice: ${error}`)
            }

            data.InvoiceItems.forEach(async (item) => {
                try {
                    const affectedInvoiceItemRow = await InvoiceItemModel.updateInvoiceItem(item, connection)

                    if(affectedInvoiceItemRow !== 1){
                        throw new InternalServer(`Data invoice item yang ingin diedit tidak ditemukan`)
                    }
                } catch (error) {
                    throw new InternalServer(`Gagal mengedit data item pada invoice tersebut: ${error}`)
                }
            })

            data.InvoiceStudents.forEach(async (data) => {
                try {
                    const affectedInvoiceStudentRow = await InvoiceStudentModel.updateInvoiceStudent(data, connection)                   

                    if(affectedInvoiceStudentRow !== 1){
                        throw new InternalServer(`Data siswa pada invoice yang ingin diedit tidak ditemukan`)
                    }

                } catch (error) {
                    throw new InternalServer(`Gagal mengedit data siswa dengan invoice tersebut: ${error}`)
                }
            })

            connection.commit()

            return {
                statusCode: 200,
                message:"Update Invoice Succesfully",
                data: {
                    InvoiceID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async deleteInvoice(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedInvoiceItemRow = await InvoiceItemModel.deleteInvoiceItemByInvoiceID(id, connection)

                if(affectedInvoiceItemRow < 1){
                    throw new InternalServer(`Data invoice item yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data item pada invoice tersebut: ${error}`)
            }
        
            try {
                const affectedInvoiceStudentRow = await InvoiceStudentModel.deleteInvoiceStudentByInvoiceID(id, connection)                   

                if(affectedInvoiceStudentRow < 1){
                    throw new InternalServer(`Data siswa pada invoice yang ingin dihapus tidak ditemukan`)
                }

            } catch (error) {
                throw new InternalServer(`Gagal menghapus data siswa dengan invoice tersebut: ${error}`)
            }
        

            try {
                const affectedInvoiceRows = await InvoiceModel.deleteInvoice(id, connection)

                if(affectedInvoiceRows !== 1){
                    throw new InternalServer(`Data invoice yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data invoice: ${error}`)
            }

            connection.commit()

            return {
                statusCode: 204,
                message:"Delete Invoice Succesfully",
                data: {
                    InvoiceID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },


    async getInvoicesDraft(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            const invoiceList = (await InvoiceModel.getInvoicesDraft(filter, page, perPage, connection))

            const data = []

            for(const invoice of invoiceList.data){
                const invoiceItems = await InvoiceItemModel.getInvoiceItems(invoice.ID, connection)
                const invoiceStudents = await InvoiceStudentModel.getInvoiceStudents(invoice.ID, connection)

                data.push({
                    ...invoice,
                    InvoiceItems: invoiceItems,
                    InvoiceStudents: invoiceStudents
                })
            }

            return {
                ...invoiceList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getSentInvoices(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            if(filter.userID){
                const studentID = (await StudentModel.getStudentDetailByUserID(filter, connection)).ID


                filter.studentID = studentID
            }

            const invoiceList = (await InvoiceModel.getSentInvoices(filter, page, perPage, connection))

            const data = []

            for(const invoice of invoiceList.data){
                const invoiceItems = await InvoiceItemModel.getInvoiceItems(invoice.ID, connection)
                const invoiceStudents = await InvoiceStudentModel.getInvoiceStudents(invoice.ID, connection)

                data.push({
                    ...invoice,
                    InvoiceItems: invoiceItems,
                    InvoiceStudents: invoiceStudents
                })
            }

            return {
                ...invoiceList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getInvoiceDetail(invoiceID){
        const connection = await dbPool.getConnection();

        try {

            let invoice = await InvoiceModel.getInvoiceDetail(invoiceID, connection)
            
            const invoiceItems = await InvoiceItemModel.getInvoiceItems(invoice.ID, connection)
            const invoiceStudents = await InvoiceStudentModel.getInvoiceStudents(invoice.ID, connection)

            invoice = {
                ...invoice,
                InvoiceItems: invoiceItems,
                InvoiceStudents: invoiceStudents
            }            

            return invoice
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getInvoiceDetailByUniquePath(uniquePath){
        const connection = await dbPool.getConnection();

        try {

            let invoice = await InvoiceModel.getInvoiceDetailByUniquePath(uniquePath, connection)
            
            const invoiceItems = await InvoiceItemModel.getInvoiceItems(invoice.ID, connection)
            const invoiceStudents = await InvoiceStudentModel.getInvoiceStudents(invoice.ID, connection)

            invoice = {
                ...invoice,
                InvoiceItems: invoiceItems,
                InvoiceStudents: invoiceStudents
            }            

            return invoice
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