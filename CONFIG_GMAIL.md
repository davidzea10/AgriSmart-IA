# 📧 Configuration Gmail pour AgriSmart

## 🔐 Étapes de Configuration

### 1. Activer l'authentification à deux facteurs
1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **Sécurité** dans le menu de gauche
3. Activez **Validation en deux étapes**

### 2. Créer un mot de passe d'application
1. Dans la section **Sécurité**, cliquez sur **Mots de passe des applications**
2. Sélectionnez **Autre (nom personnalisé)**
3. Tapez "AgriSmart" comme nom
4. Cliquez sur **Générer**
5. **Copiez le mot de passe généré** (16 caractères)

### 3. Configurer le fichier settings.py
Remplacez dans `monprojet/settings.py` :

```python
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_app'  # Remplacez par le mot de passe généré
```

Par :
```python
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Votre mot de passe d'application
```

### 4. Tester la configuration
Exécutez le script de test :

```bash
cd monprojet
python test_email.py
```

## 🔍 Vérifications

### Si les emails ne sont pas reçus :
1. **Vérifiez le dossier spam** de daviddebuze020@gmail.com
2. **Vérifiez les paramètres de sécurité** Gmail
3. **Assurez-vous que l'authentification 2FA est activée**
4. **Vérifiez que le mot de passe d'application est correct**

### Logs de débogage :
- Les messages d'erreur apparaissent dans la console Django
- Les emails envoyés sont loggés avec `✅ Email de prédiction X envoyé`

## 📝 Format des emails

### Email de prédiction AIR
- **Sujet**: `🌱 AgriSmart - Nouvelle prédiction AIR`
- **Contenu**: Résultat, recommandation, données actuelles
- **Couleur**: Vert (bon), Orange (moyen), Rouge (mauvais)

### Email de prédiction SOL
- **Sujet**: `🌱 AgriSmart - Nouvelle prédiction SOIL`
- **Contenu**: Résultat, recommandation, données actuelles
- **Couleur**: Rouge (très sec), Orange (assez sec), Vert (humide), Bleu (très humide)

## 🚀 Utilisation

Une fois configuré, chaque prédiction déclenchera automatiquement l'envoi d'un email à `daviddebuze020@gmail.com` avec :
- Le résultat de la prédiction
- La recommandation de traitement
- Les données actuelles des capteurs
- L'heure de génération

## 🔧 Dépannage

### Erreur "Authentication failed"
- Vérifiez que l'authentification 2FA est activée
- Régénérez un nouveau mot de passe d'application

### Erreur "Connection refused"
- Vérifiez votre connexion internet
- Vérifiez les paramètres firewall

### Emails dans le spam
- Ajoutez `daviddebuze020@gmail.com` aux contacts
- Marquez les emails comme "Non spam"

---

**Développé par Débuze David pour AgriSmart**
**République Démocratique du Congo** 