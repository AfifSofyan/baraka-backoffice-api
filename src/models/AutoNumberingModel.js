import tables from "../utils/constants/tables.js";

export default {
    async getAutoNumberDetail(tableName, connection){
        const query = `
            SELECT *
            FROM ${tables.AUTO_NUMBERING}
            WHERE TableName = ?
        `;

        const params = [tableName]

        const [data] = await connection.query(query, params);

        return data;
    },

    async increaseDocumentNumber(tableName, connection){
        const updateQuery = `
            UPDATE ${tables.AUTO_NUMBERING} 
                SET
                    DocumentNumber = DocumentNumber + 1
                WHERE TableName = ?
        `;

        const params = [tableName];

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async resetDocumentNumber(year, monthNumeral, tableName, connection){
        const updateQuery = `
            UPDATE ${tables.AUTO_NUMBERING} 
                SET
                    Year = ?,
                    MonthNumeral = ?,
                    DocumentNumber = 1
                WHERE TableName = ?
        `;

        const params = [year, monthNumeral, tableName];

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    }
}