import { dbPool } from "../config/database.js"
import TutorModel from "../models/TutorModel.js"
import UserModel from "../models/UserModel.js"
import FilterParams from "../utils/requests/filterParams.js"
import NotFound from "../utils/errors/NotFound.js"
import InternalServer from "../utils/errors/InternalServer.js"
import moment from "moment"
import StudentModel from "../models/StudentModel.js"
import ScheduleModel from "../models/ScheduleModel.js"

export default {

    async getAllTutors(filter, page, perPage){

        const connection = await dbPool.getConnection()

        try {

            let result = null

            if(filter.roleName !== 'student'){
                result =  await TutorModel.getAllTutors(filter, page, perPage, connection)
            }else{
                const studentDetail = await StudentModel.getStudentDetailByUserID(filter, connection)

                const scheduleFilter = new FilterParams()
                scheduleFilter.studentID = studentDetail.ID
                const studentSchedules = await ScheduleModel.getSchedulesByStudentID(scheduleFilter, connection)

                const tutorIDs = []

                studentSchedules.forEach( schedule => {
                    if(!tutorIDs.includes(schedule.TutorID)){
                        tutorIDs.push(schedule.TutorID)
                    }
                })

                filter.isActive = studentDetail.StatusName != 'Off'

                if(tutorIDs.length > 0){
                    filter.tutorIDs = tutorIDs

                    result = await TutorModel.getTutorListByTutorIDs(filter, page, perPage, connection)
                }else{
                    return []
                }
            }
    
            return {
                statusCode: 200,
                message: "Get Tutor List Successfully",
                ...result
            } 
        } catch (error) {
            throw error
        }
        finally{
            connection.release()
        }
    },

    async getTotalNewRegistrants(){
        const connection = await dbPool.getConnection()

        try {
            const data =  await TutorModel.getTotalNewRegistrants(connection)
    
            return {
                statusCode: 200,
                message: "Get total new tutor registrants successfully",
                data: data
            }
        } catch (error) {
            throw error
        }
        finally{
            connection.release()
        }
    },

    async createTutor(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            data.UserID = null

            if(data.IsAccountCreated){
                data.UserID = await UserModel.createUser(data, connection)
            }

            const tutorID = await TutorModel.createTutor(data, connection)

            connection.commit()

            return {
                statusCode: 200,
                message:"Create Tutor Succesfully",
                data: {
                    TutorData : tutorID
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async registerTutor(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            data = {
                ...data,
                IsDraft: 0,
                CreatedBy: 0,
                CreatedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                UpdatedBy: 0,
                UpdatedDate: moment().format('YYYY-MM-DD hh:mm:ss')
            }
            
            const tutorData = await TutorModel.createTutor(data, connection)

            connection.commit()

            return {
                statusCode: 200,
                message:"Register Tutor Succesfully",
                data: tutorData
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateTutor(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const filter = new FilterParams()
            filter.tutorID = id

            const userID = await TutorModel.getUserID(filter, connection)

            data.UserID = userID

            if(data.IsAccountCreated){

                if(!userID){
                    const insertedUserID = await UserModel.createUser(data, connection)

                    if(!insertedUserID){
                        throw new InternalServer("Tidak dapat menambahkan akun")
                    }

                    data.UserID = insertedUserID
                }else{
                    const affectedUserRows = await UserModel.updateUser(data, userID, connection)
    
                    if(affectedUserRows !== 1){
                        throw new NotFound("Data user yang ingin diubah tidak ditemukan")
                    }
                }


            }

            if(userID){
                const currentEmail = await UserModel.getEmail(userID, connection)
                const emailChanged = currentEmail != data.Email

                if(emailChanged){
                    const affectedEmailRows = await UserModel.unverifyEmail(userID, connection)

                    if(affectedEmailRows != 1){
                        throw new InternalServer("Failed to unverify new email")
                    }
                }
            }

            const affectedTutorRows = await TutorModel.updateTutor(data, id, connection)            

            if(affectedTutorRows === 1){

                connection.commit()

                return {
                    statusCode: 200,
                    message:"Update Tutor Succesfully",
                    data: {
                        TutorID : id
                    }
                }
            }else{
                throw new NotFound("Data tutor yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateTutorByUserID(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const affectedTutorRows = await TutorModel.updateTutorByUserID(data, id, connection)            

            if(affectedTutorRows === 1){

                connection.commit()

                return {
                    statusCode: 200,
                    message:"Update Tutor Succesfully",
                    data: {
                        TutorID : id
                    }
                }
            }else{
                throw new NotFound("Data tutor yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async getTutorDetail(filter){
        const connection = await dbPool.getConnection()

        try {
            const tutorDetail = await TutorModel.getTutorDetail(filter, connection)

            let userDetail = {}
            let isAccountCreated = false

            if(tutorDetail.UserID){
                filter.userID = tutorDetail.UserID

                isAccountCreated = true
                userDetail = await UserModel.getUserSimpleDetail(filter, connection)
            }

            const result = {
                ...tutorDetail,
                ...userDetail,
                IsAccountCreated : isAccountCreated
            }

            return {
                statusCode: 200,
                message: "Get Tutor Detail Successfully",
                data: result,
            }


        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getTutorDetailByUserID(filter){
        const connection = await dbPool.getConnection()

        try {
            const tutorDetail = await TutorModel.getTutorDetailByUserID(filter, connection)

            return {
                statusCode: 200,
                message: "Get Tutor Detail Successfully",
                data: tutorDetail,
            }

        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getTutorIDAndName(){
        const connection = await dbPool.getConnection()

        try {
            const tutorList = await TutorModel.getTutorIDAndName(connection);

            return {
                statusCode: 200,
                message: "Get Tutor ID and Name Successfully",
                data: tutorList
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getTutorIDAndNameWithoutFee(filter){
        const connection = await dbPool.getConnection()

        try {
            const tutorIDAndName = await TutorModel.getTutorIDAndName(connection)
            const tutorIDWithFee = await TutorModel.getTutorIDWithFee(filter, connection)

            const result = tutorIDAndName.filter(tutor => !tutorIDWithFee.includes(tutor.ID))
            return {
                statusCode: 200,
                message: "Get Tutor ID and Name Successfully",
                data: result
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },
    async deleteTutor(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await TutorModel.deleteTutor(id, connection)

            if(affectedRows === 1){
                connection.commit()
                return {
                    statusCode: 204,
                    message:"Berhasil Menghapus Tutor",
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