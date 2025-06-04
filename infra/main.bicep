targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string


// Optional parameters to override the default azd resource naming conventions.
// Add the following to main.parameters.json to set a custom name:
// {
//   "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
//   "contentVersion": "1.0.0.0",
//   "parameters": {
//     "environmentName": {
//       "value": "${AZURE_ENV_NAME}"
//     },
//     "location": {
//       "value": "${AZURE_LOCATION}"
//     }
//   }
// }

@description('The base name for all resources')
param baseName string = ''

@description('Custom App Service Plan name')
param appServicePlanName string = ''

@description('Custom App Service name')
param appServiceName string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(baseName) ? 'rg-${baseName}' : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// The application backend
module web './core/host/appservice.bicep' = {
  name: 'web'
  scope: rg
  params: {
    name: !empty(appServiceName) ? appServiceName : '${abbrs.webSitesAppService}web-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'web' })
    appServicePlanId: appServicePlan.outputs.id
    runtimeName: 'node'
    runtimeVersion: '22-lts'
    healthCheckPath: '/health'
    appSettings: {
      PORT: '8000'
      NODE_ENV: 'production'
      WEBSITE_NODE_DEFAULT_VERSION: '~22'
      SCM_DO_BUILD_DURING_DEPLOYMENT: 'true'
    }
  }
}

module appServicePlan './core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'P0V3'
      capacity: 1
    }
  }
}

// App outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

output BACKEND_URI string = web.outputs.uri
