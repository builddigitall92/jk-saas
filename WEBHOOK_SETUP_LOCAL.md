# 🔗 Configuration Webhooks Stripe en Local - Guide Étape par Étape

## 📋 Prérequis

- Stripe CLI installé (voir `INSTALL_STRIPE_CLI.md`)
- Application Next.js lancée sur `http://localhost:3000`
- Clés Stripe de TEST configurées dans `.env.local`

---

## 🚀 ÉTAPE 1 : Installer Stripe CLI

### Méthode 1 : Téléchargement manuel

1. **Télécharger** : https://github.com/stripe/stripe-cli/releases/latest
   - Cherchez : `stripe_X.X.X_windows_x86_64.zip`
   
2. **Extraire** le fichier `stripe.exe` dans un dossier (ex: `C:\stripe-cli\`)

3. **Ajouter au PATH** (optionnel mais recommandé) :
   - `Win + R` → `sysdm.cpl` → **Avancé** → **Variables d'environnement**
   - Modifier `Path` → Ajouter le chemin (ex: `C:\stripe-cli\`)
   - Redémarrer PowerShell

### Méthode 2 : Via Scoop (si installé)

```powershell
scoop install stripe
```

### Vérifier l'installation

```powershell
stripe --version
```

---

## 🔑 ÉTAPE 2 : Se connecter à Stripe

Dans un terminal PowerShell, exécutez :

```powershell
stripe login
```

1. Cette commande ouvrira votre navigateur
2. Connectez-vous à votre compte Stripe (mode TEST)
3. Autorisez Stripe CLI
4. Retournez au terminal → Vous devriez voir "Done!"

---

## 🎧 ÉTAPE 3 : Lancer l'écoute des webhooks

Dans un **nouveau terminal PowerShell** (gardez l'app Next.js qui tourne), exécutez :

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Ce qui va se passer :

1. Stripe CLI va afficher :
   ```
   > Ready! You are using Stripe API Version [2025-12-15.clover]. 
   > Your webhook signing secret is whsec_xxxxxxxxxxxxxxx (^C to quit)
   ```

2. **⚠️ IMPORTANT** : Copiez ce nouveau `whsec_...` qui s'affiche !

3. Gardez ce terminal ouvert pendant vos tests

---

## 🔐 ÉTAPE 4 : Mettre à jour le webhook secret

Le webhook secret affiché par Stripe CLI est différent de celui du dashboard.

1. **Copiez** le `whsec_...` affiché par `stripe listen`

2. **Ouvrez** `.env.local`

3. **Remplacez** `STRIPE_WEBHOOK_SECRET` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx  # Le nouveau secret du CLI
   ```

4. **Redémarrez** votre application Next.js pour charger la nouvelle variable

---

## ✅ ÉTAPE 5 : Tester les webhooks

### Option A : Tester avec une vraie transaction

1. Allez sur : http://localhost:3000/pricing
2. Choisissez un plan
3. Utilisez la carte test : `4242 4242 4242 4242`
4. Dans le terminal `stripe listen`, vous devriez voir les événements arriver !

### Option B : Déclencher des événements de test

Dans un **nouveau terminal** (pendant que `stripe listen` tourne), testez :

```powershell
# Simuler un checkout réussi
stripe trigger checkout.session.completed

# Simuler une subscription créée
stripe trigger customer.subscription.created

# Simuler un paiement réussi
stripe trigger invoice.payment_succeeded
```

Vous devriez voir les événements apparaître dans le terminal `stripe listen` !

---

## 📊 ÉTAPE 6 : Vérifier que ça fonctionne

### Dans votre terminal `stripe listen` :

Vous devriez voir des logs comme :
```
2025-01-28 18:30:15  --> checkout.session.completed [evt_xxxxx]
2025-01-28 18:30:16  <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxxxx]
```

✅ **200** = Webhook reçu et traité avec succès !
❌ **4xx/5xx** = Il y a une erreur dans votre code

### Dans les logs de Next.js :

Ouvrez la console où tourne `pnpm dev` et vérifiez :
- Aucune erreur lors de la réception du webhook
- Les logs de traitement des événements

---

## 🐛 Dépannage

### "stripe: command not found"
→ Stripe CLI n'est pas installé ou pas dans le PATH
→ Voir ÉTAPE 1

### "Connection refused" dans stripe listen
→ Vérifiez que votre app Next.js tourne sur `localhost:3000`
→ Vérifiez que la route `/api/stripe/webhook` existe

### Webhooks reçus mais erreur 500
→ Vérifiez les logs Next.js pour l'erreur exacte
→ Vérifiez que `STRIPE_WEBHOOK_SECRET` dans `.env.local` correspond à celui de `stripe listen`

### "Signature invalide"
→ Le webhook secret dans `.env.local` ne correspond pas
→ Utilisez celui affiché par `stripe listen`

---

## 📝 Résumé rapide

1. ✅ Installer Stripe CLI
2. ✅ `stripe login`
3. ✅ `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. ✅ Copier le `whsec_...` dans `.env.local`
5. ✅ Redémarrer Next.js
6. ✅ Tester !

---

## 🎉 C'est prêt !

Une fois tout configuré, gardez **2 terminaux ouverts** :

1. **Terminal 1** : `pnpm dev` (votre app Next.js)
2. **Terminal 2** : `stripe listen --forward-to localhost:3000/api/stripe/webhook` (webhooks)

Vous pouvez maintenant tester vos paiements Stripe en local ! 🚀

