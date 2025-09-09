import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getReports(filter, page, perPage, connection){

        let selectQuery = `
        SELECT 
            r.ID, r.Date, r.TimeStart, r.TimeEnd, r.Duration,
            r.TutorID, t.Name as TutorName, r.ModeID, m.Name as ModeName,
            r.StudentID, s.Name as StudentName,
            r.SubjectID, sub.Subject as SubjectName, 
            r.Topic, r.Note, r.NextTopic,
            r.IsJoin, r.JoinCode,
            EXISTS (SELECT 1 FROM ${tables.ACADEMIC_REPORT_ITEMS} ari WHERE ari.ReportID = r.ID) as hasAcademicReportItem
        FROM ${tables.REPORTS} r
        `;

        let joinQuery = `
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID
            JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID
            JOIN ${tables.MODE} m ON r.ModeID = m.ID
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
                AND (
                    s.Name LIKE ? OR
                    t.Name LIKE ?
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam, searchTextParam);
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
                orderBy: 'Date',
                orderDirection: 'DESC',
                tableName: tables.REPORTS,
                tableAlias: 'r'
            }
        );
    },

    async getReportNotesForSimilarityChecking(filter, connection){

        let query = `
        SELECT 
            r.ID, r.Date,
            r.TutorID, t.Name as TutorName,
            r.StudentID, s.Name as StudentName,
            r.SubjectID, sub.Subject as SubjectName, 
            r.Topic, r.Note
        FROM ${tables.REPORTS} r
        JOIN ${tables.TUTORS} t ON r.TutorID = t.ID
        JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID
        JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID
        WHERE 1 = 1 
        `

        const params = [];

        if(filter.startDate && filter.endDate){
            query += `AND (r.Date >= ? AND r.Date <= ? )`;
            params.push(filter.startDate, filter.endDate);
        }

        const [data] = await connection.query(query, params);

        return data;

    },

    async getTotalReports(filter, connection){
        let query = `
        SELECT 
            COUNT (*) AS TotalClasses
        FROM ${tables.REPORTS}
        WHERE Date >= ? AND Date <= ?
        `;
        const params = [filter.startDate, filter.endDate];

        if(filter.tutorID){
            query += 'AND TutorID = ? '
            params.push(filter.tutorID)
        }

        if(filter.studentID){
            query += 'AND StudentID = ? '
            params.push(filter.studentID)
        }

        const [data] = await connection.query(query, params);

        return data[0].TotalClasses;
    },

    async getReportDetail(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                r.TutorID, t.Name as TutorName, r.StudentID, s.Name as StudentName, CAST(r.Date AS CHAR) AS Date, r.TimeStart, r.TimeEnd, r.Duration,
                r.SubjectID, sub.Subject as SubjectName, r.Topic, r.ModeID, m.Name as ModeName, r.Score, r.AffectiveID, r.Note, r.NextTopic,
                r.CreatedDate, r.CreatedBy, uc.Username as CreatedByName, r.UpdatedDate, r.UpdatedBy, uu.Username as UpdatedByName

            FROM ${tables.REPORTS} r
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID
            JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID
            JOIN ${tables.MODE} m ON r.ModeID = m.ID
            JOIN ${tables.USERS} uc ON r.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON r.UpdatedBy = uu.ID
            WHERE r.ID = ?
        `;

        params.push(filter.reportID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getReportsForPresenceByTutorID(filter, connection){
        const query = `
        SELECT 
            r.ID, r.Date, r.TimeStart, r.TimeEnd,
            r.TutorID, t.Name as TutorName,
            r.StudentID, s.Name as StudentName,
            r.SubjectID, sub.Subject as SubjectName
        FROM ${tables.REPORTS} r 
        JOIN ${tables.TUTORS} t ON r.TutorID = t.ID 
        JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID 
        JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID 
        WHERE r.TutorID = ? 
            AND r.Date >= ? AND r.Date <= ? 
            ORDER BY r.Date 
        `;
        const params = [filter.tutorID, filter.startDate, filter.endDate];

        const [data] = await connection.query(query, params);

        return data;
    },

    async getReportsForPresenceByStudentID(filter, connection){
        const query = `
        SELECT 
            r.ID, r.Date, r.TimeStart, r.TimeEnd,
            r.TutorID, t.Name as TutorName,
            r.StudentID, s.Name as StudentName,
            r.SubjectID, sub.Subject as SubjectName
        FROM ${tables.REPORTS} r 
        JOIN ${tables.TUTORS} t ON r.TutorID = t.ID 
        JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID 
        JOIN ${tables.SUBJECTS} sub ON r.SubjectID = sub.ID 
        WHERE r.StudentID = ? 
            AND r.Date >= ? AND r.Date <= ? 
            ORDER BY r.Date 
        `;
        const params = [filter.studentID, filter.startDate, filter.endDate];

        const [data] = await connection.query(query, params);

        return data;
    },

    async createReport(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.REPORTS} 
                (TutorID, StudentID, Date, TimeStart, TimeEnd, Duration, IsJoin, JoinCode,
                SubjectID, Topic, ModeID, Score, AffectiveID, Note, NextTopic,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.TutorID, data.StudentID, data.Date, data.TimeStart, data.TimeEnd, data.Duration, data.IsJoin, data.JoinCode,
            data.SubjectID, data.Topic, data.ModeID, data.Score, data.AffectiveID, data.Note, data.NextTopic,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateReport(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.REPORTS} 
                SET
                    TutorID = ?,
                    StudentID = ?,
                    Date = ?,
                    TimeStart = ?,
                    TimeEnd = ?,
                    Duration = ?,
                    SubjectID = ?,
                    Topic = ?,
                    ModeID = ?,
                    Score = ?,
                    AffectiveID = ?,
                    Note = ?,
                    NextTopic = ?,
                    UpdatedDate = ?,
                    UpdatedBy = ?
                WHERE ID = ?
        `;

        params.push(
            data.TutorID, data.StudentID, data.Date, data.TimeStart, data.TimeEnd, data.Duration,
            data.SubjectID, data.Topic, data.ModeID, data.Score, data.AffectiveID, data.Note, data.NextTopic,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async deleteReport(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.REPORTS}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },

    
}