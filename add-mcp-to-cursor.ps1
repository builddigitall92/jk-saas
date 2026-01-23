# Script pour ajouter la configuration MCP Gemini Design dans Cursor
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"

Write-Host "Lecture du fichier settings.json de Cursor..." -ForegroundColor Cyan

# Lire le fichier actuel
$content = Get-Content $settingsPath -Raw
$settings = $content | ConvertFrom-Json

Write-Host "Ajout de la configuration MCP..." -ForegroundColor Yellow

# Creer l'objet de configuration MCP
$mcpConfig = @{
    "gemini-design" = @{
        command = "node"
        args = @(
            "C:\Users\JK\AppData\Roaming\npm\node_modules\gemini-design-mcp\build\index.js"
        )
        env = @{
            GEMINI_API_KEY = "gd_N6bEf2URqtb-ZE79Za3G000yNNpj-t2-"
        }
    }
}

# Ajouter la propriete mcpServers
$settings | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value $mcpConfig -Force

# Convertir en JSON et sauvegarder
$json = $settings | ConvertTo-Json -Depth 10
$json | Out-File -FilePath $settingsPath -Encoding UTF8 -NoNewline

Write-Host "Configuration MCP ajoutee avec succes dans settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Redemarrez completement Cursor pour que les changements prennent effet!" -ForegroundColor Yellow
