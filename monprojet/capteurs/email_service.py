# ===== SERVICE EMAIL POUR PRÉDICTIONS AGRISMART =====

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PredictionEmailService:
    """Service d'envoi d'emails pour les prédictions AgriSmart"""
    
    @staticmethod
    def send_prediction_notification(prediction_type, prediction_result, recommendation, last_data=None):
        """
        Envoie une notification par email pour une prédiction
        
        Args:
            prediction_type (str): 'air' ou 'soil'
            prediction_result (str): Résultat de la prédiction
            recommendation (str): Recommandation associée
            last_data (dict): Dernières données des capteurs
        """
        try:
            # Préparer le contenu de l'email
            subject = f"🌱 AgriSmart - Nouvelle prédiction {prediction_type.upper()}"
            
            # Formatage des données
            current_time = timezone.now().strftime('%d/%m/%Y à %H:%M')
            
            if prediction_type == 'air':
                type_label = "Qualité de l'Air"
                icon = "💨"
                color = get_air_color(prediction_result)
            else:  # soil
                type_label = "Humidité du Sol"
                icon = "🌱"
                color = get_soil_color(prediction_result)
            
            # Corps de l'email en HTML
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f7fa; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                    .header {{ background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 2rem; text-align: center; }}
                    .header h1 {{ margin: 0; font-size: 1.8rem; }}
                    .header p {{ margin: 0.5rem 0 0; opacity: 0.9; }}
                    .content {{ padding: 2rem; }}
                    .prediction-box {{ background: {color}; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; text-align: center; }}
                    .prediction-result {{ font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0; color: white; text-transform: capitalize; }}
                    .recommendation {{ background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #2ecc71; }}
                    .data-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }}
                    .data-item {{ background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center; }}
                    .data-value {{ font-size: 1.2rem; font-weight: bold; color: #2c3e50; }}
                    .data-label {{ font-size: 0.9rem; color: #7f8c8d; }}
                    .footer {{ background: #2c3e50; color: white; padding: 1rem; text-align: center; font-size: 0.9rem; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{icon} AgriSmart - Prédiction {type_label}</h1>
                        <p>Système de monitoring agricole intelligent</p>
                    </div>
                    
                    <div class="content">
                        <h2>📊 Résultat de la prédiction</h2>
                        <div class="prediction-box">
                            <div class="prediction-result">{prediction_result.replace('_', ' ')}</div>
                            <p style="margin: 0; color: white; opacity: 0.9;">Prédiction générée le {current_time}</p>
                        </div>
                        
                        <div class="recommendation">
                            <h3 style="margin: 0 0 0.5rem; color: #2c3e50;">💡 Recommandation</h3>
                            <p style="margin: 0; color: #64748b; line-height: 1.5;">{recommendation}</p>
                        </div>
            """
            
            # Ajouter les données actuelles si disponibles
            if last_data:
                html_message += f"""
                        <h3>📈 Données actuelles des capteurs</h3>
                        <div class="data-grid">
                            <div class="data-item">
                                <div class="data-value">{last_data.get('temperature', '--')}°C</div>
                                <div class="data-label">Température</div>
                            </div>
                            <div class="data-item">
                                <div class="data-value">{last_data.get('humidite', '--')}%</div>
                                <div class="data-label">Humidité Air</div>
                            </div>
                            <div class="data-item">
                                <div class="data-value">{last_data.get('humidite_sol', '--')}%</div>
                                <div class="data-label">Humidité Sol</div>
                            </div>
                            <div class="data-item">
                                <div class="data-value">{last_data.get('niveau_air', '--')}</div>
                                <div class="data-label">Qualité Air</div>
                            </div>
                        </div>
                """
            
            html_message += f"""
                        <p style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e8f0f5; color: #7f8c8d; font-size: 0.9rem;">
                            Cette prédiction a été générée automatiquement par le système AgriSmart basé sur l'intelligence artificielle.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>🌱 AgriSmart - Agriculture Intelligente pour la RDC</p>
                        <p>Développé par Débuze David | Kinshasa, RDC</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Version texte simple
            text_message = f"""
            🌱 AGRISMART - PRÉDICTION {type_label.upper()}
            
            📊 Résultat: {prediction_result.replace('_', ' ').upper()}
            📅 Généré le: {current_time}
            
            💡 Recommandation:
            {recommendation}
            
            📈 Données actuelles:
            """
            
            if last_data:
                text_message += f"""
            - Température: {last_data.get('temperature', '--')}°C
            - Humidité Air: {last_data.get('humidite', '--')}%
            - Humidité Sol: {last_data.get('humidite_sol', '--')}%
            - Qualité Air: {last_data.get('niveau_air', '--')}
            """
            
            text_message += f"""
            
            ---
            AgriSmart - Agriculture Intelligente pour la RDC
            Développé par Débuze David | Kinshasa, RDC
            """
            
            # Envoyer l'email
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                html_message=html_message,
                fail_silently=False
            )
            
            logger.info(f"✅ Email de prédiction {prediction_type} envoyé avec succès")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email prédiction {prediction_type}: {str(e)}")
            return False

def get_air_color(prediction):
    """Retourne la couleur selon la prédiction air"""
    colors = {
        'bon': '#2ecc71',
        'moyen': '#f39c12', 
        'mauvais': '#e74c3c'
    }
    return colors.get(prediction, '#3498db')

def get_soil_color(prediction):
    """Retourne la couleur selon la prédiction sol"""
    colors = {
        'tres_sec': '#e74c3c',
        'assez_sec': '#f39c12',
        'humide': '#2ecc71',
        'tres_humide': '#3498db'
    }
    return colors.get(prediction, '#2ecc71')

# ===== FONCTIONS UTILITAIRES =====

def send_test_email():
    """Fonction de test pour vérifier la configuration email"""
    try:
        send_mail(
            subject='🧪 Test AgriSmart - Configuration Email',
            message='Ceci est un email de test pour vérifier la configuration Gmail d\'AgriSmart.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message="""
            <h2>🧪 Test de Configuration Email</h2>
            <p>Si vous recevez cet email, la configuration Gmail d'AgriSmart fonctionne correctement !</p>
            <p><strong>Système:</strong> AgriSmart v1.0</p>
            <p><strong>Développeur:</strong> Débuze David</p>
            """,
            fail_silently=False
        )
        print("✅ Email de test envoyé avec succès!")
        return True
    except Exception as e:
        print(f"❌ Erreur envoi email de test: {str(e)}")
        return False 