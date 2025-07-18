const { ensureConnection, sql } = require("../utils/sqlConnection.js");

const DANGEROUS_KEYWORDS = [
  'DELETE', 'DROP', 'UPDATE', 'INSERT', 'ALTER', 'CREATE',
  'TRUNCATE', 'EXEC', 'EXECUTE', 'MERGE', 'REPLACE',
  'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
  'BEGIN', 'DECLARE', 'SET', 'USE', 'BACKUP',
  'RESTORE', 'KILL', 'SHUTDOWN', 'WAITFOR', 'OPENROWSET',
  'OPENDATASOURCE', 'OPENQUERY', 'OPENXML', 'BULK'
];

const DANGEROUS_PATTERNS = [
  /;\s*(DELETE|DROP|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|MERGE|REPLACE|GRANT|REVOKE)/i,
  /UNION\s+(?:ALL\s+)?SELECT.*?(DELETE|DROP|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)/i,
  /--.*?(DELETE|DROP|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)/i,
  /\/\*.*?(DELETE|DROP|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE).*?\*\//i,
  /EXEC\s*\(/i,
  /EXECUTE\s*\(/i,
  /sp_/i,
  /xp_/i,
  /BULK\s+INSERT/i,
  /OPENROWSET/i,
  /OPENDATASOURCE/i,
  /@@/,
  /SYSTEM_USER/i,
  /USER_NAME/i,
  /DB_NAME/i,
  /HOST_NAME/i,
  /WAITFOR\s+DELAY/i,
  /WAITFOR\s+TIME/i,
  /;\s*\w/,
  /\+\s*CHAR\s*\(/i,
  /\+\s*NCHAR\s*\(/i,
  /\+\s*ASCII\s*\(/i,
];

function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Query must be a non-empty string' };
  }
  const cleanQuery = query
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQuery) {
    return { isValid: false, error: 'Query cannot be empty after removing comments' };
  }

  const upperQuery = cleanQuery.toUpperCase();

  if (!upperQuery.startsWith('SELECT')) {
    return { isValid: false, error: 'Query must start with SELECT for security reasons' };
  }

  for (const keyword of DANGEROUS_KEYWORDS) {
    const keywordRegex = new RegExp(`(^|\\s|[^A-Za-z0-9_])${keyword}($|\\s|[^A-Za-z0-9_])`, 'i');
    if (keywordRegex.test(upperQuery)) {
      return { isValid: false, error: `Dangerous keyword '${keyword}' detected in query. Only SELECT operations are allowed.` };
    }
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(query)) {
      return { isValid: false, error: 'Potentially malicious SQL pattern detected. Only simple SELECT queries are allowed.' };
    }
  }

  const statements = cleanQuery.split(';').filter(stmt => stmt.trim().length > 0);
  if (statements.length > 1) {
    return { isValid: false, error: 'Multiple SQL statements are not allowed. Use only a single SELECT statement.' };
  }

  if (query.includes('CHAR(') || query.includes('NCHAR(') || query.includes('ASCII(')) {
    return { isValid: false, error: 'Character conversion functions are not allowed as they may be used for obfuscation.' };
  }

  if (query.length > 10000) {
    return { isValid: false, error: 'Query is too long. Maximum allowed length is 10,000 characters.' };
  }

  return { isValid: true };
}

function sanitizeResult(data) {
  if (!Array.isArray(data)) return [];
  const maxRecords = 10000;
  if (data.length > maxRecords) {
    console.warn(`Query returned ${data.length} records, limiting to ${maxRecords}`);
    return data.slice(0, maxRecords);
  }
  return data.map(record => {
    if (typeof record === 'object' && record !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(record)) {
        const sanitizedKey = key.replace(/[^\w\s-_.]/g, '');
        if (sanitizedKey !== key) {
          console.warn(`Column name sanitized: ${key} -> ${sanitizedKey}`);
        }
        sanitized[sanitizedKey] = value;
      }
      return sanitized;
    }
    return record;
  });
}

function formatResultAsString(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "No records found.";
  }
  const columns = Object.keys(data[0]);
  let output = "";
  output += columns.join(" | ") + "\n";
  output += columns.map(() => "---").join(" | ") + "\n";
  data.forEach(row => {
    output += columns.map(col => String(row[col])).join(" | ") + "\n";
  });
  return output;
}

module.exports = {
  name: "read_data",
  description: "Executes a SELECT query on an MSSQL Database table. The query must start with SELECT and cannot contain any destructive SQL operations for security reasons.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "SQL SELECT query to execute (must start with SELECT and cannot contain destructive operations). Example: SELECT * FROM movies WHERE genre = 'comedy'"
      },
    },
    required: ["query"],
  },
  async run(params) {
    let pool;
    try {

      pool = await ensureConnection();
      
      const { query } = params;
      const validation = validateQuery(query);
      if (!validation.isValid) {
        console.warn(`Security validation failed for query: ${query.substring(0, 100)}...`);
        return `Security validation failed: ${validation.error}`;
      }
      console.log(`Executing validated SELECT query: ${query.substring(0, 200)}${query.length > 200 ? '...' : ''}`);
      const request = new sql.Request(pool);
      const result = await request.query(query);
      const sanitizedData = sanitizeResult(result.recordset);
      const output =
        `Query executed successfully. Retrieved ${sanitizedData.length} record(s)` +
        (result.recordset.length !== sanitizedData.length
          ? ` (limited from ${result.recordset.length} total records)`
          : '') +
        `\n\n` +
        formatResultAsString(sanitizedData);
      return output;
    } catch (error) {
      console.error("Error executing query:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const safeErrorMessage = errorMessage.includes('Invalid object name')
        ? errorMessage
        : 'Database query execution failed';
      return `Failed to execute query: ${safeErrorMessage}`;
    } finally {
      if (pool && pool.close) {
        await pool.close();
      }
    }
  }
};