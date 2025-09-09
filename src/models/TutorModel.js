import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";
import studentStatus from "../utils/constants/studentStatus.js";

export default {
    async getAllTutors(filter, page, perPage, connection){

        let selectQuery = `
        SELECT 
            t.*, g.Name as GenderName,
            c.Name as CityName, pr.ID as ProvinceID, pr.Name as ProvinceName
            FROM ${tables.TUTORS} t 
        `;

        let joinQuery = `
            JOIN ${tables.GENDERS} g ON t.GenderID = g.ID
            JOIN ${tables.CITIES} c ON t.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            LEFT JOIN ${tables.TUTOR_CAPABILITIES} tc ON tc.TutorID = t.ID
            LEFT JOIN ${tables.CAPABILITIES} cap ON tc.CapabilityID = cap.ID
            WHERE 1 = 1 
        `

        let filterQuery = ""

        const params = [];

        if(filter.capabilityID){
            filterQuery += `AND tc.CapabilityID = ? `;

            params.push(filter.capabilityID);
        }

        if(filter.isDraft){
            filterQuery += `AND t.IsDraft = ? `;
            
            params.push(filter.isDraft);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND (
                    t.Name LIKE ? OR
                    t.Nickname LIKE ? OR
                    t.Phone LIKE ?
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam, searchTextParam, searchTextParam);
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
                tableName: tables.TUTORS,
                tableAlias: 't'
            }
        );
    },

    async getTutorListByTutorIDs(filter, page, perPage, connection){

        let selectQuery = `
        SELECT 
            t.*, g.Name as GenderName,
            c.Name as CityName, pr.ID as ProvinceID, pr.Name as ProvinceName
            FROM ${tables.TUTORS} t 
        `;

        let joinQuery = `
            JOIN ${tables.GENDERS} g ON t.GenderID = g.ID
            JOIN ${tables.CITIES} c ON t.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            LEFT JOIN ${tables.TUTOR_CAPABILITIES} tc ON tc.TutorID = t.ID
            LEFT JOIN ${tables.CAPABILITIES} cap ON tc.CapabilityID = cap.ID
            WHERE 1 = 1 
        `

        let filterQuery = ""

        const params = [];

        const placeholders = filter.tutorIDs.map(() => '?').join(', ');
        filterQuery += `AND t.ID IN (${placeholders}) `;
        params.push(...filter.tutorIDs);

        if(filter.roleName == 'student' && !filter.isActive){
            filterQuery += 'AND FALSE '
        }

        if(filter.capabilityID){
            filterQuery += `AND tc.CapabilityID = ? `;

            params.push(filter.capabilityID);
        }

        if(filter.isDraft){
            filterQuery += `AND t.IsDraft = ? `;
            
            params.push(filter.isDraft);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND (
                    t.Name LIKE ? OR
                    t.Nickname LIKE ? OR
                    t.Phone LIKE ?
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam, searchTextParam, searchTextParam);
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
                tableName: tables.TUTORS,
                tableAlias: 't'
            }
        );
    },

    async getTotalTutors(connection){
        const query = `
        SELECT 
            COUNT (*) AS TotalTutors
        FROM ${tables.TUTORS}
        WHERE IsDraft = 0
        `;
        const params = [];

        const [data] = await connection.query(query, params);

        return data[0].TotalTutors;
    },

    async getTutorShortDetail(filter, connection){
        const query = `
            SELECT ID, Name as TutorName
            FROM ${tables.TUTORS}
            WHERE ID = ?
        `;
        const params = [filter.tutorID];

        const [data] = await connection.query(query, params);

        return data[0];
    },
    async getTutorIDWithScheduleOrReport(filter, page, perPage, connection){

        const params = [];

        let scheduleQuery = `
            SELECT DISTINCT s.TutorID
            FROM ${tables.SCHEDULES}  s
            JOIN ${tables.TUTORS} t ON s.TutorID = t.ID
            JOIN ${tables.STUDENTS} st on s.StudentID = st.ID
            WHERE st.StatusID = ${studentStatus.AKTIF} 
        `

        if(filter.tutorID){
            scheduleQuery += 'AND t.ID = ? '
            params.push(filter.tutorID)
        }

        if(filter.searchText && filter.searchText != ""){
            scheduleQuery += `
                AND (
                    t.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        let reportQuery = `
            SELECT DISTINCT r.TutorID
            FROM ${tables.REPORTS} r
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID 
            WHERE Date >= ? AND Date <= ?
        `
        params.push(filter.startDate, filter.endDate)

        if(filter.tutorID){
            reportQuery += 'AND t.ID = ? '
            params.push(filter.tutorID)
        }

        if(filter.searchText && filter.searchText != ""){
            reportQuery += `
                AND (
                    t.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        let unionQuery = `
            ${scheduleQuery} 
            UNION 
            ${reportQuery}
            ORDER BY TutorID
        `

        const offset = (page - 1) * perPage;
        unionQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_tutorIDList] = await connection.query(unionQuery, params);

        const tutorIDList = [];

        _tutorIDList.forEach(tutor => {
            tutorIDList.push(tutor.TutorID)
        })

        return tutorIDList;
    },

    async getTutorIDWithSchedule(filter, page, perPage, connection){

        const params = [];

        let scheduleQuery = `
            SELECT DISTINCT s.TutorID
            FROM ${tables.SCHEDULES}  s
            JOIN ${tables.TUTORS} t ON s.TutorID = t.ID
            JOIN ${tables.STUDENTS} st on s.StudentID = st.ID
            WHERE st.StatusID = ${studentStatus.AKTIF}
        `
        if(filter.tutorID){
            scheduleQuery += 'AND t.ID = ? '
            params.push(filter.tutorID)
        }
        if(filter.searchText && filter.searchText != ""){
            scheduleQuery += `
                AND (
                    t.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        const offset = (page - 1) * perPage;
        scheduleQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_tutorIDList] = await connection.query(scheduleQuery, params);

        const tutorIDList = [];

        _tutorIDList.forEach(tutor => {
            tutorIDList.push(tutor.TutorID)
        })

        return tutorIDList;
    },

    async getTutorIDWithFee(filter, connection){

        const params = [];

        let query = `
            SELECT DISTINCT f.TutorID
            FROM ${tables.FEES} f
            WHERE 1 = 1 
        `
        
        if(filter.startDate && filter.endDate){
            query += `AND (f.StartDate >= ? AND f.EndDate <= ? )`;
            params.push(filter.startDate, filter.endDate);
        }

        const [_tutorIDList] = await connection.query(query, params);

        const tutorIDList = [];

        _tutorIDList.forEach(tutor => {
            tutorIDList.push(tutor.TutorID)
        })

        return tutorIDList;
    },

    async getTutorIDWithReportWithoutFee(filter, page, perPage, connection){

        const params = [];

        let reportQuery = `
            SELECT DISTINCT r.TutorID
            FROM ${tables.REPORTS} r
            JOIN ${tables.TUTORS} t ON r.TutorID = t.ID 
            WHERE r.Date >= ? AND r.Date <= ? 
        `
        params.push(filter.startDate, filter.endDate)

        reportQuery += `
            AND NOT EXISTS (
                SELECT 1
                FROM ${tables.FEES} f
                WHERE f.TutorID = r.TutorID
                AND f.StartDate <= ?
                AND f.EndDate >= ?
            )
        `

        params.push(filter.startDate, filter.endDate)

        if(filter.tutorID){
            reportQuery += 'AND t.ID = ? '
            params.push(filter.tutorID)
        }

        if(filter.searchText && filter.searchText != ""){
            reportQuery += `
                AND (
                    t.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        const offset = (page - 1) * perPage;
        reportQuery += ` LIMIT ${offset}, ${perPage} `;

        const [_tutorIDList] = await connection.query(reportQuery, params);

        const tutorIDList = [];

        _tutorIDList.forEach(tutor => {
            tutorIDList.push(tutor.TutorID)
        })

        return tutorIDList;
    },

    async getUserID(filter, connection){
        const params = [];

        const selectQuery = `
            SELECT UserID FROM ${tables.TUTORS} WHERE ID = ?
        `
        params.push(filter.tutorID);

        const [data] = await connection.query(selectQuery, params);

        return data[0].UserID;
    },

    async getTutorDetail(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                t.ID, t.UserID, t.Name, t.Nickname, CAST(t.Birth AS CHAR) AS Birth, 
                t.GenderID, t.DegreeID, t.Major, t.College, t.CityID, c.ProvinceID as ProvinceID,
                t.Address, t.Phone, t.Email, t.Instagram, t.CourseModeID, t.IsActive, t.IsDraft,
                t.CreatedDate, t.CreatedBy, uc.Username as CreatedByName, t.UpdatedDate, t.UpdatedBy, uu.Username as UpdatedByName
            FROM ${tables.TUTORS} t
            JOIN ${tables.CITIES} c ON t.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            JOIN ${tables.USERS} uc ON t.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON t.UpdatedBy = uu.ID
            WHERE t.ID = ?
        `;

        params.push(filter.tutorID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getTutorDetailByUserID(filter, connection){
        const params = [];
        
        let selectQuery = `
            SELECT 
                t.ID, t.UserID, t.Name, t.Nickname, CAST(t.Birth AS CHAR) AS Birth, 
                t.GenderID, t.DegreeID, t.Major, t.College, t.CityID, c.ProvinceID as ProvinceID,
                t.Address, t.Phone, t.Email, t.Instagram, t.CourseModeID, t.IsActive, t.IsDraft,
                t.CreatedDate, t.CreatedBy, uc.Username as CreatedByName, t.UpdatedDate, t.UpdatedBy, uu.Username as UpdatedByName
            FROM ${tables.TUTORS} t
            JOIN ${tables.CITIES} c ON t.CityID = c.ID
            JOIN ${tables.PROVINCES} pr ON c.ProvinceID = pr.ID
            JOIN ${tables.USERS} uc ON t.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON t.UpdatedBy = uu.ID
            WHERE t.UserID = ?
        `;

        params.push(filter.userID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async getTutorIDAndName(connection){
        const selectQuery = `
            SELECT ID, Name
            FROM ${tables.TUTORS}
            WHERE IsDraft = 0
        `
        const [data] = await connection.query(selectQuery);

        return data;

    },

    async getTotalNewRegistrants(connection){
        const selectQuery = `
            SELECT COUNT(*) AS TotalNewRegistrants
            FROM ${tables.TUTORS}
            WHERE IsDraft = 1
        `

        const [data] = await connection.query(selectQuery)

        return data[0]
    },

    async createTutor(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.TUTORS} 
                (UserID, Name, Nickname, Birth, GenderID, DegreeID, Major, College,
                CityID, Address, Phone, Email, Instagram, CourseModeID, IsActive, IsDraft,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.UserID, data.Name, data.Nickname, data.Birth, data.GenderID, data.DegreeID, data.Major, data.College,
            data.CityID, data.Address, data.Phone, data.Email, data.Instagram, data.CourseModeID, data.IsAcitve ?? 0, data.IsDraft ?? 0,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return {
            TutorID: id[0].ID,
            TutorName: data.Name
        }
    },

    async updateTutor(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.TUTORS} 
                SET
                    UserID = ?,
                    Name = ?, 
                    Nickname = ?, 
                    Birth = ?, 
                    GenderID = ?, 
                    DegreeID = ?, 
                    Major = ?,
                    College = ?,
                    CityID = ?, 
                    Address = ?, 
                    Phone = ?, 
                    Email = ?,
                    Instagram = ?,
                    CourseModeID = ?, 
                    IsActive = ?,
                    IsDraft = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE ID = ?
        `;

        params.push(
            data.UserID, data.Name, data.Nickname, data.Birth, data.GenderID, data.DegreeID, data.Major, data.College,
            data.CityID, data.Address, data.Phone, data.Email, data.Instagram, data.CourseModeID, data.IsActive, data.IsDraft,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async updateTutorByUserID(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.TUTORS} 
                SET
                    Name = ?, 
                    Nickname = ?, 
                    Birth = ?, 
                    GenderID = ?, 
                    DegreeID = ?, 
                    Major = ?,
                    College = ?,
                    CityID = ?, 
                    Address = ?, 
                    Phone = ?, 
                    Instagram = ?,
                    CourseModeID = ?, 
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE UserID = ?
        `;

        params.push(
            data.Name, data.Nickname, data.Birth, data.GenderID, data.DegreeID, data.Major, data.College,
            data.CityID, data.Address, data.Phone, data.Instagram, data.CourseModeID,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async updateTutorEmail(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.TUTORS} 
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

    async deleteTutor(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.TUTORS}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
    
}