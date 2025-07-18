//const sql = require("mssql");
const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
  name: "describe_table",
  description: "Describes the columns and keys of a given MSSQL table.",
  inputSchema: {
    type: "object",
    properties: {
      table: { type: "string", description: "Table name to describe" }
    },
    required: ["table"]
  },
  async run({ table }) {
    let pool;
    try {
      pool = await ensureConnection();
      const request = new sql.Request(pool);
      // Get columns info
      const columnsResult = await request.query`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ${table}
      `;
      // Get primary keys info
      const keysResult = await sql.query`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = ${table}
      `;
      // Format as string
      let output = `Table "${table}" structure:\n\n`;
      output += "Columns:\n";
      columnsResult.recordset.forEach(col => {
        output += `- ${col.COLUMN_NAME} (${col.DATA_TYPE})${col.IS_NULLABLE === "YES" ? " [nullable]" : ""}\n`;
      });
      output += "\nPrimary Keys:\n";
      if (keysResult.recordset.length === 0) {
        output += "None\n";
      } else {
        keysResult.recordset.forEach(row => {
          output += `- ${row.COLUMN_NAME}\n`;
        });
      }

      return output;
    } catch (error) {
      console.error("Error describing table:", error);
      return {
        success: false,
        message: `Failed to describe table: ${error.message}`,
        error: 'DESCRIBE_TABLE_FAILED'
      };
    }finally {
      if (pool && pool.close) {
        await pool.close();
      }
    }
  }
};