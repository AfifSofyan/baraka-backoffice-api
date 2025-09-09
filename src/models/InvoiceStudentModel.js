import tables from "../utils/constants/tables.js";

export default {
    async getInvoiceStudents(invoiceID, connection){
        const query = `
            SELECT ist.*, s.Name as StudentName
            FROM ${tables.INVOICE_STUDENTS} ist
            JOIN ${tables.STUDENTS} s ON ist.StudentID = s.ID
            WHERE ist.InvoiceID = ?
        `;

        const params = [invoiceID]

        const [data] = await connection.query(query, params);

        return data;
    },

    async createInvoiceStudent(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.INVOICE_STUDENTS} 
                (InvoiceID, StudentID, GradeID, School)
                VALUES
                (?, ?, ?, ?)
        `;

        params.push(
            data.InvoiceID, data.StudentID, data.GradeID, data.School
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },

    async updateInvoiceStudent(data, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.INVOICE_STUDENTS} SET
                StudentID = ?,
                GradeID = ?,
                School = ?
            WHERE ID = ?
            `;

        params.push(
            data.StudentID, data.GradeID, data.School,
            data.ID
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async deleteInvoiceStudentByInvoiceID(invoiceID, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.INVOICE_STUDENTS}
            WHERE InvoiceID = ? 
        `
        params.push(invoiceID)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}