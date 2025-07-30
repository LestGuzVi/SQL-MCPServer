
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
  - `ListTableTool`: Lista todas las tablas disponibles en la base de datos.
  - `readDataTool`: Ejecuta consultas SELECT seguras sobre tablas SQL Server.
- **Interfaz de prueba web**: `/test` para verificación manual.
- **Conectividad HTTP**: Compatible con MCP Inspector y Copilot Agent Mode.
- **Despliegue Azure**: Listo para Azure App Service y Azure Developer CLI.
- **Datos oficiales**: Utiliza la National Weather Service API (sin necesidad de API key).


## �️ Desarrollo local

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

```bash
# 1. Login a Azure
azd auth login

# 2. Inicializa el proyecto
azd init

# 3. Despliega en Azure
azd up
```

Después del despliegue, tu servidor MCP estará disponible en:
- **Health**: `https://<your-app>.azurewebsites.net/health`
- **MCP Capabilities**: `https://<your-app>.azurewebsites.net/mcp/capabilities`
- **MCP Server**: `https://<your-app>.azurewebsites.net/mcp`
- **Test**: `https://<your-app>.azurewebsites.net/test`


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