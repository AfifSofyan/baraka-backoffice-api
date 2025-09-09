import tables from "../utils/constants/tables.js";

export default {
    async getFeeComponents(filter, connection){
        let query = `
            SELECT *
            FROM ${tables.FEE_COMPONENTS}
        `;

        if(filter.isActive){
            query += 'WHERE IsActive = TRUE'
        }

        const [data] = await connection.query(query);

        return data;
    },   
}