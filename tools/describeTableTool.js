/**
 * DescribeTable Tool
 * 
 * Descripción: Devuelve la estructura de una tabla específica, incluyendo el nombre y tipo de cada columna.
 * Uso: Utiliza esta herramienta para obtener detalles de las columnas de una tabla antes de construir una consulta SQL.
 * Parámetros:
 *   - table (string): Nombre de la tabla a describir.
 * Respuesta: Un array de objetos, cada uno con el nombre y tipo de columna.
 * Ejemplo de uso: Para saber qué columnas puedes seleccionar o filtrar en una consulta.
 */
//const sql = require("mssql");
//TODO: Asegurar seguridad contra SQL Injection
const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
  name: "describe_table",
  description: "Devuelve la estructura de una tabla específica, incluyendo el nombre y tipo de cada columna. Utiliza esta herramienta para obtener detalles de las columnas de una tabla antes de construir una consulta SQL. Parámetro: table (string), nombre de la tabla a describir. Responde con un array de objetos, cada uno con el nombre y tipo de columna. Ejemplo de uso: Para saber qué columnas puedes seleccionar o filtrar en una consulta.",
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