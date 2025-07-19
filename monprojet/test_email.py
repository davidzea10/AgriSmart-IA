#!/usr/bin/env python
"""
Script de test pour vérifier la configuration email Gmail d'AgriSmart
Usage: python test_email.py
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'monprojet.settings')
django.setup()

from capteurs.email_service import send_test_email, PredictionEmailService

def main():
    print("🧪 Test de la configuration email Gmail - AgriSmart")
    print("=" * 50)
    
    # Test 1: Email de test basique
    print("\n1️⃣ Test email basique...")
    if send_test_email():
        print("✅ Email de test envoyé avec succès!")
    else:
        print("❌ Échec de l'envoi de l'email de test")
        return
    
    # Test 2: Email de prédiction factice
    print("\n2️⃣ Test email de prédiction (AIR)...")
    test_data = {
        'temperature': 25.5,
        'humidite': 65.0,
        'qualite_air': 1500,
        'niveau_air': 'moyen',
        'humidite_sol': 45.0,
        'niveau_sol': 'assez_sec'
    }
    
    if PredictionEmailService.send_prediction_notification(
        prediction_type='air',
        prediction_result='moyen',
        recommendation='Surveillance préventive recommandée - Traitement phytosanitaire dans 24-48h',
        last_data=test_data
    ):
        print("✅ Email de prédiction AIR envoyé avec succès!")
    else:
        print("❌ Échec de l'envoi de l'email de prédiction AIR")
    
    # Test 3: Email de prédiction SOL
    print("\n3️⃣ Test email de prédiction (SOL)...")
    if PredictionEmailService.send_prediction_notification(
        prediction_type='soil',
        prediction_result='assez_sec',
        recommendation='Planifier irrigation dans les 24 prochaines heures - Humidité du sol faible',
        last_data=test_data
    ):
        print("✅ Email de prédiction SOL envoyé avec succès!")
    else:
        print("❌ Échec de l'envoi de l'email de prédiction SOL")
    
    print("\n" + "=" * 50)
    print("🎯 Tests terminés! Vérifiez votre boîte mail: daviddebuze020@gmail.com")
    print("📧 Si vous ne recevez pas les emails, vérifiez:")
    print("   - Le mot de passe d'application Gmail")
    print("   - Les paramètres de sécurité Gmail")
    print("   - Le dossier spam/courrier indésirable")

if __name__ == "__main__":
    main() 