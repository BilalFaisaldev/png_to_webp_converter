const mysql = require('mysql2');

// Connection pooling configuration using environment variables
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'png_to_webp_db',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : null
});

// Export the promise-based pool wrapper
module.exports = pool.promise();
