# Package de prédiction pour AgriSmart
# Service de prédiction de la qualité de l'air basé sur ML 

from .services.air_quality_service import predict_air_quality, get_treatment_recommendation, get_weekly_forecast
from .services.soil_humidity_service import predict_soil_humidity, get_irrigation_recommendation, get_weekly_soil_forecast

__all__ = [
    'predict_air_quality',
    'get_treatment_recommendation',
    'get_weekly_forecast',
    'predict_soil_humidity',
    'get_irrigation_recommendation',
    'get_weekly_soil_forecast'
] 