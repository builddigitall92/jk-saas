# ⚡ Instructions Rapides - Gemini Design MCP

## 🎯 Ce que vous devez faire (2 minutes)

### 1️⃣ Obtenez votre clé API Gemini
👉 Allez ici : **https://makersuite.google.com/app/apikey**  
👉 Cliquez sur "Create API Key"  
👉 **COPIEZ** la clé (elle ressemble à : `AIzaSy...`)

### 2️⃣ Configurez dans Cursor

#### Méthode 1 : Via l'interface Cursor (LE PLUS SIMPLE)

1. **Ouvrez Cursor**
2. **Appuyez sur `Ctrl+Shift+P`** 
3. **Tapez :** `Preferences: Open Settings (JSON)`
4. **Le fichier settings.json s'ouvre**
5. **Ajoutez cette configuration** à la fin du fichier (AVANT le dernier `}`) :

```json
,
  "mcpServers": {
    "gemini-design": {
      "command": "node",
      "args": [
        "C:\\Users\\JK\\AppData\\Roaming\\npm\\node_modules\\gemini-design-mcp\\build\\index.js"
      ],
      "env": {
        "GEMINI_API_KEY": "COLLEZ_VOTRE_CLÉ_API_ICI"
      }
    }
  }
```

⚠️ **IMPORTANT :**
- N'oubliez pas la **virgule** au début (`,`)
- Remplacez `COLLEZ_VOTRE_CLÉ_API_ICI` par votre vraie clé API
- Le fichier doit rester un JSON valide

#### Méthode 2 : Via le script automatique

1. **Ouvrez un terminal PowerShell** dans votre projet
2. **Exécutez :** `.\configure-gemini-mcp.ps1`
3. **Suivez les instructions** (le script vous demandera votre clé API)
4. **Le script créera** le fichier `cursor-mcp-config.json` avec votre clé
5. **Ajoutez** le contenu de ce fichier dans les paramètres Cursor (voir Méthode 1)

### 3️⃣ Redémarrez Cursor

✅ **Fermez complètement Cursor**  
✅ **Rouvrez Cursor**  
✅ **C'est prêt !**

## 🔍 Comment vérifier que ça marche

1. Dans Cursor, ouvrez la palette de commandes (`Ctrl+Shift+P`)
2. Cherchez "MCP" 
3. Vous devriez voir des commandes liées à MCP
4. Le serveur "gemini-design" devrait être disponible

## ❓ Besoin d'aide ?

- Consultez `CONFIGURER_GEMINI_MCP.md` pour plus de détails
- Consultez `GEMINI_DESIGN_MCP_SETUP.md` pour la documentation complète

## 📋 Résumé des fichiers créés

- ✅ `cursor-mcp-config.json` - Configuration prête (remplacez la clé API)
- ✅ `CONFIGURER_GEMINI_MCP.md` - Guide détaillé
- ✅ `configure-gemini-mcp.ps1` - Script automatique
- ✅ `INSTRUCTIONS_RAPIDES.md` - Ce fichier (guide ultra-rapide)
