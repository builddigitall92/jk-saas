# 🚀 Configuration Rapide de Gemini Design MCP

## ✅ Installation déjà terminée
Le package `gemini-design-mcp` est déjà installé sur votre système.

## 📝 ÉTAPES SIMPLES (3 minutes)

### Étape 1 : Obtenir votre clé API Gemini
1. Allez sur https://makersuite.google.com/app/apikey
2. Connectez-vous avec Google
3. Cliquez sur "Create API Key"
4. **COPIEZ la clé API** (vous en aurez besoin tout de suite)

### Étape 2 : Configurer dans Cursor

#### Option A : Via l'interface Cursor (RECOMMANDÉ)
1. **Ouvrez Cursor**
2. **Appuyez sur `Ctrl+Shift+P`** (ou `Cmd+Shift+P` sur Mac)
3. **Tapez** : `MCP: Add Server` ou `Preferences: Open Settings (JSON)`
4. **Ouvrez le fichier de configuration** : Le fichier `settings.json` s'ouvre
5. **Ajoutez cette configuration** :

```json
{
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
}
```

**Important :** Remplacez `COLLEZ_VOTRE_CLÉ_API_ICI` par votre vraie clé API de l'étape 1.

#### Option B : Utiliser le fichier déjà créé
Le fichier `cursor-mcp-config.json` a déjà été créé dans votre projet. Vous pouvez :
1. Ouvrir ce fichier
2. Remplacer `VOTRE_CLÉ_API_GEMINI_ICI` par votre clé API
3. Copier tout le contenu
4. L'ajouter dans les paramètres MCP de Cursor (voir Option A)

### Étape 3 : Redémarrer Cursor
- **Fermez complètement Cursor** (toutes les fenêtres)
- **Rouvrez Cursor**
- Le serveur MCP devrait maintenant être disponible !

## 🔍 Vérification

Pour vérifier que ça fonctionne :
1. Dans Cursor, cherchez les outils MCP disponibles
2. Vous devriez voir "gemini-design" dans la liste des serveurs MCP
3. Les outils de génération de code de design devraient être disponibles

## 🆘 Si ça ne marche pas

### Problème : "MCP: Add Server" n'existe pas
**Solution :** Cursor peut utiliser une interface différente :
1. Allez dans `File > Preferences > Settings`
2. Cherchez "MCP" dans la barre de recherche
3. Cherchez une section "MCP Servers" ou "Model Context Protocol"
4. Ajoutez la configuration manuellement

### Problème : Le serveur ne démarre pas
1. Vérifiez que votre clé API est correcte
2. Vérifiez que le chemin vers `index.js` existe (voir le fichier `cursor-mcp-config.json`)
3. Consultez les logs MCP dans Cursor : `View > Output > MCP`

### Problème : Je ne trouve pas où configurer
**Solution alternative :** Essayez cette méthode :
1. Ouvrez un terminal dans votre projet
2. Exécutez : `code $env:APPDATA\Cursor\User\settings.json` (Windows PowerShell)
3. Ajoutez la configuration MCP dans ce fichier

## 📞 Besoin d'aide ?

Si vous avez toujours des problèmes :
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que gemini-design-mcp est installé : `npm list -g gemini-design-mcp`
3. Consultez le fichier `GEMINI_DESIGN_MCP_SETUP.md` pour plus de détails
