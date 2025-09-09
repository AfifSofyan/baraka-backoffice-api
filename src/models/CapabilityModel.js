import tables from "../utils/constants/tables.js";

export default {
    async getAllCapabilities(connection){
        const query = `
            SELECT ID, SubjectToTeach
            FROM ${tables.CAPABILITIES}
            WHERE IsActive = 1
        `;

        const [data] = await connection.query(query);

        return data;
    },   
}