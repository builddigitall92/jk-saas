# 🔧 Installation Stripe CLI - Windows

## Étape 1 : Télécharger Stripe CLI

1. Allez sur : https://github.com/stripe/stripe-cli/releases/latest
2. Téléchargez le fichier : `stripe_X.X.X_windows_x86_64.zip` (la dernière version)
3. Extrayez le fichier `stripe.exe` dans un dossier (ex: `C:\stripe-cli\`)

## Étape 2 : Ajouter au PATH (optionnel mais recommandé)

1. Appuyez sur `Win + R`
2. Tapez : `sysdm.cpl` puis Entrée
3. Onglet **Avancé** → **Variables d'environnement**
4. Dans **Variables système**, trouvez `Path` et cliquez **Modifier**
5. Cliquez **Nouveau** et ajoutez le chemin (ex: `C:\stripe-cli\`)
6. Cliquez **OK** partout
7. **Redémarrez** PowerShell/Terminal

## Étape 3 : Vérifier l'installation

Ouvrez un nouveau PowerShell et tapez :
```powershell
stripe --version
```

Si ça affiche la version, c'est installé ! ✅

## Alternative : Installation via Scoop (si vous avez Scoop)

```powershell
scoop install stripe
```

