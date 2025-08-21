# Publica el código en Azure App Service usando PowerShell
# Uso: Ejecuta este script desde la raíz del proyecto

$resourceGroup = "rg-GMG_MCP"
$appServiceName = "app-web-i2jzrp4f3ako2"
$zipFile = "app.zip"

# Comprimir el contenido del proyecto (excepto el propio zip si existe)
if (Test-Path $zipFile) { Remove-Item $zipFile }
Compress-Archive -Path * -DestinationPath $zipFile -Force

az login --tenant 2f80d4e1-da0e-4b6d-84da-30f67e280e4b
# Publicar el zip en Azure App Service
az webapp deployment source config-zip --resource-group $resourceGroup --name $appServiceName --src $zipFile

# Borrar el zip después del despliegue
Remove-Item $zipFile

Write-Host "Despliegue completado en $appServiceName."
