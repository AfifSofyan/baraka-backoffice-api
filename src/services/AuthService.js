import { dbPool } from "../config/database.js";
import jwt  from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import moment from "moment";
import SibApiV3Sdk from "@getbrevo/brevo";
import NotAuthorized from "../utils/errors/NotAuthorized.js";
import NotFound from "../utils/errors/NotFound.js";
import Forbidden from "../utils/errors/Forbidden.js";
import InternalServer from "../utils/errors/InternalServer.js";

import UserModel from "../models/UserModel.js";
import MenuModel from "../models/MenuModel.js";

import roles from "../utils/constants/roles.js";
import StudentModel from "../models/StudentModel.js";
import TutorModel from "../models/TutorModel.js";
import AdminModel from "../models/AdminModel.js";

dotenv.config()

export default {

    async authenticateUser(req){
        const { usernameOrEmail, password } = req.body;

        const connection = await dbPool.getConnection();

        try {
            const data = await UserModel.authenticateUser(usernameOrEmail, connection);
    
            if( data.length === 1 && data[0].Password === crypto.createHash('sha256').update(password).digest('hex')){

                const {ID, Username, Email, RoleID, RoleName, ProfilePicture, EmailVerifiedAt} = data[0];

                const authenticationToken = jwt.sign({
                    id : ID,
                    username : Username,
                    roleID : RoleID,
                    roleName : RoleName
                }, process.env.AUTHENTICATION_KEY, {expiresIn: '30d'});

                const Name = await UserModel.getUserName(ID, RoleName, connection);

                const Nickname = await UserModel.getUserNickname(ID, RoleName, connection);

                const _menuList = await MenuModel.getMenuList(RoleID, connection);

                let menuList = _menuList.filter(menu => !menu.ParentID ).map(menu => {
                    return {
                        ID: menu.ID,
                        name: menu.Name,
                        path: menu.Path,
                        icon: menu.Icon,
                        submenu: []
                    }
                })

                menuList.forEach(menu => {
                    menu.submenu = _menuList.filter(_menu => _menu.ParentID == menu.ID ).map(_menu => {
                        return {
                            ID: _menu.ID,
                            name: _menu.Name,
                            path: _menu.Path,
                            icon: _menu.Icon,
                        }
                    })
                })

                const menuAccess = await MenuModel.getMenuAccess(RoleID, connection)

                return {
                    id: ID,
                    username : Username,
                    email : Email,
                    roleID : RoleID,
                    roleName : RoleName,
                    profilePicture : ProfilePicture,
                    nickname : Nickname || "user",
                    name : Name,
                    token : authenticationToken,
                    menuList : menuList,
                    menuAccess : menuAccess
                };


            }else{

                throw new NotAuthorized("Username, Email atau Password yang anda masukkan salah");
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async isAuthorizedToAccess(roleID, menuName){
        const connection = await dbPool.getConnection();

        try {
            const data = await MenuModel.isAuthorizedToAccess(roleID, menuName, connection);
    
            if( data.length === 1){

                return true;

            }else{
                throw new Forbidden("Anda Tidak Diizinkan Untuk Mengakses Fitur Ini");
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async checkPassword(req){
        const { username, password } = req.body;

        const connection = await dbPool.getConnection();

        try {
            const data = await UserModel.authenticateUser(username, connection);
    
            if( data.length === 1 && data[0].Password === crypto.createHash('sha256').update(password).digest('hex')){

                return {
                    message:"Correct Password"
                };


            }else{
                throw new NotFound("Password Yang dimasukkan Salah");
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },

    async forgetPassword(req){
        const { email } = req.body;

        const connection = await dbPool.getConnection();

        try {
            const data = await UserModel.checkEmail(email, connection);
    
            if( data.length === 1 && data[0].EmailVerifiedAt != null ){

                const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-*/_.,?%<>";
                let password = "";
                
                for (let i = 0; i < 10; i++) {
                    const randomIndex = Math.floor(Math.random() * charset.length);
                    password += charset.charAt(randomIndex);
                }

                const updatedPasswordAffectedRows = await UserModel.changePassword({NewPassword : password}, data[0].ID, connection)

                if(updatedPasswordAffectedRows !== 1){
                    throw new InternalServer("Gagal Melakukan Reset Password")
                }

                let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

                let apiKey = apiInstance.authentications['apiKey'];
                apiKey.apiKey = process.env.BREVO_API_KEY;

                let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

                const url = process.env.APP_BACKOFFICE_URL + 'login'

                sendSmtpEmail.subject = "Reset Password";
                sendSmtpEmail.htmlContent = `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Email Verification</title><style>body{font-family:'Arial',sans-serif;line-height:1.6;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;padding:20px;background-color:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,.1)}h1{color:#333}.button{display:block; width:120px; margin:auto; padding:10px 20px;font-size:16px;text-align:center;text-decoration:none;background-color:#84ceac;color:#fff;border-radius:5px;transition:background-color .3s}.button:hover{background-color:#2980b9}a{text-decoration:none; color:#84ceac}.cred{line-height:0.8; margin:30 0;}</style></head><body><div class="container"><h1>Reset Password</h1><p>Permintaan reset password berhasil. Silahkan login kembali ke akun anda dengan kredensial berikut:<div class='cred'><p>Email: ${email}</p><p>Password: ${password}</p></div><a class="button" href="${url}">Login</a><p>Jika tombol di atas tidak bekerja, silahkan coba lagi dengan mengunjungi link berikut: <a href="${url}">Login</a></p></div></body></html>
                `;
                sendSmtpEmail.sender = {"name":"Baraka Education","email":"helpdesk@barakaeducation.com"};
                sendSmtpEmail.to = [{"email":email, "name":data[0].Username}];

                apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
                    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                }, function(error) {
                    throw new InternalServer("Failed To Send Email");
                });


                return {
                    message:`Password sementara anda telah dikirimkan ke alamat email ${email}. `
                };

            }else{
                throw new NotFound("Email Tidak Ditemukan Atau Belum Terverifikasi");
            }
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    },


    async getUsernames(){
        const connection = await dbPool.getConnection()

        try {
            const result = await UserModel.getUsernames(connection);

            return result;
        } catch (error) {
            throw error;
        } finally{
            connection.release()
        }
    },

    async getEmails(){
        const connection = await dbPool.getConnection()

        try {
            const result = await UserModel.getEmails(connection);

            return result;
        } catch (error) {
            throw error;
        } finally{
            connection.release()
        }
    },

    async updateUser(data, id){
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try {

            if(data.PasswordChanged){
                const passwordChangedAffectedRows = await UserModel.changePassword(data, id, connection)

                if(passwordChangedAffectedRows !== 1){
                    throw new InternalServer("Gagal Melakukan Perubahan Password")
                }
            }

            const currentEmail = await UserModel.getEmail(id, connection)
            const emailChanged = data.Email != currentEmail

            if(emailChanged){
                if(data.RoleID === roles.STUDENT){
                    await StudentModel.updateStudentEmail(data, id, connection)
                }else if(data.RoleID === roles.TUTOR){
                    await TutorModel.updateTutorEmail(data, id, connection)
                }else if(data.RoleID === roles.SUPERADMIN || data.RoleID === roles.ADMIN){
                    await AdminModel.updateAdminEmail(data, id, connection)
                }

                const affectedEmailRows = await UserModel.unverifyEmail(id, connection)

                if(affectedEmailRows !== 1){
                    throw new InternalServer("Failed to unverify new email")
                }
            }

            const affectedRows = await UserModel.updateUser(data, id, connection)

            if(affectedRows === 1){

                try {
                    const userDetail = await UserModel.getUserDetail(id, connection)

                    const { ID, Username, Email, RoleID, RoleName, EmailVerifiedAt } = userDetail

                    const Name = await UserModel.getUserName(ID, RoleName, connection);

                    const Nickname = await UserModel.getUserNickname(ID, RoleName, connection);

                    const authenticationToken = jwt.sign({
                        id : ID,
                        username : Username,
                        roleID : RoleID,
                        roleName : RoleName
                    }, process.env.AUTHENTICATION_KEY, {expiresIn: '30d'});

                    const data =  {
                        id: ID,
                        username : Username,
                        email : Email,
                        token : authenticationToken,
                    };

                    connection.commit()

                    return {
                        message:"Perubahan Berhasil Disimpan",
                        data: data
                    }

                } catch (error) {
                    throw error
                }

            }else{
                throw new NotFound("Data user yang ingin diubah tidak ditemukan")
            }

        } catch (error) {
            connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },

    async sendVerificationEmail(req){
        const connection = await dbPool.getConnection()

        try{
            const user = req.user

            const userDetail = await UserModel.getUserDetail(user.id, connection)

            const {ID, Username, Email} = userDetail

            const verificationToken = jwt.sign({
                id : ID,
                email: Email,
            }, process.env.MAIL_AUTHENTICATION_KEY, {expiresIn: '1d'})

            const url = process.env.APP_URL + 'verifyemail/' + verificationToken

            let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

            let apiKey = apiInstance.authentications['apiKey'];
            apiKey.apiKey = process.env.BREVO_API_KEY;

            let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

            sendSmtpEmail.subject = "Verification Email";
            sendSmtpEmail.htmlContent = `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Email Verification</title><style>body{font-family:'Arial',sans-serif;line-height:1.6;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;padding:20px;background-color:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,.1)}h1{color:#333}.button{display:block; width:120px; margin:auto; padding:10px 20px;font-size:16px;text-align:center;text-decoration:none;background-color:#84ceac;color:#fff;border-radius:5px;transition:background-color .3s}.button:hover{background-color:#2980b9}a{text-decoration:none; color:#84ceac}</style></head><body><div class="container"><h1>Verifikasi Email</h1><p>Terima kasih telah melakukan verifikasi email akun Baraka Education. Klik tombol di bawah ini untuk melanjutkan proses verifikasi:</p><a class="button" href="${url}">Verifikasi Email</a><p>Jika tombol di atas tidak bekerja, silahkan coba lagi dengan mengunjungi link berikut: <a href="${url}">Verifikasi Email</a></p></div></body></html>
            `;
            sendSmtpEmail.sender = {"name":"Baraka Education","email":"helpdesk@barakaeducation.com"};
            sendSmtpEmail.to = [{"email":Email,"name":Username}];

            apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
                console.log('API called successfully. Returned data: ' + JSON.stringify(data));

            }, function(error) {
                throw new InternalServer("Failed To Send Email");
            });

            return{
                message:`Tautan verifikasi telah berhasil dikirimkan ke alamat ${Email}. Jika dalam 30 menit tidak ada pesan masuk ke email anda dari Baraka Education, silahkan hubungi administrator!`
            }
        }catch(error){
            throw error
        }finally{
            connection.release()
        }
    },

    async verifyEmail(req, res){
        const token = req.params['token']
        const connection = await dbPool.getConnection()

        connection.beginTransaction()
        try{
            if (token) {
                jwt.verify(token, process.env.MAIL_AUTHENTICATION_KEY, async (err, decoded) => {
                    if (err) {
                        throw new Forbidden()
                    }
                    
                    const user = decoded
                    const verificationDate = moment().format('YYYY-MM-DD hh:mm:ss')

                    const affectedUserRows = await UserModel.verifyEmail(user, verificationDate, connection)

                    if(affectedUserRows == 1){
                        connection.commit()

                        const url = process.env.APP_BACKOFFICE_URL + 'backoffice/pengaturan/profil'

                        res.render('verification-success', { url });
                    }else{
                        throw InternalServer("Gagal melakukan verifikasi email")
                    }

                });
            } else {
                throw new NotAuthorized()
            }
        }catch(error){
            connection.rollback()
            const message = error.response ? error.response.data.message : error.message
            res.render('verification-succes', {message})
            throw error
        }finally{
            connection.release()
        }
    },

    async checkEmailVerification(id){
        const connection = await dbPool.getConnection()

        try {
            const result = await UserModel.checkEmailVerification(id, connection);

            return result;
        } catch (error) {
            throw error;
        } finally{
            connection.release()
        }
    }

}