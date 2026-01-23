# Script de configuration automatique pour Gemini Design MCP dans Cursor
# Ce script configure gemini-design-mcp pour Cursor

Write-Host "=== Configuration de Gemini Design MCP pour Cursor ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier si gemini-design-mcp est installé
Write-Host "Vérification de l'installation de gemini-design-mcp..." -ForegroundColor Yellow
$geminiMcpPath = "C:\Users\JK\AppData\Roaming\npm\node_modules\gemini-design-mcp\build\index.js"
if (Test-Path $geminiMcpPath) {
    Write-Host "✓ gemini-design-mcp est installé" -ForegroundColor Green
} else {
    Write-Host "✗ gemini-design-mcp n'est pas trouvé. Installation..." -ForegroundColor Red
    npm install -g gemini-design-mcp
}

Write-Host ""

# Demander la clé API Gemini
Write-Host "Configuration de la clé API Gemini..." -ForegroundColor Yellow
$apiKey = Read-Host "Entrez votre clé API Gemini (obtenez-la sur https://makersuite.google.com/app/apikey)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "✗ Aucune clé API fournie. Configuration annulée." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Clé API reçue" -ForegroundColor Green
Write-Host ""

# Créer la configuration MCP
$mcpConfig = @{
    mcpServers = @{
        "gemini-design" = @{
            command = "node"
            args = @(
                $geminiMcpPath
            )
            env = @{
                GEMINI_API_KEY = $apiKey
            }
        }
    }
}

# Convertir en JSON
$jsonConfig = $mcpConfig | ConvertTo-Json -Depth 10

# Sauvegarder le fichier de configuration
$configFile = Join-Path $PSScriptRoot "cursor-mcp-config.json"
$jsonConfig | Out-File -FilePath $configFile -Encoding UTF8

Write-Host "✓ Fichier de configuration créé : $configFile" -ForegroundColor Green
Write-Host ""

# Instructions pour l'utilisateur
Write-Host "=== Instructions pour finaliser la configuration dans Cursor ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "ÉTAPE 1 : Ouvrez Cursor et allez dans les paramètres" -ForegroundColor Yellow
Write-Host "   - Appuyez sur Ctrl+, (ou File > Preferences > Settings)"
Write-Host ""
Write-Host "ÉTAPE 2 : Cherchez 'MCP' dans la barre de recherche des paramètres" -ForegroundColor Yellow
Write-Host "   - Ou naviguez vers : Features > MCP Servers"
Write-Host ""
Write-Host "ÉTAPE 3 : Ajoutez la configuration suivante :" -ForegroundColor Yellow
Write-Host ""
Write-Host $jsonConfig -ForegroundColor White
Write-Host ""
Write-Host "OU copiez le contenu du fichier : $configFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "ÉTAPE 4 : Redémarrez Cursor complètement" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Configuration terminée ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le fichier de configuration a été sauvegardé à :" -ForegroundColor Green
Write-Host $configFile -ForegroundColor White
Write-Host ""
