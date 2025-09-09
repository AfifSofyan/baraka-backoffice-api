import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getPresenceScheduleNote(filter, connection){

        const params = [];
        let query = `
        SELECT 
            psn.ID, psn.ScheduleID, psn.Date, 
            psn.TypeID, pnt.Name as TypeName,
            sch.TutorID, t.Name as TutorName,
            sch.StudentID, s.Name as StudentName,
            psn.Note,
            psn.CreatedBy, uc.Username as CreatedByName, psn.CreatedDate,
            psn.UpdatedBy, uu.Username as UpdatedByName, psn.UpdatedDate
            FROM ${tables.PRESENCE_SCHEDULE_NOTES} psn
            JOIN ${tables.PRESENCE_NOTE_TYPE} pnt ON psn.TypeID = pnt.ID
            JOIN ${tables.USERS} uc ON psn.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON psn.UpdatedBy = uu.ID
            JOIN ${tables.SCHEDULES} sch ON psn.ScheduleID = sch.ID
            JOIN ${tables.TUTORS} t ON sch.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON sch.StudentID = s.ID
            WHERE 1 = 1
        `;
        if(filter.id){
            query += `AND psn.ID = ? `;
            params.push(filter.id);
        }
        if(filter.scheduleID){
            query += `AND psn.ScheduleID = ? `;
            params.push(filter.scheduleID);
        }
        if(filter.startDate && filter.endDate){
            query += `AND psn.Date >= ? AND psn.Date <= ? `
            params.push(filter.startDate, filter.endDate)
        }

        const [data] = await connection.query(query, params)

        return data

    },
    async createPresenceScheduleNote(data, connection){
        const params = [];

        const insertQuery = `
            INSERT INTO ${tables.PRESENCE_SCHEDULE_NOTES}
            (ScheduleID, Date, TypeID, Note, CreatedDate, CreatedBy, UpdatedDate, UpdatedBy)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )
        `
        params.push(data.ScheduleID, data.Date, data.TypeID, data.Note, data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy)
        
        await connection.query(insertQuery, params)

        const selectQuery = `
            SELECT LAST_INSERT_ID() as ID
        `

        const [id] = await connection.query(selectQuery)

        return id[0].ID

    },
    async updatePresenceScheduleNote(data, id, connection){
        const params = [];

        const updateQuery = `
            UPDATE ${tables.PRESENCE_SCHEDULE_NOTES}
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
    async deletePresenceScheduleNote(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.PRESENCE_SCHEDULE_NOTES}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },
    async deletePresenceScheduleNoteByScheduleID(scheduleID, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.PRESENCE_SCHEDULE_NOTES}
            WHERE ScheduleID = ? 
        `
        params.push(scheduleID)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
    
}