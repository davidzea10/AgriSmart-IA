[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Zh-HM8QW)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19958688&assignment_repo_type=AssignmentRepo)
# 🎓 Projet de Fin d’Année – Agrismart-IA

Bienvenue ! Ce dépôt a été généré automatiquement via GitHub Classroom pour la remise de votre projet de fin d’année **individuel**.

> **Département** : Intelligence Artificielle  
> **Filière** : Robotique  
> **Année académique** : 2024–2025  
> **Encadrant** : Professeur ou Assistant [CT BERNICE] / La Commission

---

## 📌 Objectif du projet

Ce projet vise à mettre en place un système de prediction de l'humidité du sol pour anticiper l'irrigation et de la prédiction de la qualité de l'air pour anticiper les traitements phytonisataires, en utilisant les données entrainée par des algorithmes de l'IA, ces données en temps réel prevenant des capteurs conténus dans l'appareil appelé SensorAgri, ce projet repond au besoin de l'agriculture intelligente pour améliorer la productivité dans le secteur primaire congolais et assurer la surveillance des conditions environnementales pour la protection des cultures.   
---

## 🛠️ Technologies utilisées

- Langage principal : `Python` / `JavaScript` / `html/css`/ 
- Framework : `Django` 
- Base de données : `SqlLite` / 
- Outils : `GitHub`, `Anaconda`, `Vs code`

---

##  Etapes pour lancer le projet

A compléter obligatoirement. Exemple : 

1. Cloner ce dépôt :

```bash
   git clone https://github.com/criagi-upc/projet-final-l3-davidzea10.git
   cd monprojet
````

2. Créer un environnement virtuel (si Python) :

```bash
   python -m venv env2
   source env2/bin/activate
   ```
3. Installer les dépendances :

   ```bash
   pip install -r requirements.txt
   ```
4. Lancer le serveur :

   ```bash
   python manage.py runserver
   ```

---

##  Structure du projet

```
django2/                               #  Dossier racine du projet
├──  CONFIG_GMAIL.md         #Guide configuration email Gmail pour notifications
├──  env/                           #  Environnement virtuel principal (ignoré)
├──  monprojet/                          #  PROJET DJANGO PRINCIPAL
│   ├──  manage.py                   #  Point d'entrée Django (commandes admin)
│   ├──  monprojet/                      # ⚙️ Configuration Django principale
│   │   ├── __init__.py                    #  Package Python
│   │   ├── asgi.py                        #  Configuration ASGI (WebSockets)
│   │   ├── settings.py               #  Configuration Django (BDD, email, etc.)
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
│   ├──  requirements.txt           #  LISTE DÉPENDANCES PYTHON
│   ├──  db.sqlite3               #  BASE DE DONNÉES SQLITE (données capteurs)
│   ├──  update_old_data.py         # Script mise à jour anciennes données
│   │
│   ├──  donnees_humidite_sol_complete.csv     #  Dataset humidité sol complet
│   ├──  donnees_pret_modelisation_clean.csv   #  Dataset nettoyé pour IA
│   └──  donnees_pret_modelisation.csv       #  Dataset brut pour modélisation
│
├── PartieEsp32/                       # CODE MICROCONTRÔLEUR IoT
│   └──  CodeFinal/                     #  Code final ESP32
│       └── CodeFinal.ino                 #  Programme Arduino/ESP32 capteurs
│
├──  README_PROCHAINES_ETAPES.md        #  Roadmap développement futur
└──  README.md                          #  Documentation principale projet




  
```

---



## 🎥 Démonstration

Lien vers la démonstration vidéo :
👉 [https://youtu.be/votre-video-demo](https://youtu.be/votre-video-demo)



---



## 🔁 Vous avez déjà commencé votre projet ailleurs ?

Si vous avez déjà un projet sur GitHub (dans votre compte personnel), vous n’avez pas besoin de le recommencer.
Vous pouvez continuer à travailler dessus et simplement pousser le même code vers le dépôt de CRIAGI.

Pas de panique ! Voici comment transférer votre code existant dans ce dépôt :

### ✅ Étapes à suivre (une seule fois)

1. 📥 **Acceptez l’invitation GitHub Classroom**
   Exemple :
   `https://classroom.github.com/a/xxxxxxxx`
   → Un dépôt sera automatiquement créé pour vous dans l’organisation de CRIAGI (ex: `https://github.com/criagi-upc/projet-final-etudiant.git`)

2. 🔗 **Copiez le lien du dépôt Classroom généré**

   * Cliquez sur le bouton **“Code”** dans GitHub
   * Copiez l’URL HTTPS du dépôt créé (ex: `https://github.com/criagi-upc/projet-final-etudiant.git`)

3. 🧠 **Dans votre projet existant (sur votre machine)**
   Ouvrez un terminal et placez-vous dans le dossier :

   ```bash
   cd mon-projet
   ```

4. ➕ **Ajoutez le dépôt de CRIAGI comme destination secondaire (remote)**

   ```bash
   git remote add criagi https://github.com/criagi-upc/projet-final-etudiant.git
   git fetch criagi
   git merge criagi/main --allow-unrelated-histories
   ```

---

### 🚀 Pour soumettre votre projet

À chaque fois que vous souhaitez soumettre votre travail à l’université :

```bash
git push criagi main
```

Et pour continuer à sauvegarder sur votre dépôt personnel habituel :

```bash
git push origin main
```

---



### ⚠️ Une autre étape à suivre (une seule fois) — Cette étape est optionnelle mais récommandée

5. **Créez un remote "both" pour tout pousser d’un coup**

Cette étape permet de **pousser automatiquement votre code vers votre dépôt personnel *et* le dépôt CRIAGI** en une seule commande.

Dans votre terminal, toujours dans le dossier du projet :

```bash
git remote add both https://github.com/votre-utilisateur/mon-projet.git
git remote set-url --add both https://github.com/criagi-upc/projet-final-etudiant.git
```

✅ Vous pouvez maintenant soumettre votre travail aux **deux dépôts en même temps** avec :

```bash
git push both main
```


---

### Résumé des commandes possibles

| Commande               | Effet                                                   |
| ---------------------- | ------------------------------------------------------- |
| `git push origin main` | 🔐 Sauvegarde dans votre dépôt personnel                |
| `git push criagi main` | 🎓 Soumission officielle à CRIAGI                       |
| `git push both main`   | ✅ Soumet dans les **deux dépôts** en une seule commande |


--- 


### Conditions 

Pour que votre projet soit pris en compte, **merci de suivre scrupuleusement toutes les étapes décrites dans ce README**.

* Assurez-vous d’avoir accepté l’invitation GitHub Classroom avant de commencer.
* Copiez et ajoutez correctement le dépôt CRIAGI comme remote secondaire (`criagi` ou `both`).
* Poussez votre code dans le dépôt CRIAGI **avant la date limite**.
* Vérifiez que vos dernières modifications sont bien visibles sur GitHub.
* Tout dépôt non soumis conformément à ces consignes ne sera pas pris en compte.

En cas de difficulté, contactez votre la COMMISSION **avant la deadline**.


---


## 💡 Comprendre Git et GitHub

Cette vidéo vous explique les bases de Git et GitHub : création de dépôt, commits, push/pull, branches, etc.  
Utile pour bien démarrer avec le versioning collaboratif.

👉 [Regarder la vidéo sur YouTube](https://www.youtube.com/watch?v=V6Zo68uQPqE)

---
## 📄 Licence

Projet académique – Usage Strictement Pédagogique.
© 2025 – Université Protestante au Congo - CRIAGI

