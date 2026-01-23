# Installation et Configuration de Gemini Design MCP

## ✅ Installation terminée

Le package `gemini-design-mcp` a été installé avec succès de manière globale sur votre système.

**Version installée :** 3.7.2  
**Emplacement :** `C:\Users\JK\AppData\Roaming\npm\`

## 📋 Configuration dans Cursor

### Étape 1 : Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Créez une nouvelle clé API Gemini
4. Copiez la clé API (vous en aurez besoin pour l'étape suivante)

### Étape 2 : Configurer Cursor

Dans Cursor, la configuration MCP se fait via les paramètres de l'application :

1. **Ouvrez les paramètres de Cursor** :
   - Appuyez sur `Ctrl+,` (ou `Cmd+,` sur Mac)
   - Ou allez dans `File > Preferences > Settings`

2. **Naviguez vers la section MCP** :
   - Cherchez "MCP" ou "Model Context Protocol" dans la barre de recherche des paramètres
   - Ou allez directement dans `Features > MCP Servers`

3. **Ajoutez la configuration suivante** :

```json
{
  "mcpServers": {
    "gemini-design": {
      "command": "node",
      "args": [
        "C:\\Users\\JK\\AppData\\Roaming\\npm\\node_modules\\gemini-design-mcp\\build\\index.js"
      ],
      "env": {
        "GEMINI_API_KEY": "VOTRE_CLÉ_API_GEMINI_ICI"
      }
    }
  }
}
```

**Important :** Remplacez `VOTRE_CLÉ_API_GEMINI_ICI` par votre vraie clé API obtenue à l'étape 1.

### Étape 3 : Redémarrer Cursor

Après avoir ajouté la configuration, redémarrez complètement Cursor pour que les changements prennent effet.

## 🔍 Vérification de l'installation

Pour vérifier que tout fonctionne :

1. Redémarrez Cursor
2. Vérifiez dans les logs de Cursor (View > Output > MCP) qu'il n'y a pas d'erreurs
3. Le serveur MCP devrait apparaître comme disponible dans les outils MCP de Cursor

## 📝 Notes supplémentaires

- **Variable d'environnement** : Vous pouvez également définir `GEMINI_API_KEY` comme variable d'environnement système au lieu de la mettre dans la configuration JSON.

- **Mise à jour** : Pour mettre à jour `gemini-design-mcp` à l'avenir, exécutez :
  ```bash
  npm install -g gemini-design-mcp@latest
  ```

- **Documentation** : Pour plus d'informations sur l'utilisation du serveur MCP Gemini Design, consultez la [documentation officielle](https://www.npmjs.com/package/gemini-design-mcp).

## 🆘 Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez que Node.js est bien dans votre PATH : `node --version`
2. Vérifiez que le chemin vers `index.js` est correct
3. Vérifiez que votre clé API Gemini est valide
4. Consultez les logs MCP dans Cursor pour voir les erreurs détaillées
