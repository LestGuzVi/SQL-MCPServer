require('dotenv').config();

const dbConfig  ={
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { 
    encrypt: true, // true para Azure, false para local
    trustServerCertificate: true // true para desarrollo local
  }
};

module.exports =  dbConfig ;