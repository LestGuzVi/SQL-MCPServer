/**
 * ListRelationships Tool
 * 
 * Descripción: Devuelve todas las relaciones y llaves foráneas entre las tablas de la base de datos.
 * Uso: Utiliza esta herramienta para identificar cómo se relacionan las tablas y construir JOINs correctos en tus consultas SQL.
 * Parámetros: Ninguno.
 * Respuesta: Un array de objetos, cada uno describiendo una relación (tabla origen, columna origen, tabla destino, columna destino).
 * Ejemplo de uso: Para construir consultas que involucren varias tablas relacionadas.
 */
const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
  name: "list_relationships",
  description: "Lists foreign key relationships between tables in the MSSQL database.",
    description: 'Devuelve todas las relaciones y llaves foráneas entre las tablas de la base de datos. Utiliza esta herramienta para identificar cómo se relacionan las tablas y construir JOINs correctos en tus consultas SQL. No requiere parámetros. Responde con un array de objetos, cada uno describiendo una relación (tabla origen, columna origen, tabla destino, columna destino). Ejemplo de uso: Para construir consultas que involucren varias tablas relacionadas.',
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  async run() {
    let pool;
    try {
      pool = await ensureConnection();
      const request = new sql.Request(pool);
      
      const result = await request.query(`
        SELECT 
          fk.name AS foreign_key_name,
          tp.name AS parent_table,
          ref.name AS referenced_table,
          c1.name AS parent_column,
          c2.name AS referenced_column
        FROM sys.foreign_keys fk
        INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
        INNER JOIN sys.tables ref ON fk.referenced_object_id = ref.object_id
        INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
        INNER JOIN sys.columns c1 ON fkc.parent_column_id = c1.column_id AND c1.object_id = tp.object_id
        INNER JOIN sys.columns c2 ON fkc.referenced_column_id = c2.column_id AND c2.object_id = ref.object_id
      `);
      if (!result.recordset.length) {
        return "No foreign key relationships found in the database.";
      }

      let output = "Foreign key relationships:\n\n";
      result.recordset.forEach(rel => {
        output += `- [${rel.foreign_key_name}]: ${rel.parent_table}.${rel.parent_column} → ${rel.referenced_table}.${rel.referenced_column}\n`;
      });

      return output;
    } catch (error) {
      console.error("Error listing relationships:", error);
      return {
        success: false,
        message: `Failed to list relationships: ${error.message}`,
        error: 'LIST_RELATIONSHIPS_FAILED'
      };
    } finally {
      if (pool && pool.close) {
        await pool.close();
      }
    }
  }
};