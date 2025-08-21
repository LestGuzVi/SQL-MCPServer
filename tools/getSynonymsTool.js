/**
 * Synonyms Tool
 * 
 * Descripción: Expone el diccionario de sinónimos para mapeo semántico de términos a tablas/columnas.
 * Uso: Permite a agentes y usuarios consultar los sinónimos disponibles para mejorar la interpretación de intenciones.
 * Respuesta: Un objeto JSON con los sinónimos cargados.
 */

const { loadSynonyms } = require("./synonymMapper.js");

module.exports = {
  name: "get_synonyms",
  description: "Devuelve el diccionario de sinónimos para mapeo de términos a tablas/columnas. Útil para agentes LLM y usuarios.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  async run() {
    try {
  const synonyms = loadSynonyms();
  return JSON.stringify(synonyms, null, 2);
    } catch (error) {
      console.error("Error loading synonyms:", error);
      return { error: "Failed to load synonyms." };
    }
  }
};
