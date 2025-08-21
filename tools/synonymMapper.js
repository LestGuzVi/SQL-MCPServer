// Utilidad para mapear sinónimos a tablas/campos reales
const fs = require('fs');
const path = require('path');

const synonymsPath = path.join(__dirname, 'synonyms.json');
let synonyms = {};

function loadSynonyms() {
  if (Object.keys(synonyms).length > 0) return synonyms;
  try {
    const raw = fs.readFileSync(synonymsPath, 'utf8');
    synonyms = JSON.parse(raw);
  } catch (e) {
    console.warn('No se pudo cargar synonyms.json:', e.message);
    synonyms = {};
  }
  return synonyms;
}

function mapTermToTableOrColumn(term) {
  const dict = loadSynonyms();
  const key = term.toLowerCase();
  return dict[key] || term;
}

module.exports = { mapTermToTableOrColumn, loadSynonyms };
