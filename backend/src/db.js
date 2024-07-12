// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'database-1.cvq8ic2qeevc.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: '12345678',
  port: '3306',
  database: 'halDatabase',
  connectTimeout: 100000
});

connection.connect(error => {
  if (error) {
    console.error('Database connection failed:', error.stack);
    return;
  }
  console.log('Connected to database.');
});

module.exports = connection;
