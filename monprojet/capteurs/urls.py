from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('envoyer/', views.recevoir_mesure, name='recevoir_mesure'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('historique/', views.historique, name='historique'),
    path('export/', views.export_historique, name='export_historique'),
    path('stats/', views.stats, name='stats'),
    path('about/', views.about, name='about'),
    # Nouvelles routes pour les prédictions ML
    path('predictions/', views.predictions, name='predictions'),
    path('api/predictions/', views.predictions_api, name='predictions_api'),
    path('api/predictions/soil/', views.predictions_soil_api, name='predictions_soil_api'),
]
