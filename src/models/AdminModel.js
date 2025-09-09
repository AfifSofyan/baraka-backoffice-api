import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {

    async updateAdminEmail(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.ADMINS} 
                SET
                    Email = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE UserID = ?
        `;

        params.push(
            data.Email,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async getAdminDetailByUserID(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                a.ID, a.UserID, a.Name, a.Nickname, a.GenderID, 
                a.CreatedDate, a.CreatedBy, uc.Username as CreatedByName, a.UpdatedDate, a.UpdatedBy, uu.Username as UpdatedByName
            FROM ${tables.ADMINS} a
            JOIN ${tables.USERS} uc ON a.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON a.UpdatedBy = uu.ID
            WHERE a.UserID = ?
        `;

        params.push(filter.userID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },
    
    async updateAdminByUserID(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.ADMINS} 
                SET
                    UserID = ?,
                    Name = ?, 
                    Nickname = ?, 
                    GenderID = ?, 
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE UserID = ?
        `;

        params.push(
            data.UserID, data.Name, data.Nickname, data.GenderID,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },
}