const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'sasaw337',
    database: 'fitsync_db'
});

module.exports = connection;