const mysql = require('mysql2/promise');

// 접속 정보는 backend/.env 에서 읽음 (.env.example 참고, .env 는 저장소에 올리지 않음)
module.exports = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smartfarm',
    dateStrings: true,
    connectionLimit: 5,
});
