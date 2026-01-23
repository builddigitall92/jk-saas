# Script pour mettre à jour la configuration MCP Gemini Design dans Cursor
$settingsPath = "$env:APPDATA\Cursor\User\settings.json"

Write-Host "Lecture du fichier settings.json de Cursor..." -ForegroundColor Cyan

# Lire le fichier actuel
$content = Get-Content $settingsPath -Raw
$settings = $content | ConvertFrom-Json

Write-Host "Mise à jour de la configuration MCP gemini-design..." -ForegroundColor Yellow

# Creer l'objet de configuration MCP avec cmd et npx depuis GitHub
$mcpConfig = @{
    "gemini-design" = @{
        command = "cmd"
        args = @(
            "/c",
            "npx",
            "-y",
            "github:aliargun/mcp-server-gemini"
        )
        env = @{
            GEMINI_API_KEY = "gd_N6bEf2URqtb-ZE79Za3G000yNNpj-t2-"
        }
    }
}

# Mettre à jour ou créer la propriete mcpServers
if ($settings.PSObject.Properties.Name -contains "mcpServers") {
    # Si mcpServers existe déjà, on met à jour ou ajoute la configuration
    $settings.mcpServers | Add-Member -MemberType NoteProperty -Name "gemini-design" -Value $mcpConfig."gemini-design" -Force
} else {
    # Sinon, on crée la propriété
    $settings | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value $mcpConfig -Force
}

# Convertir en JSON et sauvegarder
$json = $settings | ConvertTo-Json -Depth 10
$json | Out-File -FilePath $settingsPath -Encoding UTF8 -NoNewline

Write-Host "Configuration MCP mise a jour avec succes dans settings.json" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Redemarrez completement Cursor pour que les changements prennent effet!" -ForegroundColor Yellow
