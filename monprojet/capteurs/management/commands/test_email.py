from django.core.management.base import BaseCommand
from capteurs.email_service import send_test_email, PredictionEmailService

class Command(BaseCommand):
    help = 'Teste la configuration email Gmail pour AgriSmart'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['basic', 'air', 'soil', 'all'],
            default='all',
            help='Type de test à effectuer (basic, air, soil, all)'
        )

    def handle(self, *args, **options):
        test_type = options['type']
        
        self.stdout.write(
            self.style.SUCCESS('🧪 Test de la configuration email Gmail - AgriSmart')
        )
        self.stdout.write('=' * 50)
        
        if test_type in ['basic', 'all']:
            self.stdout.write('\n1️⃣ Test email basique...')
            if send_test_email():
                self.stdout.write(self.style.SUCCESS('✅ Email de test envoyé avec succès!'))
            else:
                self.stdout.write(self.style.ERROR('❌ Échec de l\'envoi de l\'email de test'))
                return
        
        test_data = {
            'temperature': 25.5,
            'humidite': 65.0,
            'qualite_air': 1500,
            'niveau_air': 'moyen',
            'humidite_sol': 45.0,
            'niveau_sol': 'assez_sec'
        }
        
        if test_type in ['air', 'all']:
            self.stdout.write('\n2️⃣ Test email de prédiction (AIR)...')
            if PredictionEmailService.send_prediction_notification(
                prediction_type='air',
                prediction_result='moyen',
                recommendation='Surveillance préventive recommandée - Traitement phytosanitaire dans 24-48h',
                last_data=test_data
            ):
                self.stdout.write(self.style.SUCCESS('✅ Email de prédiction AIR envoyé avec succès!'))
            else:
                self.stdout.write(self.style.ERROR('❌ Échec de l\'envoi de l\'email de prédiction AIR'))
        
        if test_type in ['soil', 'all']:
            self.stdout.write('\n3️⃣ Test email de prédiction (SOL)...')
            if PredictionEmailService.send_prediction_notification(
                prediction_type='soil',
                prediction_result='assez_sec',
                recommendation='Planifier irrigation dans les 24 prochaines heures - Humidité du sol faible',
                last_data=test_data
            ):
                self.stdout.write(self.style.SUCCESS('✅ Email de prédiction SOL envoyé avec succès!'))
            else:
                self.stdout.write(self.style.ERROR('❌ Échec de l\'envoi de l\'email de prédiction SOL'))
        
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('🎯 Tests terminés! Vérifiez votre boîte mail: daviddebuze020@gmail.com'))
        self.stdout.write('📧 Si vous ne recevez pas les emails, vérifiez:')
        self.stdout.write('   - Le mot de passe d\'application Gmail')
        self.stdout.write('   - Les paramètres de sécurité Gmail')
        self.stdout.write('   - Le dossier spam/courrier indésirable') 