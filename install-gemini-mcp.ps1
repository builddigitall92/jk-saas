# Script pour ajouter la configuration MCP Gemini Design dans Cursor avec npx
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"

Write-Host "Lecture du fichier settings.json de Cursor..." -ForegroundColor Cyan

# Lire le fichier actuel
$content = Get-Content $settingsPath -Raw
$settings = $content | ConvertFrom-Json

Write-Host "Ajout de la configuration MCP avec npx..." -ForegroundColor Yellow

# Creer l'objet de configuration MCP avec npx
$mcpConfig = @{
    "gemini-design-mcp" = @{
        command = "npx"
        args = @(
            "-y",
            "gemini-design-mcp@latest"
        )
        env = @{
            API_KEY = "gd_N6bEf2URqtb-ZE79Za3G000yNNpj-t2-"
        }
    }
}

# Ajouter ou mettre à jour la propriete mcpServers
if ($settings.PSObject.Properties.Name -contains "mcpServers") {
    # Si mcpServers existe déjà, on ajoute ou met à jour la configuration
    $settings.mcpServers | Add-Member -MemberType NoteProperty -Name "gemini-design-mcp" -Value $mcpConfig."gemini-design-mcp" -Force
} else {
    # Sinon, on crée la propriété
    $settings | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value $mcpConfig -Force
}

# Convertir en JSON et sauvegarder
$json = $settings | ConvertTo-Json -Depth 10
$json | Out-File -FilePath $settingsPath -Encoding UTF8 -NoNewline

Write-Host "Configuration MCP ajoutee avec succes dans settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Redemarrez completement Cursor pour que les changements prennent effet!" -ForegroundColor Yellow
