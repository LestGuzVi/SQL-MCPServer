
# Node.js MCP SQL Server (y Weather Server derivado de esta plantilla: [remote-mcp-webapp-node](https://github.com/Azure-Samples/remote-mcp-webapp-node) )

Servidor MCP (Model Context Protocol) construido con Express.js y Node.js, que implementa el protocolo MCP usando JSON-RPC 2.0 y modificado para proveer herramientas de SQL Server y herramientas meteorológicas basadas en la National Weather Service API. Listo para despliegue en Azure App Service.


## 🚀 Características

- **Express.js**: Framework rápido y flexible para Node.js.
- **Cumplimiento MCP**: Implementación completa del protocolo MCP vía JSON-RPC 2.0.
- **Herramientas meteorológicas**:
  - `get_alerts`: Alertas meteorológicas por estado de EE.UU.
  - `get_forecast`: Pronóstico detallado para cualquier ubicación.
- **Herramientas SQL Server**:
  - `describeTableTool`: Describe la estructura de una tabla SQL Server.
  - `listRelationshipsTool`: Lista las relaciones (foreign keys) entre tablas.
  - `getExamplesQueries`: Lista posibles preguntas y descripción.
  - `getCatalogSamples`: Lista valores importantes de tablas catálogo.
  - `ListTableTool`: Lista todas las tablas disponibles en la base de datos.
  - `readDataTool`: Ejecuta consultas SELECT seguras sobre tablas SQL Server.
  - `getSynonymsTool`: Expone el diccionario de sinónimos para mapeo semántico de términos ambiguos, variantes y valores de catálogo.
- **Interfaz de prueba web**: `/test` para verificación manual.
- **Conectividad HTTP**: Compatible con MCP Inspector y Copilot Agent Mode.
- **Despliegue Azure**: Listo para Azure App Service y Azure Developer CLI.
- **Datos oficiales**: Utiliza la National Weather Service API (sin necesidad de API key).


## 🧠 Flujo MCP recomendado para agentes LLM

1. Consulta **list_tables** para saber qué tablas existen en la base de datos.
2. Usa **describe_table** para ver las columnas de cada tabla relevante antes de construir cualquier consulta.
3. Consulta **list_relationships** para entender cómo se relacionan las tablas y detectar posibles JOINs.
4. Si el usuario menciona un término de catálogo, valor ambiguo o tienes dudas sobre el significado de un valor, consulta **getCatalogSamples** para ver los valores posibles y su descripción.
5. Consulta **getSynonymsTool** para buscar y aclarar términos ambiguos, sinónimos o variantes de palabras clave presentes en la pregunta del usuario.
6. Si la pregunta es compleja o poco frecuente, consulta **getExampleQueries** para obtener ejemplos y considerar si puedes adaptar alguno a la pregunta actual.
7. Cuando tengas el contexto completo (tablas, columnas, relaciones, catálogos y sinónimos), genera la consulta SQL y ejecútala con **readDataTool**.
8. Si en cualquier paso falta información, solicita explícitamente el uso de la tool necesaria antes de continuar.

**Notas:**
- Antes de usar cualquier columna en una consulta, asegúrate de que existe en la tabla usando describe_table.
- Prioriza siempre la claridad y la validez de la consulta sobre la rapidez de respuesta.
- Para términos ambiguos, variantes o valores de catálogo, consulta siempre el diccionario de sinónimos y valida con getCatalogSamples si es necesario.

## 📝 Mejores prácticas para consultas ambiguas y nombres parciales

- Usa búsquedas flexibles en SQL (`LIKE`, `LOWER`) para soportar nombres parciales, mayúsculas/minúsculas y errores menores de tipeo.
- Si el usuario no proporciona el nombre exacto, busca coincidencias parciales y sugiere opciones si hay ambigüedad.
- Normaliza el input del usuario antes de armar la consulta (minúsculas, sin tildes, sin caracteres especiales).
- Amplía el diccionario de sinónimos con alias, variantes y valores frecuentes de catálogo.


## 📝 Desarrollo local

### Requisitos
- Node.js 18+ (recomendado 22+)
- npm

### Instalación y ejecución

```bash
git clone <your-repo-url>
cd remote-mcp-webapp-node
npm install
npm run dev
```

Acceso:
- Servidor: http://localhost:8000/mcp
- Health: http://localhost:8000/health
- Test: http://localhost:8000/test


## 🔌 Conexión MCP

### VS Code Copilot Agent Mode
- Agrega el endpoint MCP: `http://localhost:8000`
- Usa prompts para activar herramientas MCP.

### MCP Inspector
- Instala y ejecuta: `npx @modelcontextprotocol/inspector`
- Conecta vía HTTP al endpoint local.


## 🚀 Despliegue rápido en Azure

### Requisitos
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
- Suscripción activa de Azure

### Despliegue en 3 comandos

Con Azure (Generado automatico de los servicios)
```bash
# 1. Login a Azure
azd auth login

# 2. Inicializa el proyecto
azd init

# 3. Despliega en Azure
azd up
```

### Despliegue a servicio App Service existente
- Utilice el archivo deploy.ps1 para controlar el despliegue si desea utilizar un servicio App Service exitente. Modifique los valores:

```bash
$resourceGroup = "<Grupo de recurso>"
$appServiceName = "<nombre de App Service>"
```

```bash
az login --tenant "<Tenant Id>"
```


Después del despliegue, tu servidor MCP estará disponible en:
- **Health**: `https://<your-app>/health`
- **MCP Capabilities**: `https://<your-app>/mcp/capabilities`
- **MCP Server**: `https://<your-app>/mcp`
- **Test**: `https://<your-app>/test`


## 🔌 Conexión remota MCP

Sigue la misma guía anterior, pero usa la URL de tu App Service.


## 🧪 Pruebas

- Cliente de pruebas: `test-client.js`
- Interfaz web: `/test`
- Todos los métodos MCP retornan respuestas JSON-RPC 2.0 válidas.


## 🌦️ Fuente de datos

Este servidor utiliza la **National Weather Service API**:
- Datos oficiales y en tiempo real
- Sin necesidad de API key
- Alta confiabilidad y precisión

**Azure SQL Server**
- Configurar .env con las credenciales de SQL

## 📝 Notas de arquitectura

- `indexmcp.js`: App principal y lógica MCP.
- Herramientas meteorológicas y SQL Server: Funciones async en `tools/`.
- Rutas y utilidades organizadas por funcionalidad.
- Conexión SQL Server gestionada en `utils/sqlConnection.js`.

## 📄 Recursos útiles

- [Documentación MCP](https://modelcontextprotocol.io/llms-full.txt)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)