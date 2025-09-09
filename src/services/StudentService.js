import { dbPool } from "../config/database.js"
import StudentModel from "../models/StudentModel.js"
import UserModel from "../models/UserModel.js"
import FilterParams from "../utils/requests/filterParams.js"
import NotFound from "../utils/errors/NotFound.js"
import InternalServer from "../utils/errors/InternalServer.js"
import studentStatus from "../utils/constants/studentStatus.js"
import moment from "moment"
import TutorModel from "../models/TutorModel.js"

export default {

    async getAllStudents(filter, page, perPage){

        const connection = await dbPool.getConnection()

        try {
            const result =  await StudentModel.getAllStudents(filter, page, perPage, connection)
    
            return {
                statusCode: 200,
                message: 'Get Student List Successfully',
                ...result,
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
            const data =  await StudentModel.getTotalNewRegistrants(connection)
    
            return {
                statusCode: 200,
                message: "Get total new student registrants succesfully",
                data: data
            }
        } catch (error) {
            throw error
        }
        finally{
            connection.release()
        }
    },

    async createStudent(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            data.UserID = null

            if(data.IsAccountCreated){
                data.UserID = await UserModel.createUser(data, connection)
            }

            const studentData = await StudentModel.createStudent(data, connection)

            connection.commit()

            return {
                statusCode: 200,
                message:"Create Student Succesfully",
                data: {
                    studentData
                }
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async registerStudent(data){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            data = {
                ...data,
                IsDraft: 1,
                StatusID: studentStatus.PENDAFTAR_BARU,
                CreatedBy: 0,
                CreatedDate: moment().format('YYYY-MM-DD hh:mm:ss'),
                UpdatedBy: 0,
                UpdatedDate: moment().format('YYYY-MM-DD hh:mm:ss')
            }
            
            const studentData = await StudentModel.createStudent(data, connection)

            connection.commit()

            return {
                statusCode: 200,
                message:"Register Student Succesfully",
                data: studentData
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateStudent(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const filter = new FilterParams()
            filter.studentID = id

            const userID = await StudentModel.getUserID(filter, connection)

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
                        throw new InternalServer("Gagal melakukan reset verifikasi email")
                    }
                }
            }

            if(data.StatusID == studentStatus.PENDAFTAR_BARU){
                data.IsDraft = true
            }else{
                data.IsDraft = false
            }

            const affectedStudentRows = await StudentModel.updateStudent(data, id, connection)            

            if(affectedStudentRows === 1){

                connection.commit()

                return {
                    statusCode: 200,
                    message:"Update Student Succesfully",
                    data: {
                        StudentID : id
                    }
                }
            }else{
                throw new NotFound("Data siswa yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async updateStudentByUserID(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {
            const affectedStudentRows = await StudentModel.updateStudentByUserID(data, id, connection)            

            if(affectedStudentRows === 1){

                connection.commit()

                return {
                    statusCode: 200,
                    message:"Update Student Succesfully",
                    data: {
                        StudentID : id
                    }
                }
            }else{
                throw new NotFound("Data siswa yang ingin diubah tidak ditemukan")
            }
        } catch (error) {
            connection.rollback()
            throw error
        } finally{
            connection.release()
        }
    },

    async getStudentDetail(filter){
        const connection = await dbPool.getConnection()

        try {
            const studentDetail = await StudentModel.getStudentDetail(filter, connection)

            let userDetail = {}
            let isAccountCreated = false

            if(studentDetail.UserID){
                filter.userID = studentDetail.UserID

                isAccountCreated = true
                userDetail = await UserModel.getUserSimpleDetail(filter, connection)
            }

            const result = {
                ...studentDetail,
                ...userDetail,
                IsAccountCreated : isAccountCreated
            }

            return {
                statusCode: 200,
                message: "Get Student Detail Successfully",
                data: result,
            }


        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getStudentDetailByUserID(filter){
        const connection = await dbPool.getConnection()

        try {
            const studentDetail = await StudentModel.getStudentDetailByUserID(filter, connection)

            return {
                statusCode: 200,
                message: "Get Student Detail Successfully",
                data: studentDetail,
            }

        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getStudentIDAndName(){
        const connection = await dbPool.getConnection()

        try {
            const result = await StudentModel.getStudentIDAndName(connection)

            return {
                statusCode: 200,
                message: "Get Student ID and Name Successfully",
                data: result
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getStudentIDAndNameBasedOnRole(filter){
        const connection = await dbPool.getConnection()

        try {
            let result = null;

            if(filter.roleName === 'superadmin'){
                result = await StudentModel.getStudentIDAndName(connection)
            }else if(filter.roleName === 'tutor'){

                const tutorDetail = await TutorModel.getTutorDetailByUserID(filter, connection)

                filter.tutorID = tutorDetail.ID

                result = await StudentModel.getStudentIDAndNameByTutorID(filter, connection)
            }

            return {
                statusCode: 200,
                message: "Get Student ID and Name Successfully",
                data: result
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getStudentIDAndNameWithoutInvoice(filter){
        const connection = await dbPool.getConnection()

        try {
            const studentIDAndName = await StudentModel.getStudentIDAndName(connection)
            const studentIDWithInvoice = await StudentModel.getStudentIDWithInvoice(filter, connection)

            const result = studentIDAndName.filter(student => !studentIDWithInvoice.includes(student.ID))
            return {
                statusCode: 200,
                message: "Get Student ID and Name Successfully",
                data: result
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },

    async getStudentIDAndNameWithoutAcademicReport(filter){
        const connection = await dbPool.getConnection()

        try {
            const studentIDAndName = await StudentModel.getStudentIDAndName(connection)
            const studentIDWithAcademicReport = await StudentModel.getStudentIDWithAcademicReport(filter, connection)

            const result = studentIDAndName.filter(student => !studentIDWithAcademicReport.includes(student.ID))
            return {
                statusCode: 200,
                message: "Get Student ID and Name Successfully",
                data: result
            }
        } catch (error) {
            throw error
        } finally {
            connection.release()
        }
    },
    async deleteStudent(id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()

        try {
            const affectedRows = await StudentModel.deleteStudent(id, connection)

            if(affectedRows === 1){
                connection.commit()
                return {
                    statusCode: 204,
                    message:"Berhasil Menghapus Siswa",
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