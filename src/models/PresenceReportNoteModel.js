import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getPresenceReportNote(filter, connection){

        const params = [];
        let query = `
        SELECT 
            prn.ID, prn.ReportID, prn.Date, 
            prn.TypeID, pnt.Name as TypeName,
            r.TutorID, t.Name as TutorName,
            r.StudentID, s.Name as StudentName,
            prn.Note,
            prn.CreatedBy, uc.Username as CreatedByName, prn.CreatedDate,
            prn.UpdatedBy, uu.Username as UpdatedByName, prn.UpdatedDate
            FROM ${tables.PRESENCE_REPORT_NOTES} prn
            JOIN ${tables.PRESENCE_NOTE_TYPE} pnt ON prn.TypeID = pnt.ID
            JOIN ${tables.USERS} uc ON prn.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON prn.UpdatedBy = uu.ID
            JOIN ${tables.REPORTS} r ON prn.ReportID = r.ID
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID
            WHERE 1 = 1
        `;
        if(filter.id){
            query += `AND prn.ID = ? `;
            params.push(filter.id);
        }
        if(filter.reportID){
            query += `AND prn.ReportID = ? `;
            params.push(filter.reportID);
        }
        if(filter.startDate && filter.endDate){
            query += `AND prn.Date >= ? AND prn.Date <= ? `
            params.push(filter.startDate, filter.endDate)
        }

        const [data] = await connection.query(query, params)

        return data

    },
    async createPresenceReportNote(data, connection){
        const params = [];

        const insertQuery = `
            INSERT INTO ${tables.PRESENCE_REPORT_NOTES}
            (ReportID, Date, TypeID, Note, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )
        `
        params.push(data.ReportID, data.Date, data.TypeID, data.Note, data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy)
        
        await connection.query(insertQuery, params)

        const selectQuery = `
            SELECT LAST_INSERT_ID() as ID
        `

        const [id] = await connection.query(selectQuery)

        return id[0].ID

    },
    async updatePresenceReportNote(data, id, connection){
        const params = [];

        const updateQuery = `
            UPDATE ${tables.PRESENCE_REPORT_NOTES}
            SET
                TypeID = ?, 
                Note = ?,
                UpdatedDate = ?,
                UpdatedBy = ?
            WHERE ID = ?
        `
        params.push(data.TypeID, data.Note, data.UpdatedDate, data.UpdatedBy, id)
        
        const [updatedData] = await connection.query(updateQuery, params)

        return updatedData.affectedRows

    },
    async deletePresenceReportNote(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.PRESENCE_REPORT_NOTES}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
    
}