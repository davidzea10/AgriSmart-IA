# Guide d'intégration de votre modèle AgriSmart - Debuze

##  Structure actuelle

Vos fichiers de modèle sont correctement placés dans :
```
monprojet/predictions/models/
├── modele_final.pkl                # Votre modèle KNN entraîné
├── target_encoder.pkl             #  Encodeur pour les classes de sortie
├── periode_encoder.pkl            #  Encodeur pour les périodes (matin/midi/soir)
└── django_encodeurs_info.pkl      #  Mappings et infos d'encodage
```

## 🔧 Intégration réalisée

### ✅ Service ML adapté
Le service `air_quality_service.py` a été configuré pour vos fichiers :
- **Modèle principal** : `modele_final.pkl` (votre modèle KNN)
- **Encodeurs** : Tous vos encodeurs sont pris en charge
- **Mappings** : Utilise `django_encodeurs_info.pkl` pour le décodage

### ✅ Features du modèle
Votre modèle utilise ces 5 features dans cet ordre :
1. **humidité** (float) : Pourcentage d'humidité 
2. **temperature** (float) : Température en °C
3. **periode_encoded** (int) : 0=matin(4h-11h59), 1=midi(12h-17h59), 2=soir(18h-3h59)
4. **mois** (int) : Mois de l'année (1-12)
5. **semaine_mois** (int) : Semaine du mois (1-4/5)

### ✅ Classes de sortie
Votre modèle prédit ces niveaux de qualité d'air :
- **bon** : Conditions favorables
- **mauvais** : Conditions défavorables  
- **moyen** : Conditions intermédiaires
- **très bon** : Conditions excellentes

## 🧪 Test de votre modèle

Pour tester l'intégration de votre modèle :

```bash
cd monprojet
python predictions/test_prediction.py
```

### Résultats attendus :
```
=== Test du Service de Prédiction AgriSmart - Modèle Final de Debuze ===

1. Vérification des fichiers de modèle...
   ✅ Modèle principal: modele_final.pkl trouvé
   ✅ Encodeur target: target_encoder.pkl trouvé
   ✅ Encodeur période: periode_encoder.pkl trouvé
   ✅ Infos encodeurs Django: django_encodeurs_info.pkl trouvé

2. Chargement du modèle et des encodeurs...
   ✅ Modèle final chargé avec succès
   ✅ Encodeur target chargé
   ✅ Encodeur période chargé
   ✅ Infos encodeurs Django chargées
```

## 📊 Exemple d'utilisation du service

```python
from predictions.air_quality_service import air_quality_predictor

# Prédiction pour une matinée d'été humide
prediction = air_quality_predictor.predict_air_quality(
    humidite=75,        # 75% d'humidité
    temperature=23,     # 23°C
    periode_encoded=0,  # Matin (4h-11h59)
    mois=6,            # Juin
    semaine_mois=2     # 2ème semaine du mois
)

print(f"Qualité d'air prédite : {prediction}")
# Résultat possible : "mauvais"
```

## 🎯 Prochaines étapes

1. **✅ Étape 2 terminée** : Service ML intégré avec vos fichiers
2. **🔄 Étape 3 en cours** : Intégration dans les vues Django
3. **⏳ Étape 4 à venir** : Interface frontend avec prédictions
4. **⏳ Étape 5 à venir** : Tests complets ESP32 → Django → ML

## ⚡ Performance du modèle

Votre modèle KNN avec 94 échantillons d'entraînement :
- **Algorithme** : K-Nearest Neighbors
- **Features** : 5 variables environnementales et temporelles
- **Classes** : 4 niveaux de qualité d'air
- **Usage** : Prédiction des traitements phytosanitaires

## 🐛 Dépannage

Si vous rencontrez des erreurs :

1. **Erreur de chargement** : Vérifiez que tous les fichiers .pkl sont présents
2. **Erreur de prédiction** : Vérifiez l'ordre des features d'entrée
3. **Erreur d'encodage** : Vérifiez la compatibilité des encodeurs

## 📞 Support

Pour toute question sur l'intégration ML :
- Vérifiez les logs dans le terminal
- Utilisez le script de test pour diagnostiquer
- Les erreurs détaillées sont affichées avec des emojis explicites

---
*Modèle développé par Debuze David pour le projet AgriSmart* 