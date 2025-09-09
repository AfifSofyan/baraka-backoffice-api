import tables from "../utils/constants/tables.js";

export default {
    async getMenuList(roleID, connection){
        const [data] = await connection.query(`
            SELECT m.*
            FROM ${tables.MENUS} m
            JOIN ${tables.ROLE_MENU} rm ON m.ID = rm.MenuID
            WHERE m.IsActive = 1 AND rm.RoleID = ? ;
        `, [roleID]);

        return data;
    },
    async getMenuAccess(roleID, connection){
        const [data] = await connection.query(`
            SELECT m.ID, m.name
            FROM ${tables.MENUS} m
            JOIN ${tables.ROLE_MENU} rm ON m.ID = rm.MenuID
            WHERE rm.RoleID = ? ;
        `, [roleID]);

        return data;
    },
    async isAuthorizedToAccess(roleID, menuName, connection){
        const [data] = await connection.query(`
            SELECT m.*
            FROM ${tables.MENUS} m
            JOIN ${tables.ROLE_MENU} rm ON m.ID = rm.MenuID
            WHERE rm.RoleID = ? AND m.Name = ?;
        `, [roleID, menuName]);

        return data;
    }
}