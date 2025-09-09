import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getSentAcademicReports(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            ar.ID, ar.StudentID, s.Name AS StudentName, ar.GradeID, g.Name AS GradeName, ar.School, ar.ReportDate, ar.StartDate, ar.EndDate, ar.UniquePath,
            ar.CreatedDate, ar.CreatedBy, uc.Username as CreatedByName, ar.UpdatedDate, ar.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.ACADEMIC_REPORTS} ar
        `;

        let joinQuery = `
            JOIN ${tables.STUDENTS} s ON ar.StudentID = s.ID
            JOIN ${tables.GRADES} g ON ar.GradeID = g.ID
            JOIN ${tables.USERS} uc ON ar.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON ar.UpdatedBy = uu.ID
            WHERE ar.IsDraft = FALSE 
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (ar.StartDate >= ? AND ar.EndDate <= ? ) `;
            params.push(filter.startDate, filter.endDate);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND s.Name LIKE ? 
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        if (filter.studentID) {
            filterQuery += `
                AND ar.StudentID = ? 
            `;
            params.push(filter.studentID);
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
                tableName: tables.ACADEMIC_REPORTS,
                tableAlias: 'ar'
            }
        );
    },

    async getAcademicReportsDraft(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            ar.ID, ar.StudentID, s.Name AS StudentName, ar.GradeID, g.Name AS GradeName, ar.School, ar.ReportDate, ar.StartDate, ar.EndDate, ar.UniquePath,
            ar.CreatedDate, ar.CreatedBy, uc.Username as CreatedByName, ar.UpdatedDate, ar.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.ACADEMIC_REPORTS} ar
        `;

        let joinQuery = `
            JOIN ${tables.STUDENTS} s ON ar.StudentID = s.ID
            JOIN ${tables.GRADES} g ON ar.GradeID = g.ID
            JOIN ${tables.USERS} uc ON ar.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON ar.UpdatedBy = uu.ID
            WHERE ar.IsDraft = TRUE 
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (ar.StartDate >= ? AND ar.EndDate <= ? ) `;
            params.push(filter.startDate, filter.endDate);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND s.Name LIKE ? 
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        
        if (filter.studentID) {
            filterQuery += `
                AND s.StudentID = ? 
            `;
            params.push(filter.studentID);
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
                tableName: tables.ACADEMIC_REPORTS,
                tableAlias: 'ar'
            }
        );
    },

    async getAcademicReportDetail(AcademicReportID, connection){
        const query = `
        SELECT 
            ar.ID, ar.StudentID, s.Name AS StudentName, ar.GradeID, g.Name AS GradeName, ar.School, ar.ReportDate, ar.StartDate, ar.EndDate, ar.UniquePath,
            ar.CreatedDate, ar.CreatedBy, uc.Username as CreatedByName, ar.UpdatedDate, ar.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.ACADEMIC_REPORTS} ar
        JOIN ${tables.GRADES} g ON ar.GradeID = g.ID
        JOIN ${tables.STUDENTS} s ON ar.StudentID = s.ID
        JOIN ${tables.USERS} uc ON ar.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON ar.UpdatedBy = uu.ID
        WHERE ar.ID = ?
        `

        const params = [AcademicReportID];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    
    async getAcademicReportDetailByUniquePath(uniquePath, connection){
        const query = `
        SELECT 
            ar.ID, ar.StudentID, s.Name AS StudentName, ar.GradeID, g.Name AS GradeName, ar.School, ar.ReportDate, ar.StartDate, ar.EndDate, ar.UniquePath,
            ar.CreatedDate, ar.CreatedBy, uc.Username as CreatedByName, ar.UpdatedDate, ar.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.ACADEMIC_REPORTS} ar
        JOIN ${tables.GRADES} g ON ar.GradeID = g.ID
        JOIN ${tables.STUDENTS} s ON ar.StudentID = s.ID
        JOIN ${tables.USERS} uc ON ar.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON ar.UpdatedBy = uu.ID
        WHERE ar.UniquePath = ?
        `

        const params = [uniquePath];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    async createAcademicReport(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.ACADEMIC_REPORTS} 
                (StudentID, GradeID, School, ReportDate, StartDate, EndDate, IsDraft, UniquePath,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.StudentID, data.GradeID, data.School, data.ReportDate, data.StartDate, data.EndDate, data.IsDraft, data.UniquePath,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateAcademicReport(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.ACADEMIC_REPORTS} SET
                IsDraft = ?,
                ReportDate = ?,
                StartDate = ?,
                EndDate = ?,
                UpdatedDate = ?,
                UpdatedBy = ?
            WHERE ID = ?
            
            `;

        params.push(
            data.IsDraft, data.ReportDate, data.StartDate, data.EndDate,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    
    async deleteAcademicReport(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.ACADEMIC_REPORTS}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },

    async getUniquePaths(connection){
        const query = `
            SELECT UniquePath
            FROM ${tables.ACADEMIC_REPORTS}
        `;

        const [_data] = await connection.query(query);

        const data = _data.map(item => item.UniquePath) // to return only an array of unique paths

        return data;
    },
}