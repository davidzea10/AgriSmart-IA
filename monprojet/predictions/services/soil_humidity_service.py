import joblib
import numpy as np
import os
from datetime import datetime, timedelta

class SoilHumidityPredictor:
    def __init__(self):
        self.model = None
        self.target_encoder = None
        self.encoders_info = None
        
        # Chemins vers les fichiers
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'soil_quality')
        self.model_path = os.path.join(models_dir, 'modele_final2.pkl')
        self.target_encoder_path = os.path.join(models_dir, 'target_encoder2.pkl')
        self.django_encoders_path = os.path.join(models_dir, 'infos_modele2.pkl')
        
    def load_model(self):
        """Charge le modèle de prédiction d'humidité du sol"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("Modèle d'humidité du sol chargé")
                return True
            else:
                print(" Modèle non trouvé")
                return False
            
        except Exception as e:
            print(f"Erreur chargement modèle: {e}")
            return False
    
    def predict_soil_humidity(self, humidite, temperature, periode_encoded, mois, semaine_mois, humidite_sol_precedente=None):
        """Prédit le niveau d'humidité du sol
        
        Args:
            humidite (float): Humidité de l'air en %
            temperature (float): Température en °C
            periode_encoded (int): 0=matin, 1=midi, 2=soir
            mois (int): Mois de l'année (1-12)
            semaine_mois (int): Semaine du mois (1-4/5)
            humidite_sol_precedente (float, optional): Dernière valeur d'humidité du sol
        """
        if self.model is None:
            if not self.load_model():
                return "Modèle non disponible"
        
        try:
            # Conversion des types
            humidite = float(humidite)
            temperature = float(temperature)
            periode_encoded = int(periode_encoded)
            mois = int(mois)
            semaine_mois = int(semaine_mois)
            
            # Si l'humidité du sol précédente n'est pas fournie, on essaie de la récupérer
            if humidite_sol_precedente is None:
                from capteurs.models import Mesure
                derniere_mesure = Mesure.objects.order_by('-date_recue').first()
                humidite_sol_precedente = float(derniere_mesure.humidite_sol) if derniere_mesure else 50.0  # valeur par défaut
            
            # Préparer les données dans l'ordre exact des features
            features = np.array([[
                humidite,              # humidité de l'air
                temperature,           # température
                periode_encoded,       # période encodée
                mois,                 # mois
                semaine_mois,         # semaine du mois
                humidite_sol_precedente # humidité du sol précédente
            ]], dtype=float)
            
            print(f"\n🔮 Prédiction humidité sol:")
            print(f"  - Humidité air: {humidite}%")
            print(f"  - Température: {temperature}°C")
            print(f"  - Période: {periode_encoded}")
            print(f"  - Mois: {mois}")
            print(f"  - Semaine: {semaine_mois}")
            print(f"  - Humidité sol précédente: {humidite_sol_precedente}%")
            
            # Faire la prédiction
            prediction = self.model.predict(features)[0]
            print(f"\n Niveau d'humidité prédit: {prediction}")
            
            return prediction
                
        except Exception as e:
            print(f" Erreur prédiction: {e}")
            import traceback
            traceback.print_exc()
            return "Erreur système"
    
    def get_irrigation_recommendation(self, prediction):
        """Retourne la recommandation d'irrigation basée sur la prédiction"""
        recommendations = {
            "tres_sec": "Irrigation urgente requise - Sol très sec",
            "assez_sec": "Planifier une irrigation dans les 24h",
            "humide": "Conditions optimales - Pas d'irrigation nécessaire",
            "tres_humide": "Éviter l'irrigation - Risque d'excès d'eau"
        }
        
        return recommendations.get(prediction.lower(), "Surveillance recommandée")

    def predict_weekly_soil_forecast(self):
        """Prédiction pour la semaine prochaine"""
        try:
            from capteurs.models import Mesure
            from django.utils import timezone
            
            today = timezone.now()
            predictions = []
            
            # Prédictions pour les 7 prochains jours
            for day_offset in range(1, 8):
                target_date = today + timedelta(days=day_offset)
                
                # Utiliser les moyennes historiques
                historical_avg = self.get_historical_averages(target_date)
                
                if historical_avg:
                    prediction = self.predict_soil_humidity(
                        historical_avg['humidite'],
                        historical_avg['temperature'],
                        historical_avg['periode_encoded'],
                        target_date.month,
                        target_date.week,
                        historical_avg['humidite_sol']
                    )
                    
                    predictions.append({
                        'date': target_date.strftime('%Y-%m-%d'),
                        'day_name': target_date.strftime('%A'),
                        'prediction': prediction,
                        'confidence': historical_avg['confidence'],
                        'source': 'historical_avg',
                        'data_used': historical_avg
                    })
                else:
                    # Fallback avec données actuelles
                    current_data = self.get_current_data_fallback()
                    if current_data:
                        prediction = self.predict_soil_humidity(
                            current_data['humidite'],
                            current_data['temperature'],
                            current_data['periode_encoded'],
                            target_date.month,
                            target_date.week,
                            current_data['humidite_sol']
                        )
                        
                        predictions.append({
                            'date': target_date.strftime('%Y-%m-%d'),
                            'day_name': target_date.strftime('%A'),
                            'prediction': prediction,
                            'confidence': 'low',
                            'source': 'estimated',
                            'data_used': current_data
                        })
            
            return predictions
            
        except Exception as e:
            print(f" Erreur prédiction hebdomadaire: {e}")
            return []
    
    def get_historical_averages(self, target_date):
        """Récupère les moyennes historiques"""
        try:
            from capteurs.models import Mesure
            from django.db.models import Avg
            
            # Données de la même période l'année précédente
            last_year = target_date.year - 1
            same_period_last_year = target_date.replace(year=last_year)
            
            # Plage de ±3 jours
            start_date = same_period_last_year - timedelta(days=3)
            end_date = same_period_last_year + timedelta(days=3)
            
            # Moyennes
            averages = Mesure.objects.filter(
                date_recue__date__range=[start_date.date(), end_date.date()]
            ).aggregate(
                avg_temp=Avg('temperature'),
                avg_hum=Avg('humidite'),
                avg_periode=Avg('periode_encoded'),
                avg_humidite_sol=Avg('humidite_sol')
            )
            
            data_count = Mesure.objects.filter(
                date_recue__date__range=[start_date.date(), end_date.date()]
            ).count()
            
            if averages['avg_temp'] and averages['avg_hum'] and data_count > 0:
                confidence = 'high' if data_count >= 10 else 'medium' if data_count >= 5 else 'low'
                
                return {
                    'temperature': round(averages['avg_temp'], 1),
                    'humidite': round(averages['avg_hum'], 1),
                    'periode_encoded': round(averages['avg_periode'] or 1),
                    'humidite_sol': round(averages['avg_humidite_sol'] or 50.0),
                    'confidence': confidence,
                    'data_count': data_count,
                    'period': f"{start_date.strftime('%d/%m')} - {end_date.strftime('%d/%m/%Y')}"
                }
            else:
                return None
                
        except Exception as e:
            print(f"⚠️ Erreur récupération moyennes historiques: {e}")
            return None
    
    def get_current_data_fallback(self):
        """Récupère les données actuelles comme fallback"""
        try:
            from capteurs.models import Mesure
            
            last_mesure = Mesure.objects.order_by('-date_recue').first()
            if last_mesure:
                return {
                    'temperature': last_mesure.temperature,
                    'humidite': last_mesure.humidite,
                    'periode_encoded': last_mesure.periode_encoded,
                    'humidite_sol': float(last_mesure.humidite_sol) if last_mesure.humidite_sol else 50.0
                }
            else:
                return None
                
        except Exception as e:
            print(f"Erreur données actuelles: {e}")
            return None

# Instance globale
soil_humidity_predictor = SoilHumidityPredictor()

# Fonctions helper pour les vues Django
def predict_soil_humidity(humidite, temperature, periode_encoded, mois, semaine_mois):
    """Helper pour prédiction"""
    return soil_humidity_predictor.predict_soil_humidity(humidite, temperature, periode_encoded, mois, semaine_mois)

def get_irrigation_recommendation(prediction):
    """Helper pour recommandations"""
    return soil_humidity_predictor.get_irrigation_recommendation(prediction)

def get_weekly_soil_forecast():
    """Helper pour prédictions hebdomadaires"""
    return soil_humidity_predictor.predict_weekly_soil_forecast() 