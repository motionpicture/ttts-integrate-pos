module.exports = {
    mssql: {
        user: 'aggregationAdmin',
        password: 'TTTS!admin',
        server: 'ttts-data-aggregation-development-sqlserver.database.windows.net',
        database: 'ttts-data-aggregation-development-sqldatabase',
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