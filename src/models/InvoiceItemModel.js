import tables from "../utils/constants/tables.js";

export default {
    async getInvoiceItems(invoiceID, connection){
        const query = `
            SELECT *
            FROM ${tables.INVOICE_ITEMS}
            WHERE InvoiceID = ?
        `;

        const params = [invoiceID]

        const [data] = await connection.query(query, params);

        return data;
    },
    async createInvoiceItem(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.INVOICE_ITEMS} 
                (InvoiceID, InvoiceComponentID, Name, Duration, Quantity, Cost, Subtotal)
                VALUES
                (?, ?, ?, ?, ?, ?, ?)
        `;

        params.push(
            data.InvoiceID, data.InvoiceComponentID, data.Name, data.Duration, data.Quantity, data.Cost, data.Subtotal
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },
    async updateInvoiceItem(data, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.INVOICE_ITEMS} SET
                Name = ?,
                Duration = ?,
                Qantity = ?,
                Cost = ?,
                Subtotal = ?
            WHERE ID = ?
            `;

        params.push(
            data.Name, data.Duration, data.Quantity, data.Cost, data.Subtotal,
            data.ID
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async deleteInvoiceItemByInvoiceID(invoiceID, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.INVOICE_ITEMS}
            WHERE InvoiceID = ? 
        `
        params.push(invoiceID)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}