/**
 * getExampleQueries Tool
 *
 * Descripción: Devuelve ejemplos de consultas y prompts almacenados en la tabla ConsultasEjemplos para ayudar a potenciar el contexto y las capacidades del agente.
 * Uso: Utiliza esta herramienta para obtener ejemplos de preguntas frecuentes, prompts sugeridos y sus respuestas esperadas.
 * Parámetros: Ninguno.
 * Respuesta: Un array de objetos, cada uno con los campos id, pregunta, prompt, respuesta_esperada.
 * Ejemplo de uso: Para mostrar ejemplos al usuario o enriquecer el contexto del agente antes de construir una consulta SQL.
 */

const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
    name: 'getExampleQueries',
    description: 'Devuelve ejemplos de consultas y prompts almacenados en la tabla ConsultasEjemplos para ayudar a potenciar el contexto y las capacidades del agente.',
    inputSchema: {
        type: 'object',
        properties: {},
        required: []
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {                
                consulta: { type: 'string' },
                descripcion: { type: 'string' }
                //respuesta_esperada: { type: 'string' }
            }
        }
    },
    handler: async () => {
        let pool;
        try {
            pool = await ensureConnection();
            const request = new sql.Request(pool);
            const result = await request.query('SELECT top 10 consulta, descripcion FROM ConsultasEjemplos where prioridad = 1');
            const ejemplos = result.recordset;
            if (!ejemplos.length) {
                return 'No hay ejemplos de consultas disponibles.';
            }
            let texto = 'Ejemplos de Consultas:\n';
            ejemplos.forEach((ej, idx) => {
                texto += `\n${idx + 1}. Consulta: ${ej.consulta}\n   Descripción: ${ej.descripcion}\n`;
            });
            return texto;
        } catch (error) {
            throw new Error(`Failed to fetch example queries: ${error.message}`);
        } finally {
            if (pool && pool.close) {
                await pool.close();
            }
        }
    }
};
