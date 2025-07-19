import joblib
import numpy as np
import os
from datetime import datetime, timedelta

class AirQualityPredictor:
    def __init__(self):
        self.model = None
        self.target_encoder = None
        self.encoders_info = None
        
        # Chemins vers les fichiers - Mise à jour pour la nouvelle structure
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'air_quality')
        self.model_path = os.path.join(models_dir, 'modele_final.pkl')
        self.target_encoder_path = os.path.join(models_dir, 'target_encoder.pkl')
        self.django_encoders_path = os.path.join(models_dir, 'infos_modele.pkl')
        
    def load_model(self):
        """Charge le modèle Random Forest"""
        try:
            # Charger le modèle principal
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("✅ Modèle Random Forest chargé")
                return True
            else:
                print("❌ Modèle non trouvé")
                return False
            
        except Exception as e:
            print(f"❌ Erreur chargement modèle: {e}")
            return False
    
    def predict_air_quality(self, humidite, temperature, periode_encoded, mois, semaine_mois=None):
        """Prédit la qualité de l'air avec le nouveau modèle RF (4 features)"""
        # Charger le modèle si pas encore fait
        if self.model is None:
            if not self.load_model():
                return "Modèle non disponible"
        
        try:
            # Convertir en float pour éviter les erreurs de type
            humidite = float(humidite)
            temperature = float(temperature)
            periode_encoded = int(periode_encoded)
            mois = int(mois)
            
            # Préparer les données [humidité, temperature, periode_encoded, mois]
            features = np.array([[humidite, temperature, periode_encoded, mois]], dtype=float)
            
            print(f"🔮 Prédiction: H={humidite}%, T={temperature}°C, P={periode_encoded}, M={mois}")
            
            # Faire la prédiction
            prediction = self.model.predict(features)[0]
            print(f"🎯 Prédiction du modèle: {prediction}")
            
            return prediction
                
        except Exception as e:
            print(f"❌ Erreur prédiction: {e}")
            import traceback
            traceback.print_exc()
            return "Erreur système"
    
    def get_treatment_recommendation(self, prediction):
        """Retourne la recommandation de traitement basée sur la prédiction"""
        recommendations = {
            "bon": "Aucun traitement nécessaire - Conditions optimales",
            "moyen": "Surveillance préventive recommandée - Préparer le matériel",
            "mauvais": "Traitement curatif recommandé - Intervention dans les 24h",
            "très mauvais": "Traitement curatif urgent - Intervention immédiate requise"
        }
        
        return recommendations.get(prediction.lower(), "Surveillance recommandée")

    def predict_weekly_forecast(self):
        """Prédiction pour la semaine prochaine basée sur les moyennes historiques"""
        try:
            from capteurs.models import Mesure
            from django.utils import timezone
            
            today = timezone.now()
            predictions = []
            
            # Générer prédictions pour les 7 prochains jours
            for day_offset in range(1, 8):
                target_date = today + timedelta(days=day_offset)
                
                # Calculer les moyennes historiques pour cette période
                historical_avg = self.get_historical_averages(target_date)
                
                if historical_avg:
                    # Faire la prédiction avec les moyennes historiques
                    prediction = self.predict_air_quality(
                        historical_avg['humidite'],
                        historical_avg['temperature'],
                        historical_avg['periode_encoded'],
                        target_date.month
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
                        prediction = self.predict_air_quality(
                            current_data['humidite'],
                            current_data['temperature'],
                            current_data['periode_encoded'],
                            target_date.month
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
            print(f"❌ Erreur prédiction hebdomadaire: {e}")
            return []
    
    def get_historical_averages(self, target_date):
        """Récupère les moyennes historiques pour une date donnée"""
        try:
            from capteurs.models import Mesure
            from django.db.models import Avg
            from django.utils import timezone
            
            # Chercher les données de la même période l'année passée
            last_year = target_date.year - 1
            same_period_last_year = target_date.replace(year=last_year)
            
            # Plage de dates (± 3 jours)
            start_date = same_period_last_year - timedelta(days=3)
            end_date = same_period_last_year + timedelta(days=3)
            
            # Récupérer les moyennes
            averages = Mesure.objects.filter(
                date_recue__date__range=[start_date.date(), end_date.date()]
            ).aggregate(
                avg_temp=Avg('temperature'),
                avg_hum=Avg('humidite'),
                avg_periode=Avg('periode_encoded')
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
                    'periode_encoded': last_mesure.periode_encoded
                }
            else:
                return None
                
        except Exception as e:
            print(f"⚠️ Erreur données actuelles: {e}")
            return None

# Instance globale
air_quality_predictor = AirQualityPredictor()

# Fonctions helper pour les vues Django
def predict_air_quality(humidite, temperature, periode_encoded, mois, semaine_mois=None):
    """Fonction helper pour prédiction"""
    return air_quality_predictor.predict_air_quality(humidite, temperature, periode_encoded, mois)

def get_treatment_recommendation(prediction):
    """Fonction helper pour recommandations"""
    return air_quality_predictor.get_treatment_recommendation(prediction)

def get_weekly_forecast():
    """Fonction helper pour prédictions hebdomadaires"""
    return air_quality_predictor.predict_weekly_forecast()

def get_monthly_forecast():
    """Fonction helper pour prédictions mensuelles"""
    return air_quality_predictor.predict_monthly_forecast()