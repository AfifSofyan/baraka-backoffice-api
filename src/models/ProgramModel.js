import tables from "../utils/constants/tables.js";

export default {
    async getAllPrograms(connection){
        const query = `
            SELECT ID, Name
            FROM ${tables.PROGRAMS}
            WHERE IsActive = 1
        `;

        const [data] = await connection.query(query);

        return data;
    },   
}