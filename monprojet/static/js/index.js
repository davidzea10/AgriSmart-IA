// ===== AGRISMART INDEX PAGE SCRIPT =====

class AgriSmartIndex {
    constructor() {
        console.log('🌱 AgriSmart System Initialized');
        this.initializeSystem();
        this.startRealTimeUpdates();
        this.updateSystemTime();
        this.loadStatistics();
    }

    initializeSystem() {
        console.log('🔄 Initialisation du système...');
        this.updateSystemStatus();
    }

    // Mise à jour des données en temps réel
    startRealTimeUpdates() {
        console.log('📡 Démarrage des mises à jour en temps réel');
        this.updateOverviewData();
        
        // Mise à jour toutes les 5 secondes
        setInterval(() => {
            this.updateOverviewData();
            this.updateAlerts();
        }, 5000);
    }

    // Récupération et affichage des données de l'aperçu
    async updateOverviewData() {
        try {
            console.log('🔄 Récupération des données...');
            const response = await fetch('/envoyer/?last=1');
            const data = await response.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                
                console.log('📊 Données reçues:', {
                    humidite_sol: latest.humidite_sol,
                    niveau_sol: latest.niveau_sol,
                    temperature: latest.temperature,
                    humidite: latest.humidite,
                    qualite_air: latest.qualite_air,
                    niveau_air: latest.niveau_air
                });
                
                // Mise à jour des données d'affichage avec vérification
                const elements = {
                    'soil-hum-overview': latest.humidite_sol ? `${latest.humidite_sol}%` : '--%',
                    'soil-level-overview': latest.niveau_sol || '--',
                    'temp-overview': latest.temperature ? `${latest.temperature}°C` : '--°C',
                    'hum-overview': latest.humidite ? `${latest.humidite}%` : '--%',
                    'air-level-overview': latest.niveau_air || '--'
                };

                // Mise à jour sécurisée des éléments
                Object.entries(elements).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                        console.log(`✅ ${id} mis à jour:`, value);
                    } else {
                        console.log(`⚠️ Élément ${id} non trouvé`);
                    }
                });
                
                // Mise à jour des prédictions
                this.updateSoilPrediction(latest);
                this.updateAIPrediction(latest);
                this.updateLastUpdate();
                
            } else {
                console.log('⚠️ Aucune donnée reçue');
                // Réinitialisation sécurisée des valeurs
                const defaultValues = {
                    'soil-hum-overview': '--%',
                    'soil-level-overview': '--',
                    'temp-overview': '--°C',
                    'hum-overview': '--%',
                    'air-level-overview': '--'
                };

                Object.entries(defaultValues).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                    }
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données:', error);
            this.showAlert('Erreur de connexion aux capteurs', 'danger');
        }
    }

    // Prédiction pour l'humidité du sol et irrigation
    updateSoilPrediction(data) {
        const soilValue = parseFloat(data.humidite_sol) || 0;
        let prediction = '';
        let className = '';

        if (soilValue >= 80) {
            prediction = 'Surveiller drainage';
            className = 'good';
        } else if (soilValue >= 50) {
            prediction = 'Conditions optimales';
            className = 'excellent';
        } else if (soilValue >= 20) {
            prediction = 'Planifier irrigation';
            className = 'average';
        } else {
            prediction = 'Irrigation urgente';
            className = 'poor';
        }

        const predictionElement = document.getElementById('soil-prediction');
        if (predictionElement) {
            predictionElement.textContent = prediction;
            predictionElement.className = `prediction-value ${className}`;
        }
        
        // Mettre à jour le style du statut
        const statusElement = document.getElementById('soil-level-overview');
        if (statusElement) {
            statusElement.className = `card-status ${className}`;
        }
    }

    // Prédiction IA pour la qualité de l'air
    updateAIPrediction(data) {
        const airValue = parseInt(data.qualite_air) || 0;
        let prediction = '';
        let className = '';

        if (airValue < 1000) {
            prediction = 'Aucun traitement nécessaire';
            className = 'excellent';
        } else if (airValue < 2000) {
            prediction = 'Surveillance préventive';
            className = 'good';
        } else if (airValue < 3000) {
            prediction = 'Traitement préventif recommandé';
            className = 'average';
        } else {
            prediction = 'Traitement curatif urgent';
            className = 'poor';
        }

        const predictionElement = document.getElementById('air-prediction');
        if (predictionElement) {
            predictionElement.textContent = prediction;
            predictionElement.className = `prediction-value ${className}`;
        }
    }

    // Gestion des alertes intelligentes
    updateAlerts() {
        const alertsContainer = document.getElementById('alerts-content');
        
        fetch('/envoyer/?last=1')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const latest = data[0];
                    this.analyzeAndShowAlerts(latest, alertsContainer);
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'analyse des alertes:', error);
            });
    }

    analyzeAndShowAlerts(data, container) {
        const alerts = [];
        const temp = parseFloat(data.temperature) || 0;
        const humidity = parseFloat(data.humidite) || 0;
        const airValue = parseInt(data.qualite_air) || 0;
        const soilValue = parseFloat(data.humidite_sol) || 0;

        // Alertes de température
        if (temp > 35) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-temperature-high',
                message: `Température critique: ${temp}°C - Irrigation recommandée`,
                time: 'maintenant'
            });
        }

        // Alertes d'humidité du sol
        if (soilValue < 20) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-seedling',
                message: `Sol très sec: ${soilValue}% - Irrigation urgente`,
                time: 'maintenant'
            });
        } else if (soilValue < 50) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-tint',
                message: `Sol assez sec: ${soilValue}% - Planifier irrigation`,
                time: 'maintenant'
            });
        }

        // Alertes de qualité d'air
        if (airValue > 3000) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-exclamation-triangle',
                message: `Qualité d'air critique: ${airValue} - Traitement urgent`,
                time: 'maintenant'
            });
        }

        this.displayAlerts(alerts, container);
    }

    displayAlerts(alerts, container) {
        const systemAlert = container.querySelector('.alert-item.info');
        container.innerHTML = '';
        
        if (systemAlert) {
            container.appendChild(systemAlert);
        }

        if (alerts.length === 0) {
            const noAlert = document.createElement('div');
            noAlert.className = 'alert-item info';
            noAlert.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Aucune alerte - Conditions optimales</span>
                <small>${new Date().toLocaleTimeString('fr-FR')}</small>
            `;
            container.appendChild(noAlert);
        } else {
            alerts.forEach(alert => {
                const alertElement = document.createElement('div');
                alertElement.className = `alert-item ${alert.type}`;
                alertElement.innerHTML = `
                    <i class="${alert.icon}"></i>
                    <span>${alert.message}</span>
                    <small>${alert.time}</small>
                `;
                container.appendChild(alertElement);
            });
        }
    }

    // Statistiques
    async loadStatistics() {
        try {
            document.getElementById('total-measurements').textContent = '1,247';
            document.getElementById('uptime').textContent = '99.8%';
            this.updateLastUpdate();
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    updateLastUpdate() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const element = document.getElementById('last-update');
        if (element) {
            element.textContent = timeString;
        }
    }

    updateSystemTime() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('fr-FR');
            const systemTimeElement = document.getElementById('system-time');
            if (systemTimeElement) {
                systemTimeElement.textContent = timeString;
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    updateSystemStatus() {
        fetch('/envoyer/?last=1')
            .then(response => {
                if (response.ok) {
                    this.showSystemStatus('Capteurs connectés', 'info');
                } else {
                    this.showSystemStatus('Problème de connexion', 'warning');
                }
            })
            .catch(() => {
                this.showSystemStatus('Capteurs déconnectés', 'danger');
            });
    }

    showSystemStatus(message, type) {
        const alertsContainer = document.getElementById('alerts-content');
        if (alertsContainer) {
            const existingSystemAlert = alertsContainer.querySelector('.alert-item.info');
            if (existingSystemAlert) {
                existingSystemAlert.querySelector('span').textContent = message;
                existingSystemAlert.className = `alert-item ${type}`;
            }
        }
    }

    showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alerts-content');
        if (alertsContainer) {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${type}`;
            alertElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <small>${new Date().toLocaleTimeString('fr-FR')}</small>
            `;
            
            alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
            
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 10000);
        }
    }
}

// Styles CSS pour les prédictions
const additionalStyles = `
    .prediction-value.excellent { color: #2ecc71 !important; }
    .prediction-value.good { color: #3498db !important; }
    .prediction-value.average { color: #f39c12 !important; }
    .prediction-value.poor { color: #e74c3c !important; }
    
    .card-status.excellent {
        background: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
    }
    .card-status.good {
        background: rgba(52, 152, 219, 0.1);
        color: #3498db;
    }
    .card-status.average {
        background: rgba(243, 156, 18, 0.1);
        color: #f39c12;
    }
    .card-status.poor {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
    }
`;

// Ajouter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new AgriSmartIndex();
});
