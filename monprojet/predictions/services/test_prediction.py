#!/usr/bin/env python
"""
Script de test pour le service de prédiction AgriSmart
"""
import os
import sys
import django

# Ajouter le chemin du projet Django
current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'monprojet.settings')
django.setup()

# Import relatif depuis le même dossier
from air_quality_service import air_quality_predictor

def test_prediction():
    print("\n=== TEST DU MODÈLE QUALITÉ AIR ===")
    
    # Charger le modèle
    if not air_quality_predictor.load_model():
        print("Erreur: Impossible de charger le modèle")
        return
        
    print("Modèle chargé avec succès")

    # Données d'exemple
    humidite = 75.0        # %
    temperature = 25.0     # °C
    periode = 0          # 0=matin, 1=midi, 2=soir
    mois = 6            # juin

    print(f"\nDonnées de test:")
    print(f"  - Humidité: {humidite}%")
    print(f"  - Température: {temperature}°C") 
    print(f"  - Période: {periode} ({'matin' if periode==0 else 'midi' if periode==1 else 'soir'})")
    print(f"  - Mois: {mois}")

    # Prédiction
    prediction = air_quality_predictor.predict_air_quality(
        humidite=humidite,
        temperature=temperature,
        periode_encoded=periode,
        mois=mois
    )

    print(f"\n PRÉDICTION: {prediction}")

    # Obtenir la recommandation
    recommendation = air_quality_predictor.get_treatment_recommendation(prediction)
    print(f"\n RECOMMANDATION: {recommendation}")

if __name__ == "__main__":
    test_prediction()