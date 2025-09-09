import { dbPool } from "../config/database.js";
import TutorModel from "../models/TutorModel.js";
import ReportModel from "../models/ReportModel.js";
import FeeComponentModel from "../models/FeeComponentModel.js";
import FilterParams from "../utils/requests/filterParams.js";
import moment from "moment/moment.js";
import StudentModel from "../models/StudentModel.js";
import FeeModel from "../models/FeeModel.js";
import FeeItemModel from "../models/FeeItemModel.js";
import AutoNumbering from "../utils/autoNumbering/AutoNumbering.js";
import tables from "../utils/constants/tables.js";
import InternalServer from "../utils/errors/InternalServer.js";

export default {

    async generateFees(filter, page, perPage){
        const todayDate = moment().format('YYYY-MM-DD')

        const connection = await dbPool.getConnection();

        try {
            let tutorIDList = []
            let paginationInfo = {}

            if(filter.tutorID){
                tutorIDList = [filter.tutorID]
                paginationInfo = {
                    page,
                    totalPage: 1,
                    totalData: 1
                }
            }else{
                tutorIDList = await TutorModel.getTutorIDWithReportWithoutFee(filter, page, perPage, connection)
                const totalData = (await TutorModel.getTutorIDWithReportWithoutFee(filter, 1, 999999, connection)).length
                const totalPage = Math.ceil(totalData / perPage)

                paginationInfo = {
                    page,
                    totalPage,
                    totalData
                }
            }

            const feeComponentFilter = new FilterParams()
            feeComponentFilter.isActive = true
            const feeComponents = await FeeComponentModel.getFeeComponents(feeComponentFilter, connection)

            feeComponents.forEach(component => {
                component.ReferenceIDs = typeof component.ReferenceIDs === 'string' ? JSON.parse(component.ReferenceIDs) : component.ReferenceIDs
            })

            const onlineFeeComponent = feeComponents.find(component => component.Slug == 'online')
            const offlineFeeComponent = feeComponents.find(component => component.Slug == 'offline')
            const moreStudentFeeComponent = feeComponents.find(component => component.Slug == 'moreStudents')

            const feeComponentsReferredByCourses = feeComponents.filter(component => component.ReferredBy === 'course')

            let courseReferenceIDs = []

            feeComponentsReferredByCourses.forEach(component => {
                const referenceIDs = component.ReferenceIDs
                referenceIDs.forEach(referenceID => {
                    if(!courseReferenceIDs.includes(referenceID)){
                        courseReferenceIDs.push(referenceID)
                    }
                })
            })


            const generatedFees = await Promise.all(tutorIDList.map(async (tutorID) => {
                const tutorReportFilter = new FilterParams();
                tutorReportFilter.tutorID = tutorID;
                tutorReportFilter.startDate = filter.startDate;
                tutorReportFilter.endDate = filter.endDate;
                let tutorReportList = await ReportModel.getReports(tutorReportFilter, 1, 99999, connection);
                tutorReportList = tutorReportList.data;
    
                if(tutorReportList.length > 0){
                    const fee = {
                        IsDraft: true,
                        TutorID: tutorID,
                        TutorName: tutorReportList[0].TutorName,
                        FeeDate: todayDate,
                        StartDate: moment(filter.startDate).format('YYYY-MM-DD'),
                        EndDate: moment(filter.endDate).format('YYYY-MM-DD'),
                        Paycut: 0,
                    };
        
                    let feeItems = []
                    let _reportJoinCodes = []       // Array of Objects {JoinCode: 'joinCode', Qty: 1}
    
                    let total = 0
    
                    for(const report of tutorReportList){
                        const studentDetailFilter = new FilterParams
                        studentDetailFilter.studentID = report.StudentID;
                        const studentDetail = await StudentModel.getStudentDetail(studentDetailFilter, connection);

                        if(!report.IsJoin || !_reportJoinCodes.find(_report => _report.JoinCode == report.JoinCode)){
                            
                            _reportJoinCodes.push({
                                JoinCode: report.JoinCode,
                                Qty: 1
                            })

                            let basicFeeComponent = null;
                            let additionalFeeComponent = null;
                        
                            // _comparator and _duration are used to determine which fee component to select

                            let _comparator = ''
                            let _duration = 0

                            const reportDuration = report.Duration

                            if(reportDuration <= 90){
                                _comparator = 'equal'
                                _duration = reportDuration
                            }else if(reportDuration > 90){
                                _comparator = 'more_than'
                                _duration = 90
                            }

                            if (courseReferenceIDs.includes(report.SubjectID)) {
                                basicFeeComponent = feeComponentsReferredByCourses.find(component => component.ReferenceIDs.includes(report.SubjectID) && component.Duration == _duration && component.Comparator == 'equal')
                                additionalFeeComponent = _comparator == 'more_than' ? feeComponentsReferredByCourses.find(component => component.ReferenceIDs.includes(report.SubjectID) && component.Duration == _duration && component.Comparator == 'more_than') : []
                            } else {
                                basicFeeComponent = feeComponents.find(component => component.ReferredBy === 'grade' && component.ReferenceIDs.includes(studentDetail.GradeID) && component.Duration == _duration && component.Comparator == 'equal')
                                additionalFeeComponent = _comparator == 'more_than' ? feeComponents.find(component => component.ReferredBy === 'grade' && component.ReferenceIDs.includes(studentDetail.GradeID) && component.Duration == _duration && component.Comparator == 'more_than') : []
                            }
                            
                            const subtotal = basicFeeComponent.Price

                            total += subtotal
        
                            feeItems.push({
                                FeeComponentID: basicFeeComponent.ID,
                                Qty: 1,
                                Name: basicFeeComponent.Name,
                                Price: basicFeeComponent.Price,
                                Subtotal: subtotal
                            });

                            if(_comparator == 'more_than'){
                                const _qty = ( report.Duration - 90 ) / 30

                                const subtotal = _qty * additionalFeeComponent.Price
                                total += subtotal

                                feeItems.push({
                                    FeeComponentID: additionalFeeComponent.ID,
                                    Qty: _qty,
                                    Name: additionalFeeComponent.Name,
                                    Price: additionalFeeComponent.Price,
                                    Subtotal: subtotal,
                                });
                            }

                            // including online/offline fee component

                            feeItems.push({
                                FeeComponentID: report.ModeID == 1 ? onlineFeeComponent.ID : offlineFeeComponent.ID,
                                Qty: 1,
                                Name: report.ModeID == 1 ? onlineFeeComponent.Name : offlineFeeComponent.Name,
                                Price: report.ModeID == 1 ? onlineFeeComponent.Price : offlineFeeComponent.Price,
                                Subtotal: report.ModeID == 1 ? onlineFeeComponent.Price : offlineFeeComponent.Price
                            })

                            total += report.ModeID == 1 ? onlineFeeComponent.Price : offlineFeeComponent.Price

                            // including online/offline fee component

                            if(report.IsJoin){
                                feeItems.push({
                                    FeeComponentID: moreStudentFeeComponent.ID,
                                    Qty: 1,
                                    Name: moreStudentFeeComponent.Name,
                                    Price: moreStudentFeeComponent.Price,
                                    Subtotal: moreStudentFeeComponent.Price
                                })

                                total += moreStudentFeeComponent.Price
                            }
                        }else if(report.IsJoin && _reportJoinCodes.find(_report => _report.JoinCode == report.JoinCode)){
                            const _joinedReport = _reportJoinCodes.find(_report => _report.JoinCode == report.JoinCode)

                            if(_joinedReport > 2){ // will only push qty by one for more students fee items when the _joinedReport has occured more than twice
                                feeItems.push({
                                    FeeComponentID: moreStudentFeeComponent.ID,
                                    Qty: 1,
                                    Name: moreStudentFeeComponent.Name,
                                    Price: moreStudentFeeComponent.Price,
                                    Subtotal: moreStudentFeeComponent.Price
                                })

                                total += moreStudentFeeComponent.Price
                            }
                        }

                    };

                    feeItems = feeItems.reduce((acc, curr) => {
                        const existing = acc.find(item => item.FeeComponentID === curr.FeeComponentID)
                        if(existing){
                            existing.Qty += curr.Qty
                            existing.Subtotal += curr.Subtotal
                        }else{
                            acc.push({...curr})
                        }
                        return acc
                    }, []).sort((a, b) => a.FeeComponentID - b.FeeComponentID)

                    
    
                    fee.Total = total
                    fee.FeeItems = feeItems;
    
                    return fee;
                }
            }));
    
            
            return {
                message: "Get Generated Fees Successfully",
                data: generatedFees,
                paginationInfo
            };
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getFeeComponents(filter){
        const connection = await dbPool.getConnection();

        try {

            const result = await FeeComponentModel.getFeeComponents(filter, connection)

            return result
            
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async createFee(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const feeCode = await AutoNumbering.generateDocumentAutoNumber(tables.FEES, connection)

            const feeUniquePaths = await FeeModel.getUniquePaths(connection)

            let uniquePath = this.generateRandomString(10)

            while(feeUniquePaths.includes(uniquePath)){
                uniquePath = this.generateRandomString(10)
            }

            data.FeeCode = feeCode
            data.UniquePath = uniquePath

            const feeID = await FeeModel.createFee(data, connection)

            for(const item of data.FeeItems){
                item.FeeID = feeID
                try {
                    await FeeItemModel.createFeeItem(item, connection)
                } catch (error) {
                    throw new InternalServer(`Gagal menambahkan data item pada fee tersebut: ${error}`)
                }
            }

            const tutorFilter = new FilterParams()
            tutorFilter.tutorID = data.TutorID

            const tutorDetail = await TutorModel.getTutorDetail(tutorFilter, connection)

            connection.commit()

            return {
                statusCode: 200,
                message:"Create Fee Succesfully",
                data: {
                    FeeID : feeID,
                    TutorDetail: tutorDetail,
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

    async updateFee(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedFeeRows = await FeeModel.updateFee(data, id, connection)

                if(affectedFeeRows !== 1){
                    throw new InternalServer(`Data fee yang ingin diedit tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal mengedit data fee: ${error}`)
            }

            data.FeeItems.forEach(async (item, index) => {
                try {
                    const affectedFeeItemRow = await FeeItemModel.updateFeeItem(item, connection)

                    if(affectedFeeItemRow !== 1){
                        throw new InternalServer(`Data fee item yang ingin diedit tidak ditemukan`)
                    }
                } catch (error) {
                    throw new InternalServer(`Gagal mengedit data item pada fee tersebut: ${error}`)
                }
            })

            connection.commit()

            return {
                message:"Update Fee Succesfully",
                data: {
                    FeeID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async deleteFee(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            try {
                const affectedFeeItemRow = await FeeItemModel.deleteFeeItemByFeeID(id, connection)

                if(affectedFeeItemRow < 1){
                    throw new InternalServer(`Data fee item yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data item pada fee tersebut: ${error}`)
            }

            try {
                const affectedFeeRow = await FeeModel.deleteFee(id, connection)

                if(affectedFeeRow !== 1){
                    throw new InternalServer(`Data fee yang ingin dihapus tidak ditemukan`)
                }
            } catch (error) {
                throw new InternalServer(`Gagal menghapus data fee: ${error}`)
            }

            connection.commit()

            return {
                message:"Delete Fee Succesfully",
                data: {
                    FeeID : id
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },


    async getFeesDraft(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            const feeList = (await FeeModel.getFeesDraft(filter, page, perPage, connection))

            const data = []

            for(const fee of feeList.data){
                const feeItems = await FeeItemModel.getFeeItems(fee.ID, connection)

                data.push({
                    ...fee,
                    FeeItems: feeItems,
                })
            }

            return {
                ...feeList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getSentFees(filter, page, perPage){
        const connection = await dbPool.getConnection();

        try {

            if(filter.userID){
                const tutorID = (await TutorModel.getTutorDetailByUserID(filter, connection)).ID


                filter.tutorID = tutorID
            }

            const feeList = (await FeeModel.getSentFees(filter, page, perPage, connection))

            const data = []

            for(const fee of feeList.data){
                const feeItems = await FeeItemModel.getFeeItems(fee.ID, connection)

                data.push({
                    ...fee,
                    FeeItems: feeItems,
                })
            }

            return {
                ...feeList,
                data:data
            }
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getFeeDetail(feeID){
        const connection = await dbPool.getConnection();

        try {

            let fee = await FeeModel.getFeeDetail(feeID, connection)
            
            const feeItems = await FeeItemModel.getFeeItems(fee.ID, connection)

            fee = {
                ...fee,
                FeeItems: feeItems,
            }            

            return fee
        } catch (error) {
            throw error;
        } finally{
            connection.release();
        }
    },

    async getFeeDetailByUniquePath(uniquePath){
        const connection = await dbPool.getConnection();

        try {

            let fee = await FeeModel.getFeeDetailByUniquePath(uniquePath, connection)
            
            const feeItems = await FeeItemModel.getFeeItems(fee.ID, connection)

            fee = {
                ...fee,
                FeeItems: feeItems,
            }            

            return fee
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