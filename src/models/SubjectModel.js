import tables from "../utils/constants/tables.js";

export default {
    async getSubjectList(connection){
        const query = `
            SELECT *
            FROM ${tables.SUBJECTS}
            WHERE IsActive = 1
        `;

        const [data] = await connection.query(query);

        return data;
    },

    async getSubjectDetail(id, connection){
        const query = `
            SELECT *
            FROM ${tables.SUBJECTS}
            WHERE ID = ?
        `
        const params = [id]

        const [data] = await connection.query(query, params);

        return data[0];
    }
}