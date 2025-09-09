import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async createNotification(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.NOTIFICATIONS} 
                (Sender, Target, Title, Text, Icon, ActionTitle, RedirectUrl, Date, IsRead)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        params.push(
            data.Sender, data.Target, data.Title, data.Text, data.Icon, data.ActionTitle, data.RedirectUrl, data.Date, data.IsRead
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async getUnreadNotifications(filter, connection){
        const query = `
            SELECT *
            FROM ${tables.NOTIFICATIONS}
            WHERE Target = ?
            AND IsRead = false
        `;

        const params = [filter.userID]

        const [data] = await connection.query(query, params);

        return data;
    },

    async getAllNotifications(filter, page, perPage, connection){
        const selectQuery = `
            SELECT *
            FROM ${tables.NOTIFICATIONS} 
        `;

        const joinQuery = ' WHERE 1 = 1 '

        const filterQuery = `
            AND Target = ? 
        `

        const params = [filter.userID]

        return dbHelper.paginate(
            {
                connection : connection, 
                page: page, 
                perPage: perPage, 
                selectQuery: selectQuery, 
                filterQuery: filterQuery, 
                joinQuery: joinQuery,
                params: params, 
                tableName: tables.NOTIFICATIONS
            }
        );
    },

    async getNotificationDetail(filter, connection){
        const query = `
            SELECT * FROM ${tables.NOTIFICATIONS}
            WHERE ID = ?
        `

        const params = [filter.id]

        const [data] = await connection.query(query, params);

        return data;
    },

    async markNotificationAsRead(id, connection){
        const updateQuery = `
            UPDATE ${tables.NOTIFICATIONS} 
                SET
                    IsRead = 1
                WHERE ID = ?
        `;

        const params = [id];

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async markAllNotificationsAsRead(filter, connection){
        const updateQuery = `
            UPDATE ${tables.NOTIFICATIONS} 
                SET
                    IsRead = 1
                WHERE Target = ?
                AND IsRead = 0
        `;

        const params = [filter.userID];

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    }
    
}