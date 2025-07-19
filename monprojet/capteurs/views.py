from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from datetime import timedelta
import json
import csv
from .models import Mesure

# Import du service ML
from predictions.services.air_quality_service import predict_air_quality, get_treatment_recommendation, get_weekly_forecast
from predictions.services.soil_humidity_service import predict_soil_humidity, get_irrigation_recommendation

# Import du service email
from .email_service import PredictionEmailService

def index(request):
    """Page d'accueil AgriSmart avec aperçu général"""
    return render(request, 'capteurs/index.html')

@csrf_exempt
def recevoir_mesure(request):
    if request.method == 'GET' and request.GET.get('last') == '1':
        # API pour dashboard temps réel : retourne la dernière mesure
        last = Mesure.objects.order_by('-date_recue').first()
        if last:
            # Debug pour voir les valeurs
            print("\n🔍 DEBUG API - Dernière mesure en BDD:")
            print(f"   - Température: {last.temperature}°C")
            print(f"   - Humidité air: {last.humidite}%")
            print(f"   - Humidité sol: {last.humidite_sol}%")
            print(f"   - Niveau sol: {last.niveau_sol}")
            print("   - Date: {last.date_recue}\n")
            
            return JsonResponse([{
                'temperature': float(last.temperature) if last.temperature else 0,
                'humidite': float(last.humidite) if last.humidite else 0,
                'qualite_air': int(last.qualite_air) if last.qualite_air else 0,
                'niveau_air': str(last.niveau_air) if last.niveau_air else '',
                'humidite_sol': float(last.humidite_sol) if last.humidite_sol else 0.0,
                'niveau_sol': str(last.niveau_sol) if last.niveau_sol else 'inconnu',
                'date_recue': last.date_recue.strftime('%d/%m/%Y %H:%M:%S'),
            }], safe=False)
        else:
            print(" Aucune mesure en BDD")
            return JsonResponse([], safe=False)
    
    if request.method == 'POST':
        try:
            print("\n DONNÉES REÇUES ESP32:")
            raw_data = request.body.decode()
            print(f"   Raw data: {raw_data}")
            
            data = json.loads(raw_data)
            print("\n DONNÉES PARSÉES:")
            print(f"   - Humidité sol: {data.get('humidite_sol')}%")
            print(f"   - Niveau sol: {data.get('niveau_sol')}")
            
            mesure = Mesure.objects.create(
                temperature=data.get('temperature'),
                humidite=data.get('humidite'),
                qualite_air=data.get('qualite_air'),
                niveau_air=data.get('niveau_air', ''),
                humidite_sol=data.get('humidite_sol', 0.0),
                niveau_sol=data.get('niveau_sol', 'inconnu'),
                date_recue=timezone.now()
            )
            
            print("\n MESURE SAUVÉE EN BDD:")
            print(f"   ID: {mesure.id}")
            print(f"   Humidité sol: {mesure.humidite_sol}%")
            print(f"   Niveau sol: {mesure.niveau_sol}\n")
            
            return JsonResponse({'status': 'success', 'id': mesure.id})
            
        except Exception as e:
            print(f"\n ERREUR SAUVEGARDE:")
            print(f"   {str(e)}\n")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)

def dashboard(request):
    # Récupère les 7 dernières mesures pour les graphiques, dans l'ordre chronologique
    mesures = Mesure.objects.order_by('date_recue')[:7]
    return render(request, 'capteurs/dashboard.html', {'mesures': mesures})

def historique(request):
    """Vue historique avec filtres et pagination"""
    # Récupérer les paramètres de filtre
    periode = request.GET.get('periode', 'all')
    type_donnee = request.GET.get('type', 'all')
    page = int(request.GET.get('page', 1))
    items_per_page = 10

    # Base de la requête
    mesures = Mesure.objects.order_by('-date_recue')

    # Appliquer les filtres de période
    from datetime import datetime, timedelta
    today = datetime.now().date()
    
    if periode == 'today':
        mesures = mesures.filter(date_recue__date=today)
    elif periode == 'yesterday':
        yesterday = today - timedelta(days=1)
        mesures = mesures.filter(date_recue__date=yesterday)
    elif periode == 'week':
        week_ago = today - timedelta(days=7)
        mesures = mesures.filter(date_recue__date__gte=week_ago)
    elif periode == 'month':
        month_ago = today - timedelta(days=30)
        mesures = mesures.filter(date_recue__date__gte=month_ago)

    # Appliquer les filtres de type de données
    if type_donnee == 'temperature':
        mesures = mesures.exclude(temperature__isnull=True)
    elif type_donnee == 'humidity':
        mesures = mesures.exclude(humidite__isnull=True)
    elif type_donnee == 'air_quality':
        mesures = mesures.exclude(qualite_air__isnull=True)
    elif type_donnee == 'soil_humidity':
        mesures = mesures.exclude(humidite_sol__isnull=True)

    # Calculer la pagination
    total_items = mesures.count()
    total_pages = (total_items + items_per_page - 1) // items_per_page
    
    # Ajuster la page si nécessaire
    if page < 1:
        page = 1
    elif page > total_pages:
        page = total_pages

    # Appliquer la pagination
    start_idx = (page - 1) * items_per_page
    end_idx = start_idx + items_per_page
    mesures_page = mesures[start_idx:end_idx]

    # Préparer le contexte
    context = {
        'mesures': mesures_page,
        'current_page': page,
        'total_pages': total_pages,
        'total_items': total_items,
        'periode': periode,
        'type_donnee': type_donnee,
        'has_previous': page > 1,
        'has_next': page < total_pages,
        'previous_page': page - 1,
        'next_page': page + 1,
        'page_range': range(max(1, page - 2), min(total_pages + 1, page + 3)),
    }

    return render(request, 'capteurs/historique.html', context)

def predictions(request):
    """Page des prédictions ML"""
    try:
        # Récupérer la dernière mesure
        last_mesure = Mesure.objects.order_by('-date_recue').first()
        
        context = {
            'last_mesure': last_mesure,
            'error': None,
            'date_prediction': (timezone.now() + timedelta(days=1)).strftime('%d/%m/%Y'),
            'timestamp': str(int(timezone.now().timestamp()))  # Pour forcer le rechargement du JS
        }
        
        if last_mesure:
            # Prédiction qualité air
            air_prediction = predict_air_quality(
                last_mesure.humidite,
                last_mesure.temperature,
                last_mesure.periode_encoded,
                last_mesure.mois
            )
            context['air'] = {
                'prediction': air_prediction,
                'recommendation': get_treatment_recommendation(air_prediction)
            }
            
            # Prédiction humidité sol
            soil_prediction = predict_soil_humidity(
                last_mesure.humidite,
                last_mesure.temperature,
                last_mesure.periode_encoded,
                last_mesure.mois,
                last_mesure.semaine_mois
            )
            context['soil'] = {
                'prediction': soil_prediction,
                'recommendation': get_irrigation_recommendation(soil_prediction)
            }
        else:
            context['error'] = "Aucune donnée disponible pour la prédiction"
        
        return render(request, 'capteurs/predictions.html', context)
        
    except Exception as e:
        print(f" Erreur dans la vue predictions: {e}")
        return render(request, 'capteurs/predictions.html', {
            'error': f"Erreur du système de prédiction: {str(e)}"
        })

def calculate_planning_recommendations(weekly_air_forecast, weekly_soil_forecast):
    """Calcule des recommandations de planification basées sur les prédictions"""
    recommendations = []
    
    # Analyse qualité de l'air
    if weekly_air_forecast:
        urgent_days = [day for day in weekly_air_forecast if day['prediction'] == 'mauvais']
        preventive_days = [day for day in weekly_air_forecast if day['prediction'] == 'moyen']
        
        if urgent_days:
            recommendations.append({
                'type': 'urgent',
                'title': 'Traitement phytosanitaire urgent',
                'description': f"Intervention nécessaire le {urgent_days[0]['day_name']} ({urgent_days[0]['date']})",
                'icon': 'fas fa-exclamation-triangle',
                'period': 'cette_semaine'
            })
        
        if preventive_days:
            recommendations.append({
                'type': 'preventive',
                'title': 'Traitement préventif',
                'description': f"Surveillance renforcée recommandée pour {len(preventive_days)} jour(s)",
                'icon': 'fas fa-shield-alt',
                'period': 'cette_semaine'
            })
    
    # Analyse humidité du sol
    if weekly_soil_forecast:
        tres_sec_days = [day for day in weekly_soil_forecast if day['prediction'] == 'tres_sec']
        assez_sec_days = [day for day in weekly_soil_forecast if day['prediction'] == 'assez_sec']
        
        if tres_sec_days:
            recommendations.append({
                'type': 'urgent',
                'title': 'Irrigation urgente requise',
                'description': f"Sol très sec prévu le {tres_sec_days[0]['day_name']} ({tres_sec_days[0]['date']})",
                'icon': 'fas fa-tint-slash',
                'period': 'cette_semaine'
            })
        
        if assez_sec_days:
            recommendations.append({
                'type': 'warning',
                'title': 'Planification irrigation',
                'description': f"Prévoir irrigation pour {len(assez_sec_days)} jour(s)",
                'icon': 'fas fa-tint',
                'period': 'cette_semaine'
            })
    
    if not recommendations:
        recommendations.append({
            'type': 'good',
            'title': 'Conditions favorables',
            'description': 'Aucun traitement majeur prévu dans l\'immédiat',
            'icon': 'fas fa-check-circle',
            'period': 'general'
        })
    
    return recommendations

@csrf_exempt
def predictions_api(request):
    """API endpoint pour les prédictions en temps réel (JSON)"""
    if request.method == 'GET':
        try:
            # Récupérer la dernière mesure
            last_mesure = Mesure.objects.order_by('-date_recue').first()
            
            if not last_mesure:
                return JsonResponse({
                    'error': 'Aucune donnée disponible',
                    'timestamp': timezone.now().isoformat()
                }, status=404)
            
            # Faire la prédiction
            prediction_result = predict_air_quality(
                last_mesure.humidite,
                last_mesure.temperature,
                last_mesure.periode_encoded,
                last_mesure.mois,
                last_mesure.semaine_mois
            )
            
            # Obtenir la recommandation
            treatment_recommendation = get_treatment_recommendation(prediction_result)
            
            # Calculer un score de confiance basique (optionnel)
            confidence = 0.85  # Vous pourriez l'améliorer avec predict_proba si disponible
            
            # Préparer les données pour l'email
            email_data = {
                'temperature': last_mesure.temperature,
                'humidite': last_mesure.humidite,
                'qualite_air': last_mesure.qualite_air,
                'niveau_air': last_mesure.niveau_air,
                'humidite_sol': last_mesure.humidite_sol,
                'niveau_sol': last_mesure.niveau_sol
            }
            
            # Envoyer l'email de notification
            try:
                PredictionEmailService.send_prediction_notification(
                    prediction_type='air',
                    prediction_result=prediction_result,
                    recommendation=treatment_recommendation,
                    last_data=email_data
                )
                print(f"✅ Email de prédiction AIR envoyé: {prediction_result}")
            except Exception as e:
                print(f"❌ Erreur envoi email AIR: {str(e)}")
            
            # Retourner la réponse JSON
            response_data = {
                'status': 'success',
                'air': {
                    'prediction': prediction_result,
                    'recommendation': treatment_recommendation
                },
                'last_data': {
                    'temperature': last_mesure.temperature,
                    'humidite': last_mesure.humidite,
                    'qualite_air': last_mesure.qualite_air,
                    'niveau_air': last_mesure.niveau_air,
                    'date_recue': last_mesure.date_recue.isoformat()
                },
                'ml_features': {
                    'periode_encoded': last_mesure.periode_encoded,
                    'mois': last_mesure.mois,
                    'semaine_mois': last_mesure.semaine_mois
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return JsonResponse(response_data)
            
        except Exception as e:
            print(f" Erreur API predictions: {e}")
            return JsonResponse({
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=500)
    
    else:
        return JsonResponse({
            'error': 'Méthode non autorisée. Utiliser GET.',
            'timestamp': timezone.now().isoformat()
        }, status=405)

@csrf_exempt
def predictions_soil_api(request):
    """API endpoint pour les prédictions d'humidité du sol"""
    if request.method == 'GET':
        try:
            # Récupérer la dernière mesure
            last_mesure = Mesure.objects.order_by('-date_recue').first()
            
            if not last_mesure:
                return JsonResponse({
                    'error': 'Aucune donnée disponible',
                    'timestamp': timezone.now().isoformat()
                }, status=404)
            
            # Faire la prédiction
            soil_prediction = predict_soil_humidity(
                last_mesure.humidite,
                last_mesure.temperature,
                last_mesure.periode_encoded,
                last_mesure.mois,
                last_mesure.semaine_mois
            )
            
            # Obtenir la recommandation
            irrigation_recommendation = get_irrigation_recommendation(soil_prediction)
            
            # Préparer les données pour l'email
            email_data = {
                'temperature': last_mesure.temperature,
                'humidite': last_mesure.humidite,
                'qualite_air': last_mesure.qualite_air,
                'niveau_air': last_mesure.niveau_air,
                'humidite_sol': last_mesure.humidite_sol,
                'niveau_sol': last_mesure.niveau_sol
            }
            
            # Envoyer l'email de notification
            try:
                PredictionEmailService.send_prediction_notification(
                    prediction_type='soil',
                    prediction_result=soil_prediction,
                    recommendation=irrigation_recommendation,
                    last_data=email_data
                )
                print(f"✅ Email de prédiction SOL envoyé: {soil_prediction}")
            except Exception as e:
                print(f"❌ Erreur envoi email SOL: {str(e)}")
            
            # Retourner la réponse JSON
            response_data = {
                'status': 'success',
                'soil': {
                    'prediction': soil_prediction,
                    'recommendation': irrigation_recommendation
                },
                'last_data': {
                    'temperature': last_mesure.temperature,
                    'humidite': last_mesure.humidite,
                    'humidite_sol': last_mesure.humidite_sol,
                    'niveau_sol': last_mesure.niveau_sol,
                    'date_recue': last_mesure.date_recue.isoformat()
                },
                'ml_features': {
                    'periode_encoded': last_mesure.periode_encoded,
                    'mois': last_mesure.mois,
                    'semaine_mois': last_mesure.semaine_mois
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return JsonResponse(response_data)
            
        except Exception as e:
            print(f"❌ Erreur API predictions sol: {e}")
            return JsonResponse({
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=500)
    
    return JsonResponse({
        'error': 'Méthode non autorisée. Utiliser GET.',
        'timestamp': timezone.now().isoformat()
    }, status=405)

@csrf_exempt
def export_historique(request):
    """Export des données historiques en CSV ou Excel"""
    format_export = request.GET.get('format', 'csv')
    
    # Récupérer toutes les mesures
    mesures = Mesure.objects.order_by('-date_recue')
    
    if format_export == 'csv':
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="historique_agrismart.csv"'
        
        # Ajouter BOM pour UTF-8 (pour Excel)
        response.write('\ufeff')
        
        writer = csv.writer(response)
        # En-têtes
        writer.writerow(['Date', 'Heure', 'Température', 'Humidité Air', 'Qualité Air', 'Humidité Sol', 'Niveau Sol'])
        
        # Données
        for mesure in mesures:
            writer.writerow([
                mesure.date_recue.strftime('%d/%m/%Y'),
                mesure.date_recue.strftime('%H:%M:%S'),
                f"{mesure.temperature}°C" if mesure.temperature else '',
                f"{mesure.humidite}%" if mesure.humidite else '',
                mesure.niveau_air or '',
                f"{mesure.humidite_sol}%" if mesure.humidite_sol else '',
                mesure.niveau_sol or ''
            ])
        
        return response
    
    elif format_export == 'excel':
        response = HttpResponse(content_type='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment; filename="historique_agrismart.xls"'
        
        # Template HTML pour Excel
        html = '''
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #2ecc71; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc; }
                td { padding: 8px; border: 1px solid #ccc; text-align: center; }
                tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>Historique des Données AgriSmart</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Température</th>
                        <th>Humidité Air</th>
                        <th>Qualité Air</th>
                        <th>Humidité Sol</th>
                        <th>Niveau Sol</th>
                    </tr>
                </thead>
                <tbody>
        '''
        
        for mesure in mesures:
            html += f'''
                <tr>
                    <td>{mesure.date_recue.strftime('%d/%m/%Y')}</td>
                    <td>{mesure.date_recue.strftime('%H:%M:%S')}</td>
                    <td>{mesure.temperature}°C</td>
                    <td>{mesure.humidite}%</td>
                    <td>{mesure.niveau_air or ''}</td>
                    <td>{mesure.humidite_sol}%</td>
                    <td>{mesure.niveau_sol or ''}</td>
                </tr>
            '''
        
        html += '''
                </tbody>
            </table>
        </body>
        </html>
        '''
        
        response.write(html)
        return response
    
    return JsonResponse({'error': 'Format non supporté'}, status=400)

def stats(request):
    """Vue des statistiques avec données réelles"""
    from django.db.models import Avg, Max, Min, Count
    from django.utils import timezone
    from datetime import timedelta

    # Récupérer toutes les mesures des 30 derniers jours
    date_limite = timezone.now() - timedelta(days=30)
    mesures = Mesure.objects.filter(date_recue__gte=date_limite)

    # Statistiques générales
    context = {
        'total_mesures': Mesure.objects.count(),
        'avg_humidite_sol': round(mesures.aggregate(Avg('humidite_sol'))['humidite_sol__avg'] or 0, 1),
        'avg_temperature': round(mesures.aggregate(Avg('temperature'))['temperature__avg'] or 0, 1),
        'data_quality': 98.5,  # À calculer selon vos critères de qualité
    }

    # Distribution de l'humidité du sol
    def get_soil_distribution(mesures):
        total = mesures.count()
        if total == 0:
            return {'tres_sec': 0, 'assez_sec': 0, 'humide': 0, 'tres_humide': 0}
        
        tres_sec = mesures.filter(humidite_sol__lt=20).count()
        assez_sec = mesures.filter(humidite_sol__range=(20, 50)).count()
        humide = mesures.filter(humidite_sol__range=(50, 80)).count()
        tres_humide = mesures.filter(humidite_sol__gte=80).count()
        
        return {
            'tres_sec': round((tres_sec/total) * 100, 1),
            'assez_sec': round((assez_sec/total) * 100, 1),
            'humide': round((humide/total) * 100, 1),
            'tres_humide': round((tres_humide/total) * 100, 1)
        }

    context['soil_dist'] = get_soil_distribution(mesures)

    # Records
    records = {
        'temp_max': mesures.aggregate(Max('temperature'))['temperature__max'],
        'temp_min': mesures.aggregate(Min('temperature'))['temperature__min'],
        'soil_max': mesures.aggregate(Max('humidite_sol'))['humidite_sol__max'],
        'soil_min': mesures.aggregate(Min('humidite_sol'))['humidite_sol__min'],
    }

    # Ajouter les dates des records
    temp_max_record = mesures.filter(temperature=records['temp_max']).first()
    temp_min_record = mesures.filter(temperature=records['temp_min']).first()
    soil_max_record = mesures.filter(humidite_sol=records['soil_max']).first()
    soil_min_record = mesures.filter(humidite_sol=records['soil_min']).first()

    records.update({
        'temp_max_date': temp_max_record.date_recue.strftime('%d/%m/%Y') if temp_max_record else '-',
        'temp_min_date': temp_min_record.date_recue.strftime('%d/%m/%Y') if temp_min_record else '-',
        'soil_max_date': soil_max_record.date_recue.strftime('%d/%m/%Y') if soil_max_record else '-',
        'soil_min_date': soil_min_record.date_recue.strftime('%d/%m/%Y') if soil_min_record else '-',
    })

    context['records'] = records

    # Statistiques par période
    def get_period_stats(mesures):
        matin = mesures.filter(periode_encoded=0)
        midi = mesures.filter(periode_encoded=1)
        soir = mesures.filter(periode_encoded=2)

        def calc_stats(qs):
            stats = qs.aggregate(
                avg_hum=Avg('humidite_sol'),
                avg_temp=Avg('temperature'),
                avg_air=Avg('qualite_air')
            )
            return {
                'humidite_sol': round(stats['avg_hum'] or 0, 1),
                'temperature': round(stats['avg_temp'] or 0, 1),
                'qualite_air': round(stats['avg_air'] or 0, 1)
            }

        return {
            'matin': calc_stats(matin),
            'midi': calc_stats(midi),
            'soir': calc_stats(soir)
        }

    context['period_stats'] = get_period_stats(mesures)

    # Alertes fréquentes
    context['frequent_alerts'] = [
        {
            'type': 'warning',
            'icon': 'fa-temperature-high',
            'title': 'Température élevée',
            'frequency': round(mesures.filter(temperature__gt=30).count() / mesures.count() * 100, 1)
        },
        {
            'type': 'danger',
            'icon': 'fa-tint-slash',
            'title': 'Sol très sec',
            'frequency': round(mesures.filter(humidite_sol__lt=20).count() / mesures.count() * 100, 1)
        },
        {
            'type': 'warning',
            'icon': 'fa-wind',
            'title': 'Qualité air dégradée',
            'frequency': round(mesures.filter(qualite_air__gt=2000).count() / mesures.count() * 100, 1)
        }
    ]

    # Tendances actuelles
    dernieres_mesures = mesures.order_by('-date_recue')[:2]
    if len(dernieres_mesures) >= 2:
        derniere = dernieres_mesures[0]
        avant_derniere = dernieres_mesures[1]
        
        def calc_trend(current, previous, unit=''):
            if not current or not previous:
                return {'direction': 'right', 'change': '0' + unit}
            diff = current - previous
            return {
                'direction': 'up' if diff > 0 else 'down',
                'change': f"{abs(round(diff, 1))}{unit}"
            }

        context['current_trends'] = [
            {
                'icon': 'fa-seedling',
                'title': 'Humidité Sol',
                'value': f"{derniere.humidite_sol}%",
                **calc_trend(derniere.humidite_sol, avant_derniere.humidite_sol, '%')
            },
            {
                'icon': 'fa-temperature-high',
                'title': 'Température',
                'value': f"{derniere.temperature}°C",
                **calc_trend(derniere.temperature, avant_derniere.temperature, '°C')
            },
            {
                'icon': 'fa-wind',
                'title': 'Qualité Air',
                'value': str(derniere.qualite_air),
                **calc_trend(derniere.qualite_air, avant_derniere.qualite_air)
            }
        ]
    else:
        context['current_trends'] = []

    # Préparer les données pour les graphiques
    mesures_json = []
    for m in mesures.order_by('date_recue')[:30]:  # Limiter à 30 points pour les graphiques
        mesures_json.append({
            'date': m.date_recue.strftime('%d/%m/%Y %H:%M'),
            'temperature': float(m.temperature),
            'humidite': float(m.humidite),
            'humidite_sol': float(m.humidite_sol),
            'qualite_air': int(m.qualite_air)
        })

    context['mesures_json'] = json.dumps(mesures_json)
    
    return render(request, 'capteurs/stats.html', context)

def about(request):
    return render(request, 'capteurs/about.html')
