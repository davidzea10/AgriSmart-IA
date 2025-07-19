from django.contrib import admin
from .models import Mesure

@admin.register(Mesure)
class MesureAdmin(admin.ModelAdmin):
    list_display = ('date_recue', 'temperature', 'humidite', 'qualite_air', 'niveau_air', 'humidite_sol', 'niveau_sol')
    list_filter = ('niveau_air', 'niveau_sol', 'date_recue')
    search_fields = ('niveau_air', 'niveau_sol')
    readonly_fields = ('periode_encoded', 'mois', 'semaine_mois')  # Champs ML en lecture seule
    
    fieldsets = (
        ('Données Principales', {
            'fields': ('temperature', 'humidite', 'qualite_air', 'niveau_air')
        }),
        ('Humidité du Sol', {
            'fields': ('humidite_sol', 'niveau_sol'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('date_recue',),
            'classes': ('collapse',)
        }),
        ('Données ML (Auto-calculées)', {
            'fields': ('periode_encoded', 'mois', 'semaine_mois'),
            'classes': ('collapse',)
        }),
    )
