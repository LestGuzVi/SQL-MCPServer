param name string
param location string = resourceGroup().location
param tags object = {}

// Reference Properties
param appServicePlanId string

// Runtime Properties
@allowed([
  'dotnet', 'dotnetcore', 'dotnet-isolated', 'node', 'python', 'java', 'powershell', 'custom'
])
param runtimeName string
param runtimeNameAndVersion string = '${runtimeName}|${runtimeVersion}'
param runtimeVersion string

// Microsoft.Web/sites Properties
param clientAffinityEnabled bool = false
param linuxFxVersion string = runtimeNameAndVersion
param use32BitWorkerProcess bool = false
param ftpsState string = 'FtpsOnly'
param healthCheckPath string = ''

// Microsoft.Web/sites/config
param allowedOrigins array = []
param alwaysOn bool = true
param appCommandLine string = ''
param appSettings object = {}
param clientCertEnabled bool = false
param clientCertMode string = 'Required'
param connectionStrings array = []
param cors object = {
  allowedOrigins: union([ 'https://portal.azure.com', 'https://ms.portal.azure.com' ], allowedOrigins)
}
param detailedErrorLoggingEnabled bool = true
param httpLoggingEnabled bool = true
param netFrameworkVersion string = 'v4.0'
param nodeVersion string = '~22'
param phpVersion string = 'OFF'
param pythonVersion string = ''
param requestTracingEnabled bool = true
param virtualApplications array = [
  {
    virtualPath: '/'
    physicalPath: 'site\\wwwroot'
    preloadEnabled: false
  }
]
param websiteTimeZone string = ''

resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlanId
    clientAffinityEnabled: clientAffinityEnabled
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      alwaysOn: alwaysOn
      ftpsState: ftpsState
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      use32BitWorkerProcess: use32BitWorkerProcess
      healthCheckPath: healthCheckPath
      cors: cors
      detailedErrorLoggingEnabled: detailedErrorLoggingEnabled
      httpLoggingEnabled: httpLoggingEnabled
      requestTracingEnabled: requestTracingEnabled
      netFrameworkVersion: netFrameworkVersion
      nodeVersion: nodeVersion
      phpVersion: phpVersion
      pythonVersion: pythonVersion
      appCommandLine: appCommandLine
      websiteTimeZone: websiteTimeZone
      appSettings: [for setting in items(appSettings): {
        name: setting.key
        value: setting.value
      }]
      connectionStrings: connectionStrings
      virtualApplications: virtualApplications
    }
    clientCertEnabled: clientCertEnabled
    clientCertMode: clientCertMode
  }

  resource basicPublishingCredentialsPolicies 'basicPublishingCredentialsPolicies@2022-03-01' = {
    name: 'scm'
    properties: {
      allow: false
    }
  }
}

output defaultHostName string = appService.properties.defaultHostName
output id string = appService.id
output name string = appService.name
output uri string = 'https://${appService.properties.defaultHostName}'
