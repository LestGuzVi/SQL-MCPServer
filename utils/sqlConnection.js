const sql = require("mssql");
const dbConfig = require("../db-config.js");
require('dotenv').config();

let pool = null;

async function ensureConnection() {
  if (pool && pool.connected) return pool;
  if (pool && pool.close) await pool.close();
  pool = await sql.connect(dbConfig);
  return pool;
}

module.exports = { ensureConnection, sql };