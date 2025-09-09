import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getSentFees(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            f.ID, f.TutorID, t.Name as TutorName, f.FeeCode, f.FeeDate, f.StartDate, f.EndDate, f.Paycut, f.Total, f.UniquePath,
            f.CreatedDate, f.CreatedBy, uc.Username as CreatedByName, f.UpdatedDate, f.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.FEES} f
        `;

        let joinQuery = `
            JOIN ${tables.TUTORS} t ON f.TutorID = t.ID
            JOIN ${tables.USERS} uc ON f.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON f.UpdatedBy = uu.ID
            WHERE f.IsDraft = FALSE 
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (f.StartDate >= ? AND f.EndDate <= ? ) `;
            params.push(filter.startDate, filter.endDate);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND t.Name LIKE ? 
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        
        if (filter.tutorID) {
            filterQuery += `
                AND f.TutorID = ? 
            `;
            params.push(filter.tutorID);
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
                tableName: tables.FEES,
                tableAlias: 'f'
            }
        );
    },

    async getFeesDraft(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            f.ID, f.TutorID, t.Name as TutorName, f.FeeCode, f.FeeDate, f.StartDate, f.EndDate, f.Paycut, f.Total, f.UniquePath,
            f.CreatedDate, f.CreatedBy, uc.Username as CreatedByName, f.UpdatedDate, f.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.FEES} f
        `;

        let joinQuery = `
            JOIN ${tables.TUTORS} t ON f.TutorID = t.ID
            JOIN ${tables.USERS} uc ON f.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON f.UpdatedBy = uu.ID
            WHERE f.IsDraft = TRUE
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (f.StartDate >= ? AND f.EndDate <= ? ) `;
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
                tableName: tables.FEES,
                tableAlias: 'f'
            }
        );
    },

    async getFeeDetail(feeID, connection){
        const query = `
        SELECT 
            f.ID, f.TutorID, t.Name AS TutorName, f.FeeCode, f.FeeDate, f.StartDate, f.EndDate, f.Paycut, f.Total, f.UniquePath,
            f.CreatedDate, f.CreatedBy, uc.Username as CreatedByName, f.UpdatedDate, f.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.FEES} f
        JOIN ${tables.TUTORS} t ON f.TutorID = t.ID
        JOIN ${tables.USERS} uc ON f.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON f.UpdatedBy = uu.ID
        WHERE f.ID = ?
        `

        const params = [feeID];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    
    async getFeeDetailByUniquePath(uniquePath, connection){
        const query = `
        SELECT 
            f.ID, f.TutorID, t.Name AS TutorName, f.FeeCode, f.FeeDate, f.StartDate, f.EndDate, f.Paycut, f.Total, f.UniquePath,
            f.CreatedDate, f.CreatedBy, uc.Username as CreatedByName, f.UpdatedDate, f.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.FEES} f
        JOIN ${tables.TUTORS} t on f.TutorID = t.ID
        JOIN ${tables.USERS} uc ON f.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON f.UpdatedBy = uu.ID
        WHERE f.UniquePath = ?
        `

        const params = [uniquePath];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    async createFee(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.FEES} 
                (TutorID, FeeCode, IsDraft, FeeDate, StartDate, EndDate, Paycut, Total, UniquePath,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.TutorID, data.FeeCode, data.IsDraft, data.FeeDate, data.StartDate, data.EndDate, data.Paycut, data.Total, data.UniquePath,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateFee(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.FEES} SET
                IsDraft = ?,
                FeeDate = ?,
                StartDate = ?,
                EndDate = ?,
                Paycut = ?,
                Total = ?,
                UpdatedDate = ?,
                UpdatedBy = ?
            WHERE ID = ?
            
            `;

        params.push(
            data.IsDraft, data.FeeDate, data.StartDate, data.EndDate, data.Paycut, data.Total,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    
    async deleteFee(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.FEES}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },

    async getUniquePaths(connection){
        const query = `
            SELECT UniquePath
            FROM ${tables.FEES}
        `;

        const [_data] = await connection.query(query);

        const data = _data.map(item => item.UniquePath) // to return only an array of unique paths

        return data;
    },
}