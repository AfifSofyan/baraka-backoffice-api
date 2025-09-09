import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";
import studentStatus from "../utils/constants/studentStatus.js";

export default {
    async getAllStudents(filter, page, perPage, connection){

        let selectQuery = `
        SELECT 
            s.*, g.Name as GenderName, gr.Name as GradeName,
            c.Name as CityName, pr.ID as ProvinceID, pr.Name as ProvinceName,
            prg.Name as ProgramName, st.Name as StatusName
        FROM ${tables.STUDENTS} s
        `;

        let joinQuery = `
            JOIN ${tables.GENDERS} g ON s.GenderID = g.ID
            JOIN ${tables.GRADES} gr ON s.GradeID = gr.ID
            JOIN ${tables.CITIES} c ON s.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            JOIN ${tables.PROGRAMS} prg ON s.ProgramID = prg.ID
            JOIN ${tables.STUDENT_STATUS} st ON s.StatusID = st.ID
            WHERE 1 = 1 
        `

        let filterQuery = ""

        const params = [];

        if(filter.roleName == 'tutor' && !filter.isActive){
            filterQuery += 'AND FALSE '
        }
        if(filter.studentIDs && filter.studentIDs.length > 0){
            filterQuery += `AND s.ID IN (${Array(filter.studentIDs.length).fill('?').join(', ')}) `;
            params.push(...filter.studentIDs);
        }else if(filter.roleName == 'tutor' && filter.studentIDs && filter.studentIDs.length === 0){
            filterQuery += `AND FALSE `;
        }
        if(filter.studentStatusID){
            filterQuery += `AND st.ID = ? `
            params.push(filter.studentStatusID)
        }
        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND (
                    s.Name LIKE ? OR
                    s.Nickname LIKE ? OR
                    s.ParentPhone LIKE ? OR
                    s.StudentPhone LIKE ? OR
                    s.School LIKE ? OR
                    s.Address LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam, searchTextParam, searchTextParam, searchTextParam, searchTextParam, searchTextParam);
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
                tableName: tables.STUDENTS,
                tableAlias: 's'
            }
        );
    },

    async getUserID(filter, connection){
        const params = [];

        const selectQuery = `
            SELECT UserID FROM ${tables.STUDENTS} WHERE ID = ?
        `
        params.push(filter.studentID);

        const [data] = await connection.query(selectQuery, params);

        return data[0].UserID;
    },

    async getStudentShortDetail(filter, connection){
        const query = `
            SELECT ID, Name as StudentName
            FROM ${tables.STUDENTS}
            WHERE ID = ?
        `;
        const params = [filter.studentID];

        const [data] = await connection.query(query, params);

        return data[0];
    },

    async getStudentDetail(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                s.ID, s.UserID, s.Name, s.Nickname, CAST(s.Birth AS CHAR) AS Birth, 
                s.GenderID, s.ReligionID, s.GradeID, g.Name AS GradeName, s.Major, s.School, s.CityID, c.ProvinceID as ProvinceID,
                s.Address, s.ParentPhone, s.StudentPhone, s.Email, s.ProgramID, s.StatusID, s.Note,
                s.CreatedDate, s.CreatedBy, uc.Username as CreatedByName, s.UpdatedDate, s.UpdatedBy, uu.Username as UpdatedByName
            FROM ${tables.STUDENTS} s
            JOIN ${tables.CITIES} c ON s.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            JOIN ${tables.GRADES} g on s.GradeID = g.ID
            JOIN ${tables.USERS} uc ON s.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON s.UpdatedBy = uu.ID
            WHERE s.ID = ?
        `;

        params.push(filter.studentID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getStudentDetailByUserID(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                s.ID, s.UserID, s.Name, s.Nickname, CAST(s.Birth AS CHAR) AS Birth, 
                s.GenderID, s.ReligionID, s.GradeID, s.School, s.Major, s.CityID, c.ProvinceID as ProvinceID,
                s.Address, s.ParentPhone, s.StudentPhone, s.Email, s.ProgramID, s.StatusID, ss.Name as StatusName, s.Note,
                s.CreatedDate, s.CreatedBy, uc.Username as CreatedByName, s.UpdatedDate, s.UpdatedBy, uu.Username as UpdatedByName
            FROM ${tables.STUDENTS} s
            JOIN ${tables.STUDENT_STATUS} ss ON s.StatusID = ss.ID
            JOIN ${tables.CITIES} c ON s.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            JOIN ${tables.USERS} uc ON s.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON s.UpdatedBy = uu.ID
            WHERE s.UserID = ?
        `;

        params.push(filter.userID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getStudentIDWithInvoice(filter, connection){

        const params = [];

        let query = `
            SELECT DISTINCT ist.StudentID
            FROM ${tables.INVOICE_STUDENTS} ist
            JOIN ${tables.INVOICES} i ON ist.InvoiceID = i.ID
            WHERE 1 = 1 
        `
        
        if(filter.startDate && filter.endDate){
            query += `AND (i.StartDate >= ? AND i.EndDate <= ? )`;
            params.push(filter.startDate, filter.endDate);
        }

        const [_studentIDList] = await connection.query(query, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.StudentID)
        })

        return studentIDList;
    },

    async getStudentIDWithAcademicReport(filter, connection){

        const params = [];

        let query = `
            SELECT DISTINCT ar.StudentID
            FROM ${tables.ACADEMIC_REPORTS} ar
            WHERE 1 = 1 
        `
        
        if(filter.startDate && filter.endDate){
            query += `AND (ar.StartDate >= ? AND ar.EndDate <= ? )`;
            params.push(filter.startDate, filter.endDate);
        }

        const [_studentIDList] = await connection.query(query, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.StudentID)
        })

        return studentIDList;
    },

    async getActiveStudentID(filter, page, perPage, connection){

        const params = [];

        let selectQuery = `
            SELECT DISTINCT ID
            FROM ${tables.STUDENTS}
            WHERE StatusID = ${studentStatus.AKTIF} 
            AND IsDraft = 0 
        `

        if(filter.studentID){
            selectQuery += 'AND ID = ? '
            params.push(filter.studentID)
        }
        
        if(filter.searchText && filter.searchText != ""){
            selectQuery += `
                AND (
                    Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        const offset = (page - 1) * perPage;
        selectQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_studentIDList] = await connection.query(selectQuery, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.ID)
        })

        return studentIDList;
    },

    async getStudentIDAndName(connection){
        const selectQuery = `
            SELECT ID, Name
            FROM ${tables.STUDENTS}
            WHERE IsDraft = 0
        `

        const [data] = await connection.query(selectQuery)

        return data
    },

    async getStudentIDAndNameByTutorID(filter, connection){
        const selectQuery = `
            SELECT DISTINCT st.ID, st.Name
            FROM ${tables.STUDENTS} st
            JOIN ${tables.SCHEDULES} s ON s.StudentID = st.ID
            JOIN ${tables.TUTORS} t ON s.TutorID = t.ID
            WHERE st.IsDraft = 0
            AND t.ID = ?
        `

        const params = [filter.tutorID]

        const [data] = await connection.query(selectQuery, params)

        return data
    },

    async getStudentStatus(connection){
        const selectQuery = `
            SELECT ID, Name, StatusID
            FROM ${tables.STUDENTS}
        `

        const [data] = await connection.query(selectQuery)

        return data
    },

    async getStudentIDWithReportWithoutInvoice(filter, page, perPage, connection){

        const params = [];

        let reportQuery = `
            SELECT DISTINCT r.StudentID
            FROM ${tables.REPORTS} r
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID 
            WHERE r.Date >= ? AND r.Date <= ? 
        `
        params.push(filter.startDate, filter.endDate)

        reportQuery += `
            AND NOT EXISTS (
                SELECT 1
                FROM ${tables.INVOICES} i
                JOIN ${tables.INVOICE_STUDENTS} ist ON i.ID = ist.InvoiceID
                WHERE ist.StudentID = r.StudentID
                AND i.StartDate <= ?
                AND i.EndDate >= ?
            )
        `

        params.push(filter.startDate, filter.endDate)

        if(filter.studentID){
            reportQuery += 'AND s.ID = ? '
            params.push(filter.studentID)
        }

        if(filter.searchText && filter.searchText != ""){
            reportQuery += `
                AND (
                    s.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        const offset = (page - 1) * perPage;
        reportQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_studentIDList] = await connection.query(reportQuery, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.StudentID)
        })

        return studentIDList;
    },

    async getStudentIDWithReportWithoutAcademicReports(filter, page, perPage, connection){

        const params = [];

        let reportQuery = `
            SELECT DISTINCT r.StudentID
            FROM ${tables.REPORTS} r
            JOIN ${tables.STUDENTS} s ON r.StudentID = s.ID 
            WHERE r.Date >= ? AND r.Date <= ? 
        `
        params.push(filter.startDate, filter.endDate)

        reportQuery += `
            AND NOT EXISTS (
                SELECT 1
                FROM ${tables.ACADEMIC_REPORTS} ar
                WHERE ar.StudentID = r.StudentID
                AND ar.StartDate <= ?
                AND ar.EndDate >= ?
            )
        `

        params.push(filter.startDate, filter.endDate)

        if(filter.studentID){
            reportQuery += 'AND s.ID = ? '
            params.push(filter.studentID)
        }

        if(filter.searchText && filter.searchText != ""){
            reportQuery += `
                AND (
                    s.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        const offset = (page - 1) * perPage;
        reportQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_studentIDList] = await connection.query(reportQuery, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.StudentID)
        })

        return studentIDList;
    },

    async getTotalNewRegistrants(connection){
        const selectQuery = `
            SELECT COUNT(*) AS TotalNewRegistrants
            FROM ${tables.STUDENTS}
            WHERE StatusID = ${studentStatus.PENDAFTAR_BARU}
        `

        const [data] = await connection.query(selectQuery)

        return data[0]
    },

    async createStudent(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.STUDENTS} 
                (UserID, Name, Nickname, Birth, GenderID, ReligionID, GradeID, Major, School,
                CityID, Address, ParentPhone, StudentPhone, Email, ProgramID, StatusID, IsDraft, Note,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.UserID, data.Name, data.Nickname, data.Birth, data.GenderID, data.ReligionID, data.GradeID, data.Major, data.School,
            data.CityID, data.Address, data.ParentPhone, data.StudentPhone, data.Email, data.ProgramID, data.StatusID, data.IsDraft ?? 0, data.Note,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return {
            StudentID: id[0].ID,
            StudentName: data.Name
        }
    },

    async updateStudent(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.STUDENTS} 
                SET
                    UserID = ?,
                    Name = ?, 
                    Nickname = ?, 
                    Birth = ?, 
                    GenderID = ?, 
                    ReligionID = ?,
                    GradeID = ?, 
                    Major = ?,
                    School = ?,
                    CityID = ?, 
                    Address = ?, 
                    ParentPhone = ?, 
                    StudentPhone = ?,
                    Email = ?,
                    ProgramID = ?, 
                    StatusID = ?, 
                    IsDraft = ?,
                    Note = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE ID = ?
        `;

        params.push(
            data.UserID, data.Name, data.Nickname, data.Birth, data.GenderID, data.ReligionID, data.GradeID, data.Major, data.School,
            data.CityID, data.Address, data.ParentPhone, data.StudentPhone, data.Email, data.ProgramID, data.StatusID, data.IsDraft, data.Note,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async updateStudentByUserID(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.STUDENTS} 
                SET
                    Name = ?, 
                    Nickname = ?, 
                    Birth = ?, 
                    GenderID = ?, 
                    ReligionID = ?,
                    GradeID = ?, 
                    Major = ?,
                    School = ?,
                    CityID = ?, 
                    Address = ?, 
                    ParentPhone = ?, 
                    StudentPhone = ?,
                    ProgramID = ?, 
                    StatusID = ?, 
                    Note = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE UserID = ?
        `;

        params.push(
            data.Name, data.Nickname, data.Birth, data.GenderID, data.ReligionID, data.GradeID, data.Major, data.School,
            data.CityID, data.Address, data.ParentPhone, data.StudentPhone, data.ProgramID, data.StatusID, data.Note,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },
    
    async updateStudentEmail(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.STUDENTS} 
                SET
                    Email = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE UserID = ?
        `;

        params.push(
            data.Email,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async deleteStudent(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.STUDENTS}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}