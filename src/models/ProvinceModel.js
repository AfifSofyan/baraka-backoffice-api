import tables from "../utils/constants/tables.js";

export default {
    async getAllProvinces(connection){
        const query = `
            SELECT ID, Name
            FROM ${tables.PROVINCES}
        `;

        const [data] = await connection.query(query);

        return data;
    },   
}