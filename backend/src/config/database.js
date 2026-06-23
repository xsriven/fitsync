const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Tomate123@',
    database: 'fitsync_db'
});

module.exports = connection;