from django.db import models

class Mesure(models.Model):
    temperature = models.FloatField()
    humidite = models.FloatField()
    qualite_air = models.IntegerField()
    niveau_air = models.CharField(max_length=20)
    date_recue = models.DateTimeField(auto_now_add=True)
    
    # NOUVEAUX CHAMPS - Humidité du sol
    humidite_sol = models.FloatField(default=0.0, help_text="Humidité du sol en pourcentage (0-100%)")
    niveau_sol = models.CharField(max_length=20, default="inconnu", help_text="Niveau: très sec, assez sec, humide, très humide")
    
    # Champs cachés pour la prédiction ML uniquement
    periode_encoded = models.IntegerField(default=0)  # 0: matin(4h-11h59), 1: midi(12h-17h59), 2: soir(18h-3h59)
    mois = models.IntegerField(default=1)  # Mois de l'année (1-12)
    semaine_mois = models.IntegerField(default=1)  # Semaine du mois (1-4/5)

    def save(self, *args, **kwargs):
        """Calcul automatique des champs pour ML - invisible dans l'interface"""
        if self.date_recue:
            # Calculer la période selon vos tranches horaires
            heure = self.date_recue.hour
            if 4 <= heure < 12:
                self.periode_encoded = 0  # Matin (4h-11h59)
            elif 12 <= heure < 18:
                self.periode_encoded = 1  # Midi (12h-17h59)
            else:
                self.periode_encoded = 2  # Soir (18h-3h59)
            
            # Calculer le mois
            self.mois = self.date_recue.month
            
            # Calculer la semaine du mois
            jour = self.date_recue.day
            self.semaine_mois = ((jour - 1) // 7) + 1
        
        super().save(*args, **kwargs)

    def __str__(self):
        # Affichage normal avec humidité du sol
        return f"{self.date_recue} - Temp: {self.temperature}°C, Hum air: {self.humidite}%, Hum sol: {self.humidite_sol}%"
