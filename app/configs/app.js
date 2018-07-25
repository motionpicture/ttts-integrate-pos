module.exports = {
    mssql: {
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        connectionTimeout: 600000,
        requestTimeout: 600000,
        options: {
            encrypt: true
        },
        pool: {
            max: 10000,
            min: 0,
            idleTimeoutMillis: 30000
        }
    }
};