import tables from "../utils/constants/tables.js";

export default {
    async getAcademicReportItems(academicReportID, connection){
        const query = `
            SELECT *
            FROM ${tables.ACADEMIC_REPORT_ITEMS}
            WHERE AcademicReportID = ?
        `;

        const params = [academicReportID]

        const [data] = await connection.query(query, params);

        return data;
    },
    async createAcademicReportItem(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.ACADEMIC_REPORT_ITEMS} 
                (AcademicReportID, ReportID)
                VALUES
                (?, ?)
        `;

        params.push(
            data.AcademicReportID, data.ReportID
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async deleteAcademicReportItemByAcademicReportID(academicReportID, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.ACADEMIC_REPORT_ITEMS}
            WHERE AcademicReportID = ? 
        `
        params.push(academicReportID)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}