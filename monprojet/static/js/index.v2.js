// ===== AGRISMART INDEX PAGE SCRIPT V2 =====

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

    startRealTimeUpdates() {
        console.log('📡 Démarrage des mises à jour en temps réel');
        this.updateOverviewData();
        setInterval(() => {
            this.updateOverviewData();
            this.updateAlerts();
        }, 5000);
    }

    async updateOverviewData() {
        try {
            console.log('🔄 Récupération des données...');
            const response = await fetch('/envoyer/?last=1');
            const data = await response.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                this.updateDisplayValues(latest);
            } else {
                console.log('⚠️ Aucune donnée reçue');
                this.setDefaultValues();
            }
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données:', error);
            this.showAlert('Erreur de connexion aux capteurs', 'danger');
        }
    }

    updateDisplayValues(data) {
        const elements = {
            'soil-hum-overview': data.humidite_sol ? `${data.humidite_sol}%` : '--%',
            'soil-level-overview': data.niveau_sol || '--',
            'temp-overview': data.temperature ? `${data.temperature}°C` : '--°C',
            'hum-overview': data.humidite ? `${data.humidite}%` : '--%',
            'air-level-overview': data.niveau_air || '--'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ ${id} mis à jour:`, value);
            }
        });

        this.updateSoilPrediction(data);
        this.updateAIPrediction(data);
        this.updateLastUpdate();
    }

    setDefaultValues() {
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
        
        const statusElement = document.getElementById('soil-level-overview');
        if (statusElement) {
            statusElement.className = `card-status ${className}`;
        }
    }

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

    updateAlerts() {
        const alertsContainer = document.getElementById('alerts-content');
        if (!alertsContainer) return;
        
        fetch('/envoyer/?last=1')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    this.analyzeAndShowAlerts(data[0], alertsContainer);
                }
            })
            .catch(error => {
                console.error('❌ Erreur alertes:', error);
            });
    }

    analyzeAndShowAlerts(data, container) {
        const alerts = [];

        // Alerte température
        if (data.temperature > 35) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-temperature-high',
                message: `Température critique: ${data.temperature}°C`,
                time: 'maintenant'
            });
        }

        // Alerte humidité sol
        if (data.humidite_sol < 20) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-seedling',
                message: `Sol très sec: ${data.humidite_sol}%`,
                time: 'maintenant'
            });
        }

        // Alerte qualité air
        if (data.qualite_air > 3000) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-wind',
                message: `Qualité air critique: ${data.qualite_air}`,
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
                <span>Conditions optimales</span>
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

    loadStatistics() {
        const elements = {
            'total-measurements': '1,247',
            'uptime': '99.8%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        this.updateLastUpdate();
    }

    updateLastUpdate() {
        const element = document.getElementById('last-update');
        if (element) {
            element.textContent = new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    updateSystemTime() {
        const updateTime = () => {
            const element = document.getElementById('system-time');
            if (element) {
                element.textContent = new Date().toLocaleString('fr-FR');
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    updateSystemStatus() {
        fetch('/envoyer/?last=1')
            .then(response => {
                const status = response.ok ? 'Capteurs connectés' : 'Problème connexion';
                const type = response.ok ? 'info' : 'warning';
                this.showSystemStatus(status, type);
            })
            .catch(() => {
                this.showSystemStatus('Capteurs déconnectés', 'danger');
            });
    }

    showSystemStatus(message, type) {
        const alertsContainer = document.getElementById('alerts-content');
        if (alertsContainer) {
            const existingAlert = alertsContainer.querySelector('.alert-item.info');
            if (existingAlert) {
                existingAlert.querySelector('span').textContent = message;
                existingAlert.className = `alert-item ${type}`;
            }
        }
    }

    showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alerts-content');
        if (!alertsContainer) return;

        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${type}`;
        alertElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <small>${new Date().toLocaleTimeString('fr-FR')}</small>
        `;
        
        alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
        
        setTimeout(() => alertElement.remove(), 10000);
    }
}

// Styles
const styles = `
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

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.agriSmart = new AgriSmartIndex();
}); 