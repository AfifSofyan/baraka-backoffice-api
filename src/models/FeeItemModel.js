import tables from "../utils/constants/tables.js";

export default {
    async getFeeItems(feeID, connection){
        const query = `
            SELECT *
            FROM ${tables.FEE_ITEMS}
            WHERE FeeID = ?
        `;

        const params = [feeID]

        const [data] = await connection.query(query, params);

        return data;
    },
    async createFeeItem(data, connection){
        
        const params = [];
        
        const insertQuery = `
            INSERT INTO ${tables.FEE_ITEMS} 
                (FeeID, FeeComponentID, Name, Qty, Price, Subtotal)
                VALUES
                (?, ?, ?, ?, ?, ?)
        `;

        params.push(
            data.FeeID, data.FeeComponentID, data.Name, data.Qty, data.Price, data.Subtotal
        );

        await connection.query(insertQuery, params);

        const selectQuery = "SELECT LAST_INSERT_ID() as ID";

        const [id] = await connection.query(selectQuery);

        return id[0].ID;
    },
    async updateFeeItem(data, connection){
        
        const params = [];
        
        const updateQuery = `
            UPDATE ${tables.FEE_ITEMS} SET
                Name = ?,
                Qty = ?,
                Price = ?,
                Subtotal = ?
            WHERE ID = ?
            `;

        params.push(
            data.Name, data.Qty, data.Price, data.Subtotal,
            data.ID
        );

        const [updatedData] = await connection.query(updateQuery, params);

        return updatedData.affectedRows;
    },

    async deleteFeeItemByFeeID(feeID, connection){
        const params = [];

        const deleteQuery = `
            DELETE FROM ${tables.FEE_ITEMS}
            WHERE FeeID = ? 
        `
        params.push(feeID)

        const data = await connection.query(deleteQuery, params)
        
        return data[0].affectedRows
    }
}