# 🌱 **AGRISMART - STRUCTURE COMPLÈTE DU PROJET**

> **Système Intelligent de Monitoring Agricole pour la République Démocratique du Congo**  
> **Développé par : Débuze David**  
> **Technologies : Django + IA + IoT + ESP32**

---

##  **STRUCTURE GÉNÉRALE DU PROJET**

```
django2/                                    #  Dossier racine du projet
├──  CONFIG_GMAIL.md                      #  Guide configuration email Gmail pour notifications
├──  env/                                 #  Environnement virtuel principal (ignoré)
├──  monprojet/                          #  PROJET DJANGO PRINCIPAL
│   ├──  manage.py                       #  Point d'entrée Django (commandes admin)
│   ├──  monprojet/                      # ⚙️ Configuration Django principale
│   │   ├── __init__.py                    #  Package Python
│   │   ├── asgi.py                        #  Configuration ASGI (WebSockets)
│   │   ├── settings.py                    #  Configuration Django (BDD, email, etc.)
│   │   ├── urls.py                        #  Routage URL principal
│   │   └── wsgi.py                        #  Configuration WSGI (déploiement)
│   │
│   ├──  capteurs/               #  APP DJANGO PRINCIPALE - Gestion capteurs
│   │   ├── __init__.py                    # Package Python
│   │   ├── admin.py              # .   Interface admin Django (gestion données)
│   │   ├── apps.py                        #  Configuration app Django
│   │   ├── models.py            # . MODÈLES BDD - Structure    données capteurs
│   │   ├── views.py               #  VUES DJANGO -Logique métier et APIs
│   │   ├── urls.py                      #  URLs spécifiques à l'app capteurs
│   │   ├── tests.py                       #  Tests unitaires
│   │   ├── email_service.py       # SERVICE EMAIL - Notifications automatiques
│   │   │
│   │   ├──  management/                 #  Commandes Django personnalisées
│   │   │   ├── __init__.py               # Package Python
│   │   │   └──  commands/              #  Commandes custom Django
│   │   │       ├── __init__.py           #  Package Python
│   │   │       └── test_email.py         #  Commande test configuration email
│   │   │
│   │   ├──  migrations/                #  MIGRATIONS BDD Django
│   │   │   ├── __init__.py               #  Package Python
│   │   │   ├── 0001_initial.py          #  Migration initiale (création tables)
│   │   │   ├── 0002_mesure_mois_mesure_periode_encoded_and_more.py  #champs IA
│   │   │   └── 0003_mesure_humidite_sol_mesure_niveau_sol.py    # humidité sol
│   │   │
│   │   └── templates/                 #  TEMPLATES HTML - Interface utilisateur
│   │       └──  capteurs/              #  Templates spécifiques capteurs
│   │           ├── about.html            #  Page À propos du projet
│   │           ├── dashboard.html        #  Dashboard temps réel principal
│   │           ├── historique.html       #  Page historique des données
│   │           ├── index.html            #  Page d'accueil principale
│   │           ├── predictions.html      #  Interface prédictions IA
│   │           ├── stats.html            #  Page statistiques avancées
│   │           └──  includes/          #  Composants réutilisables
│   │               └── barre.html        #  Barre de navigation sidebar
│   │
│   ├──  predictions/                   #  MODULE INTELLIGENCE ARTIFICIELLE
│   │   ├── __init__.py                   #  Package Python principal IA
│   │   ├── README_MODELE.md              #  Documentation modèles ML
│   │   │
│   │   ├──  models/                    #  MODÈLES ML ENTRAÎNÉS
│   │   │   ├──  air_quality/           #  Modèles prédiction qualité air
│   │   │   │   ├── modele_final.pkl      #  Modèle Random Forest qualité air
│   │   │   │   ├── target_encoder.pkl    #  Encodeur classes sortie air
│   │   │   │   ├── periode_encoder.pkl   #  Encodeur périodes (matin/midi/soir)
│   │   │   │   └── infos_modele.pkl      # Métadonnées modèle air
│   │   │   │
│   │   │   └──  soil_quality/          #  Modèles prédiction humidité sol
│   │   │       ├── modele_final2.pkl     #  Modèle Knn humidité sol
│   │   │       ├── target_encoder2.pkl   #  Encodeur niveaux sol
│   │   │       ├── periode_encoder2.pkl  #  Encodeur périodes sol
│   │   │       └── infos_modele2.pkl     #  Métadonnées modèle sol
│   │   │
│   │   └──  services/                  #  SERVICES IA DJANGO
│   │       ├── __init__.py               #  Package services IA
│   │       ├── air_quality_service.py    #  SERVICE IA Prédictions qualité air
│   │       ├── soil_humidity_service.py  #SERVICE IA - Prédictions humidité sol
│   │       ├── model_loader.py           #  Chargeur modèles ML optimisé
│   │       └── recommendations.py        # Générateur recommandations agricoles
│   │
│   ├──  static/                        #  ASSETS STATIQUES (CSS/JS/Images)
│   │   ├──  css/                       #  FEUILLES DE STYLE
│   │   │   ├── about.css                 #  Styles page À propos
│   │   │   ├── barre.css                 #  Styles barre navigation
│   │   │   ├── dashboard.css             #  Styles dashboard principal
│   │   │   ├── historique.css            #  Styles page historique
│   │   │   ├── index.css                 # Styles page accueil
│   │   │   ├── predictions.css           # Styles interface prédictions IA
│   │   │   ├── predictions.v2.css        #  Styles prédictions version 2
│   │   │   ├── stats.css                 #  Styles statistiques
│   │   │   └── stats.v2.css              #  Styles statistiques version 2
│   │   │
│   │   └──  js/                        #  SCRIPTS JAVASCRIPT
│   │       ├── about.js                  #  Scripts page À propos (animations)
│   │       ├── barre.js                  #  Scripts navigation mobile
│   │       ├── dashboard.js              #  Scripts dashboard temps réel
│   │       ├── dashboard.v2.js           #  Scripts dashboard version 2
│   │       ├── historique.js             #  Scripts page historique (filtres)
│   │       ├── index.js                  #  Scripts accueil (temps réel)
│   │       ├── index.v2.js               #  Scripts accueil version 2
│   │       ├── predictions.js            #  Scripts prédictions IA interface
│   │       ├── stats.js                  #  Scripts statistiques de base
│   │       └── stats.v2.js               #  Scripts statistiques avancées
│   │
│   ├──  env2/                          #  ENVIRONNEMENT VIRTUEL DJANGO
│   │   ├── pyvenv.cfg                    #  Configuration environnement virtuel
│   │   ├──  Scripts/                   #  Scripts activation (Windows)
│   │   │   ├── activate                  #  Script activation Linux/Mac
│   │   │   ├── activate.bat              #  Script activation Windows Batch
│   │   │   ├── Activate.ps1              #  Script activation PowerShell
│   │   │   ├── python.exe                #  Python exécutable
│   │   │   ├── pip.exe                   #  Gestionnaire packages
│   │   │   └── django-admin.exe          #  Commandes Django admin
│   │   │
│   │   └──  Lib/site-packages/         # BIBLIOTHÈQUES PYTHON INSTALLÉES
│   │       ├──  django/                #  Framework Django complet
│   │       ├──  numpy/                 #  Calculs numériques (IA)
│   │       ├──  pandas/                #  Manipulation données (IA)
│   │       ├──  sklearn/               #  Machine Learning (scikit-learn)
│   │       ├──  joblib/                #  Sérialisation modèles ML
│   │       ├──  scipy/                 #  Calculs scientifiques
│   │       └──  [autres packages]/     #  Autres dépendances
│   │
│   ├── 📄 requirements.txt           #  LISTE DÉPENDANCES PYTHON
│   ├── 📄 db.sqlite3               #  BASE DE DONNÉES SQLITE (données capteurs)
│   ├── 📄 update_old_data.py         # Script mise à jour anciennes données
│   │
│   ├── 📊 donnees_humidite_sol_complete.csv     #  Dataset humidité sol complet
│   ├── 📊 donnees_pret_modelisation_clean.csv   #  Dataset nettoyé pour IA
│   └── 📊 donnees_pret_modelisation.csv       #  Dataset brut pour modélisation
│
├── PartieEsp32/                       # CODE MICROCONTRÔLEUR IoT
│   └──  CodeFinal/                     #  Code final ESP32
│       └── CodeFinal.ino                 #  Programme Arduino/ESP32 capteurs
│
├──  README_PROCHAINES_ETAPES.md        #  Roadmap développement futur
└──  README.md                          #  Documentation principale projet
```

---

##  **ARCHITECTURE TECHNIQUE DÉTAILLÉE**

### ** Backend Django (Cœur du Système)**

#### **1. Application `capteurs/` - Gestion des Capteurs**
```python
# models.py - Structure des données
class Mesure(models.Model):
    temperature = models.FloatField()        # Température °C
    humidite = models.FloatField()          # Humidité air %
    qualite_air = models.IntegerField()     # Index qualité air
    niveau_air = models.CharField()         # "bon"/"moyen"/"mauvais"
    humidite_sol = models.FloatField()      # Humidité sol %
    niveau_sol = models.CharField()         # "très sec"/"assez sec"/etc.
    
    # Champs IA automatiques
    periode_encoded = models.IntegerField() # 0:matin, 1:midi, 2:soir
    mois = models.IntegerField()           # 1-12
    semaine_mois = models.IntegerField()   # 1-4/5
```

#### **2. Module `predictions/` - Intelligence Artificielle**
```python
# Services IA principaux
air_quality_service.py      # 🌬️ Prédictions qualité air → traitements
soil_humidity_service.py    # 💧 Prédictions humidité sol → irrigation

# Modèles ML entraînés
air_quality/modele_final.pkl    # Random Forest qualité air
soil_quality/modele_final2.pkl  # Modèle Knn humidité sol
```

---

### **🎨 Frontend (Interface Utilisateur)**

#### **Pages Principales :**
- **`index.html`** 🏠 Accueil avec aperçu temps réel
- **`dashboard.html`** 📊 Dashboard complet avec graphiques
- **`predictions.html`** 🔮 Interface prédictions IA côte à côte
- **`historique.html`** 📈 Historique avec filtres et export
- **`stats.html`** 📊 Statistiques et analyses avancées
- **`about.html`** ℹ️ Documentation complète du projet

#### **Scripts JavaScript Temps Réel :**
```javascript
// Mise à jour automatique des données
dashboard.js     # 📊 Graphiques Chart.js temps réel
predictions.js   # 🔮 Interface prédictions IA
index.js        # 🏠 Aperçu capteurs temps réel
historique.js   # 📈 Filtres et export données
```

---

### **🔌 Partie IoT - ESP32**

#### **Capteurs Intégrés :**
```cpp
// CodeFinal.ino - Programme ESP32
- DHT22          // 🌡️ Température + Humidité air
- MQ-135         // 🌬️ Qualité air (CO2, NH3, NOx)
- Soil Sensor    // 💧 Humidité sol capacitif
- WiFi Module    // 📡 Transmission données
```

#### **Communication IoT :**
```json
// Format données envoyées à Django
POST /envoyer/ {
    "temperature": 25.5,
    "humidite": 65.0,
    "qualite_air": 1850,
    "niveau_air": "bon",
    "humidite_sol": 45.2,
    "niveau_sol": "assez sec"
}
```

---

## 🧠 **INTELLIGENCE ARTIFICIELLE INTÉGRÉE**

### **🌬️ Prédiction Qualité Air**
```python
# Features d'entrée (5 variables)
humidite         # Humidité air %
temperature      # Température °C
periode_encoded  # Matin/Midi/Soir
mois            # 1-12
semaine_mois    # 1-4/5

# Prédictions possibles
"bon"     → Conditions favorables
"moyen"   → Surveillance recommandée  
"mauvais" → Traitement phytosanitaire urgent
```

### **💧 Prédiction Humidité Sol**
```python
# Features d'entrée (6 variables)
humidite                 # Humidité air %
temperature             # Température °C
periode_encoded         # Matin/Midi/Soir
mois                   # 1-12
semaine_mois           # 1-4/5
humidite_sol_precedente # Continuité données

# Niveaux prédits
"très sec"     → Irrigation urgente (<20%)
"assez sec"    → Planifier irrigation (20-50%)
"humide"       → Optimal (50-80%)
"très humide"  → Excès d'eau (>80%)
```

---

## 📧 **SYSTÈME NOTIFICATIONS AUTOMATIQUES**

### **Service Email Intégré :**
```python
# email_service.py
class PredictionEmailService:
    - Gmail SMTP authentifié
    - Templates HTML colorés
    - Envoi automatique à chaque prédiction
    - Format professionnel avec données actuelles
```

### **Types de Notifications :**
- **🌬️ Email Prédiction AIR** : Recommandations traitements
- **💧 Email Prédiction SOL** : Conseils irrigation
- **⚠️ Alertes Critiques** : Conditions dangereuses

---

## 🚀 **APIs ET ENDPOINTS**

### **APIs Principales :**
```python
# Réception données ESP32
POST /envoyer/              # 📥 Données capteurs IoT

# Prédictions temps réel
GET /api/predictions/air/   # 🌬️ Prédiction qualité air
GET /api/predictions/soil/  # 💧 Prédiction humidité sol

# Données dashboard
GET /envoyer/?last=1        # 📊 Dernière mesure
GET /dashboard/             # 📈 Dashboard complet
GET /historique/            # 📋 Historique filtré
GET /stats/                 # 📊 Statistiques
```

---

## 📊 **FONCTIONNALITÉS AVANCÉES**

### **🔍 Analyses et Statistiques :**
- **Distribution niveaux** humidité sol
- **Corrélations** température/humidité
- **Tendances saisonnières** automatiques
- **Records et extremes** historiques

### **⚡ Temps Réel :**
- **Mise à jour automatique** toutes les 5 secondes
- **Graphiques interactifs** Chart.js
- **Alertes intelligentes** avec couleurs
- **Interface responsive** mobile

### **📤 Export de Données :**
- **Format Excel/CSV** avec mise en forme
- **Filtres avancés** par période/type
- **Pagination optimisée** grandes données
- **Téléchargement direct** navigateur

---

## ⚙️ **CONFIGURATION ET DÉPLOIEMENT**

### **🔧 Installation :**
```bash
# 1. Cloner le projet
git clone [repo] && cd django2/monprojet

# 2. Activer environnement virtuel
source env2/Scripts/activate  # Windows
source env2/bin/activate      # Linux/Mac

# 3. Installer dépendances
pip install -r requirements.txt

# 4. Migrations base de données
python manage.py migrate

# 5. Lancer serveur Django
python manage.py runserver
```

### **📧 Configuration Email :**
1. **Activer 2FA Gmail** sur compte destination
2. **Créer mot de passe application** Gmail
3. **Configurer `settings.py`** avec credentials
4. **Tester avec** `python manage.py test_email`

### **🔌 Configuration ESP32 :**
1. **Câbler capteurs** selon schéma projet
2. **Configurer WiFi** dans code Arduino
3. **Définir endpoint Django** dans ESP32
4. **Téléverser code** sur microcontrôleur

---

## 🎯 **IMPACT ET OBJECTIFS**

### **🌱 Pour l'Agriculture Congolaise :**
- **Optimisation irrigation** → Économie eau 30-40%
- **Prévention maladies** → Réduction pertes 20-30%
- **Rendements améliorés** → Augmentation production 15-25%
- **Agriculture de précision** → Décisions basées données

### **💻 Excellence Technique :**
- **Architecture modulaire** et évolutive
- **Code documenté** et maintenable
- **Interface intuitive** et moderne
- **IA fonctionnelle** avec vrais modèles
- **IoT intégré** bout en bout

---

## 🏆 **TECHNOLOGIES UTILISÉES**

### **Backend :**
- **Django 5.2.3** - Framework web robuste
- **SQLite** - Base données intégrée
- **Python ML** (joblib, numpy, pandas, sklearn)
- **Gmail SMTP** - Service email professionnel

### **Frontend :**
- **HTML5/CSS3** moderne responsive
- **JavaScript ES6+** avec classes
- **Chart.js** - Graphiques interactifs
- **FontAwesome** - Iconographie

### **IoT/Embedded :**
- **ESP32** - Microcontrôleur WiFi
- **Capteurs environnementaux** précision
- **Arduino IDE** - Développement
- **HTTP/JSON** - Protocole communication

---

## 👨‍💻 **DÉVELOPPEUR**

**Nom :** Débuze David  
**Projet :** AgriSmart - Système Intelligent Monitoring Agricole  
**Pays :** République Démocratique du Congo  
**Objectif :** Révolutionner l'agriculture congolaise par l'IA et l'IoT  

---

**🌱 AgriSmart - L'avenir de l'agriculture intelligente en RDC ! 🚀** 