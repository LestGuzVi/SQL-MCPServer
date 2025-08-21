/**
 * ListTables Tool
 * 
 * Descripción: Devuelve la lista completa de tablas disponibles en la base de datos SQL Server conectada. 
 * Uso: Utiliza esta herramienta siempre que necesites conocer el esquema actual o validar la existencia de una tabla antes de realizar consultas.
 * Parámetros: Ninguno.
 * Respuesta: Un array de nombres de tablas (strings).
 * Ejemplo de uso: Para explorar el esquema antes de construir una consulta SQL dinámica.
 */
const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
  name: "list_tables",
  description: "Devuelve la lista completa de tablas disponibles en la base de datos SQL Server conectada. Utiliza esta herramienta siempre que necesites conocer el esquema actual o validar la existencia de una tabla antes de realizar consultas. No requiere parámetros. Responde con un array de nombres de tablas (strings). Ejemplo de uso: Para explorar el esquema antes de construir una consulta SQL dinámica.",
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