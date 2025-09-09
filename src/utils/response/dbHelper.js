export default{
    async paginate({
        connection, 
        page, 
        perPage, 
        selectQuery,
        joinQuery,
        filterQuery,
        orderBy,
        orderDirection = 'ASC',
        params, 
        tableName,
        tableAlias
    })
    {

        const offset = (page - 1) * perPage;
        let sqlQuery = `
            ${selectQuery} 
            ${joinQuery} 
            ${filterQuery}
        `;

        if(tableAlias){
            sqlQuery += orderBy ? `ORDER BY ${tableAlias}.${orderBy} ${orderDirection}` : ` ORDER BY ${tableAlias}.ID ${orderDirection}`
        }else{
            sqlQuery += orderBy ? `ORDER BY ${orderBy} ${orderDirection}` : ` ORDER BY ID ${orderDirection}`
        }

        sqlQuery += ` LIMIT ${offset}, ${perPage} `;

        let paginationQuery = `SELECT COUNT(*) as total_data FROM ${tableName} ${tableAlias ? tableAlias : ''} `
        paginationQuery = `
            ${paginationQuery} 
            ${joinQuery} 
            ${filterQuery}`;

        const dataQuery = connection.query(sqlQuery, params);

        const countQuery = connection.query(paginationQuery, params);
        const [[data], [count]] = await Promise.all([dataQuery, countQuery]);
    
        const totalData = count[0].total_data;
        const totalPage = Math.ceil(totalData / perPage);
        return {
            data: data, 
            paginationInfo: {
                currentPage : page,
                totalPage : totalPage,
                totalData : totalData,
            }
        };

    }
}