import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getReportChangeLogs(filter, page, perPage, connection){

        let selectQuery = `
        SELECT 
            rcl.ID, rcl.ReportID,
            r.Date,
            r.TutorID, t.Name as TutorName, r.StudentID, s.Name as StudentName,
            r.Date, r.SubjectID, sub.Subject as SubjectName, rcl.Differences, 
            rcl.CreatedDate, rcl.CreatedBy, uc.Username as CreatedByName
        FROM ${tables.REPORT_CHANGE_LOGS} rcl
        `;

        let joinQuery = `
            JOIN ${tables.REPORTS} r on rcl.ReportID = r.ID
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID
            JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID
            JOIN ${tables.USERS} uc ON rcl.CreatedBy = uc.ID
            WHERE 1 = 1 
        `

        let filterQuery = ""

        const params = [];

        if(filter.tutorID){
            filterQuery += 'AND t.ID = ? '
            params.push(filter.tutorID)
        }
        if(filter.studentID){
            filterQuery += 'AND s.ID = ? '
            params.push(filter.studentID)
        }
        if(filter.startDate && filter.endDate){
            filterQuery += `AND (r.Date >= ? AND r.Date <= ? )`;
            params.push(filter.startDate, filter.endDate);
        }
        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND t.Name LIKE ?
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        return dbHelper.paginate(
            {
                connection : connection, 
                page: page, 
                perPage: perPage, 
                selectQuery: selectQuery, 
                joinQuery: joinQuery,
                filterQuery: filterQuery, 
                params: params, 
                orderBy: 'ID',
                orderDirection: 'DESC',
                tableName: tables.REPORT_CHANGE_LOGS,
                tableAlias: 'rcl'
            }
        );
    },

    async createReportChangeLog(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.REPORT_CHANGE_LOGS} 
                (ReportID, Differences, CreatedDate, CreatedBy)
                VALUES
                (?, ?, ?, ?)
        `;

        params.push(
            data.ReportID, data.Differences, data.CreatedDate, data.CreatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async deleteReportChangeLog(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.REPORT_CHANGE_LOGS}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },

    
}