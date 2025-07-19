#!/usr/bin/env python
"""
Script de test pour le service de prédiction d'humidité du sol AgriSmart
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
from soil_humidity_service import soil_humidity_predictor

def test_prediction():
    print("\n=== TEST DU MODÈLE HUMIDITÉ SOL ===")
    
    # Charger le modèle
    if not soil_humidity_predictor.load_model():
        print(" Erreur: Impossible de charger le modèle")
        return
        
    print("✅ Modèle chargé avec succès")

    # Données d'exemple
    humidite = 65.0       # % humidité de l'air
    temperature = 25.0    # °C
    periode = 0           # 0=matin, 1=midi, 2=soir
    mois = 6             # juin
    semaine = 2          # 2ème semaine du mois
    humidite_sol_prec = 45.0  # % humidité du sol précédente

    print(f"\nDonnées de test:")
    print(f"  - Humidité air: {humidite}%")
    print(f"  - Température: {temperature}°C")
    print(f"  - Période: {periode} ({'matin' if periode==0 else 'midi' if periode==1 else 'soir'})")
    print(f"  - Mois: {mois}")
    print(f"  - Semaine du mois: {semaine}")
    print(f"  - Humidité sol précédente: {humidite_sol_prec}%")

    # Prédiction
    prediction = soil_humidity_predictor.predict_soil_humidity(
        humidite=humidite,
        temperature=temperature,
        periode_encoded=periode,
        mois=mois,
        semaine_mois=semaine,
        humidite_sol_precedente=humidite_sol_prec
    )

    print(f"\n PRÉDICTION NIVEAU SOL: {prediction}")

    # Obtenir la recommandation
    recommendation = soil_humidity_predictor.get_irrigation_recommendation(prediction)
    print(f"\n💡 RECOMMANDATION IRRIGATION: {recommendation}")

    # Test prédiction hebdomadaire
    print("\n TEST PRÉDICTION HEBDOMADAIRE:")
    weekly_forecast = soil_humidity_predictor.predict_weekly_soil_forecast()
    
    if weekly_forecast:
        print("\nPrévisions pour les 7 prochains jours:")
        for forecast in weekly_forecast:
            print(f"  - {forecast['day_name']} ({forecast['date']}): {forecast['prediction']}")
            print(f"    Confiance: {forecast['confidence']}")
    else:
        print(" Erreur: Impossible d'obtenir les prévisions hebdomadaires")

if __name__ == "__main__":
    test_prediction() 