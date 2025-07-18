const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
  name: "list_tables",
  description: "List all tables in the database",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  async handler(args) {
    const state = args.state;
    let pool;
    try {

      pool = await ensureConnection();
      const request = new sql.Request(pool);
      const result = await request.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
      if (!result.recordset.length) {
        return "No tables found in the database.";
      }
      let output = "Tables in the database:\n\n";
      result.recordset.forEach(row => {
        output += `- ${row.TABLE_NAME}\n`;
      });
      return output;
    } catch (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }finally {
      if (pool && pool.close) {
        await pool.close();
      }
    }
  }
};