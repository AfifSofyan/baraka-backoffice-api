import tables from "../utils/constants/tables.js";
import dbHelper from "../utils/response/dbHelper.js";

export default {
    async getSentInvoices(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            i.ID, i.InvoiceCode, i.InvoiceDate, i.StartDate, i.EndDate, i.Discount, i.Total, i.UniquePath,
            i.CreatedDate, i.CreatedBy, uc.Username as CreatedByName, i.UpdatedDate, i.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.INVOICES} i
        `;

        let joinQuery = `
            
            JOIN ${tables.USERS} uc ON i.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON i.UpdatedBy = uu.ID
            WHERE i.IsDraft = FALSE 
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (i.StartDate >= ? AND i.EndDate <= ? ) `;
            params.push(filter.startDate, filter.endDate);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND EXISTS (
                    SELECT 1
                    FROM invoice_students ist
                    JOIN students s ON ist.StudentID = s.ID
                    WHERE ist.InvoiceID = i.ID
                    AND s.Name LIKE ? 
                )
                `;

            const searchTextParam = `%${filter.searchText}%`;
            params.push(searchTextParam);
        }

        
        if (filter.studentID) {
            filterQuery += `
                AND EXISTS (
                    SELECT 1
                    FROM invoice_students ist
                    WHERE ist.InvoiceID = i.ID
                    AND ist.StudentID = ?
                )
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
                tableName: tables.INVOICES,
                tableAlias: 'i'
            }
        );
    },

    async getInvoicesDraft(filter, page, perPage, connection){
        let selectQuery = `
        SELECT 
            i.ID, i.InvoiceCode, i.InvoiceDate, i.StartDate, i.EndDate, i.Discount, i.Total,
            i.CreatedDate, i.CreatedBy, uc.Username as CreatedByName, i.UpdatedDate, i.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.INVOICES} i
        `;

        let joinQuery = `
            
            JOIN ${tables.USERS} uc ON i.CreatedBy = uc.ID
            JOIN ${tables.USERS} uu ON i.UpdatedBy = uu.ID
            WHERE i.IsDraft = TRUE 
        `

        let filterQuery = ""

        const params = [];

        if(filter.startDate && filter.endDate){
            filterQuery += `AND (i.StartDate >= ? AND i.EndDate <= ? ) `;
            params.push(filter.startDate, filter.endDate);
        }

        if(filter.searchText && filter.searchText != ""){
            filterQuery += `
                AND EXISTS (
                    SELECT 1
                    FROM invoice_students ist
                    JOIN students s ON ist.StudentID = s.ID
                    WHERE ist.InvoiceID = i.ID
                    AND s.Name LIKE ? 
                )
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
                tableName: tables.INVOICES,
                tableAlias: 'i'
            }
        );
    },

    async getInvoiceDetail(invoiceID, connection){
        const query = `
        SELECT 
            i.ID, i.InvoiceCode, i.InvoiceDate, i.StartDate, i.EndDate, i.Discount, i.Total, i.UniquePath,
            i.CreatedDate, i.CreatedBy, uc.Username as CreatedByName, i.UpdatedDate, i.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.INVOICES} i
        JOIN ${tables.USERS} uc ON i.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON i.UpdatedBy = uu.ID
        WHERE i.ID = ?
        `

        const params = [invoiceID];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    async getInvoiceDetailByUniquePath(uniquePath, connection){
        const query = `
        SELECT 
            i.ID, i.InvoiceCode, i.InvoiceDate, i.StartDate, i.EndDate, i.Discount, i.Total, i.UniquePath,
            i.CreatedDate, i.CreatedBy, uc.Username as CreatedByName, i.UpdatedDate, i.UpdatedBy, uu.Username as UpdatedByName
        FROM ${tables.INVOICES} i
        JOIN ${tables.USERS} uc ON i.CreatedBy = uc.ID
        JOIN ${tables.USERS} uu ON i.UpdatedBy = uu.ID
        WHERE i.UniquePath = ?
        `

        const params = [uniquePath];

        const [data] = await connection.query(query, params);

        return data[0];        
    },

    async createInvoice(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.INVOICES} 
                (InvoiceCode, IsDraft, InvoiceDate, StartDate, EndDate, Discount, Total, UniquePath,
                CreatedDate, CreatedBy, UpdatedDate, UpdatedBy )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `;

        params.push(
            data.InvoiceCode, data.IsDraft, data.InvoiceDate, data.StartDate, data.EndDate, data.Discount, data.Total, data.UniquePath,
            data.CreatedDate, data.CreatedBy, data.UpdatedDate, data.UpdatedBy
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateInvoice(data, id, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.INVOICES} SET
                IsDraft = ?,
                InvoiceDate = ?,
                StartDate = ?,
                EndDate = ?,
                Discount = ?,
                Total = ?,
                UpdatedDate = ?,
                UpdatedBy = ?
            WHERE ID = ?
            
            `;

        params.push(
            data.IsDraft, data.InvoiceDate, data.StartDate, data.EndDate, data.Discount, data.Total,
            data.UpdatedDate, data.UpdatedBy,
            id
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    
    async deleteInvoice(id, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.INVOICES}
            WHERE ID = ? 
        `
        params.push(id)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    },

    async getUniquePaths(connection){
        const query = `
            SELECT UniquePath
            FROM ${tables.INVOICES}
        `;

        const [_data] = await connection.query(query);

        const data = _data.map(item => item.UniquePath) // to return only an array of unique paths

        return data;
    },

}