import tables from "../utils/constants/tables.js";

export default {
    async getCitiesByProvinceID(filter, connection){
        const params = []
        
        const query = `
            SELECT ID, Name
            FROM ${tables.CITIES}
            WHERE ProvinceID = ? 
        `;

        params.push(filter.provinceID)

        const [data] = await connection.query(query, params);

        return data;
    },   
}