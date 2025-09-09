import tables from "../utils/constants/tables.js";

export default {
    async getDayList(connection){
        const query = `
            SELECT *
            FROM ${tables.DAYS}
        `;

        const [data] = await connection.query(query);

        return data;
    },   
}