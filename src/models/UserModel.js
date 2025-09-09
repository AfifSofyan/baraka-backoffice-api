import tables from "../utils/constants/tables.js";
import crypto from "crypto";

export default {
    async authenticateUser(usernameOrEmail, connection){
        const [data] = await connection.query(`
            SELECT u.*, r.Name as RoleName 
            FROM ${tables.USERS} u
            JOIN ${tables.ROLES} r ON u.RoleID = r.ID
            WHERE (u.Username = ? OR u.Email = ?) AND u.IsActive = 1;
        `, [usernameOrEmail, usernameOrEmail]);

        return data;
    },

    async getUserName(id, roleName, connection){
        const params = [];
        let selectQuery = "SELECT Name FROM ";

        if(roleName === "superadmin" || roleName === "admin"){
            selectQuery += tables.ADMINS;
        }else if(roleName === "tutor"){
            selectQuery += tables.TUTORS;
        }else if(roleName === "student"){
            selectQuery += tables.STUDENTS;
        }

        const filterQuery = " WHERE UserID = ? ;"
        params.push(id);

        const [data] = await connection.query(selectQuery + filterQuery, params);

        return data[0].Name;
    },

    async getUserNickname(id, roleName, connection){
        const params = [];
        let selectQuery = "SELECT Nickname FROM ";

        if(roleName === "superadmin" || roleName === "admin"){
            selectQuery += tables.ADMINS;
        }else if(roleName === "tutor"){
            selectQuery += tables.TUTORS;
        }else if(roleName === "student"){
            selectQuery += tables.STUDENTS;
        }

        const filterQuery = " WHERE UserID = ? ;"
        params.push(id);

        const [data] = await connection.query(selectQuery + filterQuery, params);

        return data[0].Nickname;
    },

    async getUsernames(connection){
        const selectQuery = `SELECT Username FROM ${tables.USERS}`;

        const [data] = await connection.query(selectQuery);

        const usernameList = []

        data.forEach(user => {
            usernameList.push(user.Username)
        })

        return usernameList;
    },

    async getEmail(id, connection){
        const params = []
        const selectQuery = `
            SELECT Email FROM ${tables.USERS}
            WHERE ID = ?
        `
        params.push(id)

        const [data] = await connection.query(selectQuery, params)

        if(data.length === 1){
            return data[0].Email
        }else{
            return null
        }
    },

    async getEmails(connection){
        const selectQuery = `SELECT Email FROM ${tables.USERS}`;

        const [data] = await connection.query(selectQuery);

        const emailList = []

        data.forEach(user => {
            emailList.push(user.Email)
        })

        return emailList;
    },

    async createUser(data, connection){
        const params = [];

        const insertQuery = `
            INSERT INTO ${tables.USERS}
                (RoleID, Username, Email, Password,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy)
                VALUES
                (?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.RoleID, data.Username, data.Email, crypto.createHash('sha256').update(data.Password).digest('hex'),
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateUser(data, id, connection){
        const params = [];

        const updateQuery = `
            UPDATE ${tables.USERS}
                SET
                    RoleID = ?, 
                    Username = ?, 
                    Email = ?, 
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE ID = ?        
        `;

        params.push(
            data.RoleID, data.Username, data.Email,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async changePassword(data, id, connection){
        const params = []

        const newPassword = crypto.createHash('sha256').update(data.NewPassword).digest('hex')

        const updateQuery = `
            UPDATE ${tables.USERS}
            SET
                Password = ? 
            WHERE ID = ? 
        `
        params.push(newPassword, id)

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async getUserSimpleDetail(filter, connection){
        const params = [];

        const selectQuery = `
            SELECT Username, Email FROM ${tables.USERS}
            WHERE ID = ?
        `;

        params.push(filter.userID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getUserDetail(id, connection){
        const [data] = await connection.query(`
            SELECT u.*, r.Name as RoleName 
            FROM ${tables.USERS} u
            JOIN ${tables.ROLES} r ON u.RoleID = r.ID
            WHERE u.ID = ? ;
        `, [id]);

        return data[0];
    },

    async verifyEmail(user, verificationDate, connection){
        const params = []
        
        const updateQuery = `
            UPDATE ${tables.USERS}
                SET EmailVerifiedAt = ?
            WHERE ID = ? AND Email = ?
        `

        params.push(verificationDate, user.id, user.email)

        const [updatedData] = await connection.query(updateQuery, params)

        return updatedData.affectedRows
    },

    async unverifyEmail(id, connection){
        const params = []

        const updateQuery = `
            UPDATE ${tables.USERS}
                SET EmailVerifiedAt = NULL
            WHERE ID = ?
        `

        params.push(id)

        const [updatedData] = await connection.query(updateQuery, params)

        return updatedData.affectedRows
    },

    async checkEmailVerification(id, connection){
        const [data] = await connection.query(`
            SELECT u.EmailVerifiedAt
            FROM ${tables.USERS} u
            WHERE u.ID = ? ;
        `, [id]);

        return data[0];
    },

    async checkEmail(email, connection){
        const [data] = await connection.query(`
            SELECT u.ID, u.Username, u.EmailVerifiedAt
            FROM ${tables.USERS} u
            WHERE u.Email = ? ;
        `, [email]);

        return data;
    },

    async getAdmins(connection){
        const adminRoleQuery = `SELECT ID FROM ${tables.ROLES} WHERE NAME IN ('superadmin', 'admin')`

        const [roleData] = await connection.query(adminRoleQuery);

        if(!roleData){
            return []
        }

        const roleIDs = roleData.map(role => {
            return role.ID
        })

        const selectQuery = `SELECT * FROM ${tables.USERS} WHERE RoleID IN (${Array(roleIDs.length).fill('?').join(', ')}) `;
        const params = [...roleIDs]

        const [data] = await connection.query(selectQuery, params);

        return data;
    }



}