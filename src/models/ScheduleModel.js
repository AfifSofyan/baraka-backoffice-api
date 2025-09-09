import tables from "../utils/constants/tables.js";
import studentStatus from "../utils/constants/studentStatus.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getSchedulesByTutorID(filter, connection){

        const query = `
        SELECT 
            sch.ID,
            sch.TutorID, t.Name as TutorName,
            sch.StudentID, s.Name as StudentName,
            sch.SubjectID, sub.Subject as SubjectName,
            sch.DayID, d.DayOfTheWeek as DayOfTheWeek,
            sch.Time, 
            sch.ModeID, m.Name as ModeName,
            CAST(sch.StartDate AS CHAR) AS StartDate
        FROM ${tables.SCHEDULES} sch
        JOIN ${tables.TUTORS} t ON sch.TutorID = t.ID
        JOIN ${tables.STUDENTS} s ON sch.StudentID = s.ID
        JOIN ${tables.SUBJECTS} sub ON sch.SubjectID = sub.ID
        JOIN ${tables.DAYS} d ON sch.DayID = d.ID
        JOIN ${tables.MODE} m ON sch.ModeID = m.ID
        WHERE s.StatusID = ${studentStatus.AKTIF} 
        AND sch.TutorID = ?
        `;
        const params = [filter.tutorID]

        const [data] = await connection.query(query, params)

        return data

    },
    
    async getSchedulesByStudentID(filter, connection){

        const query = `
        SELECT 
            sch.ID,
            sch.TutorID, t.Name as TutorName,
            sch.StudentID, s.Name as StudentName,
            sch.SubjectID, sub.Subject as SubjectName,
            sch.DayID, d.DayOfTheWeek as DayOfTheWeek,
            sch.Time, 
            sch.ModeID, m.Name as ModeName,
            CAST(sch.StartDate AS CHAR) AS StartDate
        FROM ${tables.SCHEDULES} sch
        JOIN ${tables.TUTORS} t ON sch.TutorID = t.ID
        JOIN ${tables.STUDENTS} s ON sch.StudentID = s.ID
        JOIN ${tables.SUBJECTS} sub ON sch.SubjectID = sub.ID
        JOIN ${tables.DAYS} d ON sch.DayID = d.ID
        JOIN ${tables.MODE} m ON sch.ModeID = m.ID
        WHERE s.StatusID = ${studentStatus.AKTIF} 
        AND sch.StudentID = ?
        `;
        const params = [filter.studentID]

        const [data] = await connection.query(query, params)

        return data

    },

    async getTotalSchedules(filter, connection){
        let query = `
        SELECT 
            COUNT (*) AS TotalSchedules
        FROM ${tables.SCHEDULES}
        WHERE 1 = 1 
        `;
        const params = [];

        if(filter.tutorID){
            query += 'AND TutorID = ? '
            params.push(filter.tutorID)
        }

        if(filter.studentID){
            query += 'AND StudentID = ? '
            params.push(filter.studentID)
        }

        const [data] = await connection.query(query, params);

        return data[0].TotalSchedules;
    },

    async getTotalStudentsBySchedules(filter, connection){
        let query = `
        SELECT 
            DISTINCT StudentID
        FROM ${tables.SCHEDULES}
        WHERE 1 = 1 
        `;
        const params = [];

        if(filter.tutorID){
            query += 'AND TutorID = ? '
            params.push(filter.tutorID)
        }

        const [_studentIDList] = await connection.query(query, params);

        const studentIDList = [];

        _studentIDList.forEach(student => {
            studentIDList.push(student.StudentID)
        })

        return studentIDList.length;
    },

    async getTotalTutorsBySchedules(filter, connection){
        let query = `
        SELECT 
            DISTINCT TutorID
        FROM ${tables.SCHEDULES}
        WHERE 1 = 1 
        `;
        const params = [];

        if(filter.studentID){
            query += 'AND StudentID = ? '
            params.push(filter.studentID)
        }

        const [_tutorIDList] = await connection.query(query, params);

        const tutorIDList = [];

        _tutorIDList.forEach(tutor => {
            tutorIDList.push(tutor.TutorID)
        })

        return tutorIDList.length;
    },

    async getScheduleDetail(filter, connection){
        const params = [];
        
        const selectQuery = `
            SELECT 
                sch.ID,
                sch.TutorID, t.Name as TutorName,
                sch.StudentID, s.Name as StudentName,
                sch.SubjectID, sub.Subject as SubjectName,
                sch.DayID, d.DayOfTheWeek as DayOfTheWeek,
                sch.Time, 
                sch.ModeID, m.Name as ModeName,
                CAST(sch.StartDate AS CHAR) AS StartDate,
                sch.Note
            FROM ${tables.SCHEDULES} sch
            JOIN ${tables.TUTORS} t ON sch.TutorID = t.ID
            JOIN ${tables.STUDENTS} s ON sch.StudentID = s.ID
            JOIN ${tables.SUBJECTS} sub ON sch.SubjectID = sub.ID
            JOIN ${tables.DAYS} d ON sch.DayID = d.ID
            JOIN ${tables.MODE} m ON sch.ModeID = m.ID
            WHERE sch.ID = ?
        `;

        params.push(filter.scheduleID);

        const [data] = await connection.query(selectQuery, params);

        return data[0];
    },

    async createSchedule(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.SCHEDULES} 
                (StudentID, TutorID, SubjectID, DayID, ModeID, Time, Note, StartDate,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.StudentID, data.TutorID, data.SubjectID, data.DayID, data.ModeID, data.Time, data.Note, data.StartDate,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateSchedule(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.SCHEDULES} 
                SET
                    
                    StudentID = ?,
                    TutorID = ?,
                    SubjectID = ?,
                    DayID = ?,
                    ModeID = ?,
                    Time = ?,
                    Note = ?,
                    StartDate = ?,
                    UpdatedDate = ?, 
                    UpdatedBy = ?
                WHERE ID = ?
        `;

        params.push(
            data.StudentID, data.TutorID, data.SubjectID, data.DayID, data.ModeID, data.Time, data.Note, data.StartDate,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },
    async deleteSchedule(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.SCHEDULES}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}