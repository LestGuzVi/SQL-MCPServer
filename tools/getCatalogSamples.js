/**
 * getCatalogSamples Tool
 * 
 * Descripción: Devuelve ejemplos y descripciones de los valores de las tablas de catálogo principales: TipoAtributo y TipoComponente.
 * Uso: Utiliza esta herramienta para obtener contexto semántico sobre los valores posibles de los catálogos y su significado.
 * Parámetros: Ninguno.
 * Respuesta: Un objeto con dos arrays: tipoAtributo y tipoComponente. Cada elemento incluye id, nombre, descripcion.
 * Ejemplo de uso: Para mapear términos del usuario a los valores reales de los catálogos antes de construir una consulta SQL.
 */

const { ensureConnection, sql } = require("../utils/sqlConnection.js");

module.exports = {
    name: 'getCatalogSamples',
    description: 'Devuelve valores y descripciones de las tablas de catálogo principales: TipoAtributo y TipoComponente.',
    inputSchema: {
        type: 'object',
        properties: {},
        required: []
    },
    outputSchema: {
        type: 'object',
        properties: {
            tipoAtributo: { type: 'array', items: { type: 'object', properties: { idtipoAtributo: {type: 'number'}, nombre: {type: 'string'}, descripcion: {type: 'string'} } } },
            tipoComponente: { type: 'array', items: { type: 'object', properties: { idtipoComponente: {type: 'number'}, nombre: {type: 'string'}, descripcion: {type: 'string'} } } }
        }
    },
    handler: async () => {
        let pool;
        try {
            pool = await ensureConnection();
            const request = new sql.Request(pool);
            const tipoAtributoResult = await request.query('SELECT TOP 10 idTipoAtributo, nombre, descripcion FROM TipoAtributo');
            const tipoComponenteResult = await request.query('SELECT TOP 10 idTipoComponente, nombre, codigo FROM TipoComponente');

            const tipoAtributo = tipoAtributoResult.recordset;
            const tipoComponente = tipoComponenteResult.recordset;

            // Formatear resultados en texto legible
            let texto = 'Catálogo TipoAtributo:\n';
            if (tipoAtributo.length === 0) {
                texto += '  (Sin registros)\n';
            } else {
                tipoAtributo.forEach(row => {
                    texto += `  - idTipoAtributo: ${row.idTipoAtributo}, nombre: ${row.nombre}, descripcion: ${row.descripcion}\n`;
                });
            }
            texto += '\nCatálogo TipoComponente:\n';
            if (tipoComponente.length === 0) {
                texto += '  (Sin registros)\n';
            } else {
                tipoComponente.forEach(row => {
                    texto += `  - idTipoComponente: ${row.idTipoComponente}, nombre: ${row.nombre}, codigo: ${row.codigo}\n`;
                });
            }
            return texto;
        } catch (error) {
            throw new Error(`Failed to fetch catalogs: ${error.message}`);
        } finally {
            if (pool && pool.close) {
                await pool.close();
            }
        }
    }
};
