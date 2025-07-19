#!/usr/bin/env python
"""
Script pour mettre à jour les anciennes données avec l'humidité du sol
"""
import os
import sys
import django
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'monprojet.settings')
django.setup()

from capteurs.models import Mesure

def calculate_soil_humidity(temperature, air_humidity, air_quality):
    """
    Calcule une humidité du sol réaliste basée sur les conditions météo
    """
    # Base selon l'humidité de l'air
    base_soil = air_humidity * 0.6  # Le sol retient moins que l'air
    
    # Ajustement selon la température
    if temperature > 30:
        base_soil *= 0.7  # Sol plus sec quand il fait chaud
    elif temperature < 20:
        base_soil *= 1.2  # Sol plus humide quand il fait frais
    
    # Ajustement selon la qualité de l'air (indicateur de conditions)
    if air_quality > 2000:
        base_soil *= 0.8  # Conditions défavorables = sol plus sec
    
    # Ajouter de la variabilité
    variation = random.uniform(-15, 15)
    final_soil = max(0, min(100, base_soil + variation))
    
    return round(final_soil, 1)

def get_soil_level(humidity):
    """
    Détermine le niveau du sol selon l'humidité
    """
    if humidity >= 80:
        return "très humide"
    elif humidity >= 50:
        return "humide"
    elif humidity >= 20:
        return "assez sec"
    else:
        return "très sec"

def update_old_measurements():
    """
    Met à jour toutes les mesures avec humidite_sol = 0.0
    """
    print("🔄 Mise à jour des anciennes données...")
    
    # Trouver toutes les mesures sans données de sol
    old_measures = Mesure.objects.filter(humidite_sol=0.0)
    total = old_measures.count()
    
    print(f"📊 {total} mesures à mettre à jour")
    
    updated = 0
    for measure in old_measures:
        # Calculer l'humidité du sol
        soil_humidity = calculate_soil_humidity(
            measure.temperature,
            measure.humidite,
            measure.qualite_air
        )
        
        # Déterminer le niveau
        soil_level = get_soil_level(soil_humidity)
        
        # Mettre à jour
        measure.humidite_sol = soil_humidity
        measure.niveau_sol = soil_level
        measure.save()
        
        updated += 1
        if updated % 10 == 0:
            print(f"✅ {updated}/{total} mesures mises à jour...")
    
    print(f"🎉 Mise à jour terminée ! {updated} mesures mises à jour.")
    
    # Afficher quelques exemples
    print("\n📋 Exemples de données mises à jour :")
    recent = Mesure.objects.order_by('-date_recue')[:5]
    for m in recent:
        print(f"  - {m.date_recue.strftime('%d/%m %H:%M')} | Temp: {m.temperature}°C | Hum air: {m.humidite}% | Hum sol: {m.humidite_sol}% ({m.niveau_sol})")

if __name__ == "__main__":
    update_old_measurements() 