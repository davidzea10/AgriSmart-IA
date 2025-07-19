// ===== PRÉDICTIONS IA AGRISMART - VERSION SIMPLIFIÉE =====

class PredictionsManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧠 Prédictions IA initialisées');
        this.loadCurrentConditions();
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
            `;
            document.body.appendChild(container);
            }
    }

    async loadCurrentConditions() {
        try {
            const response = await fetch('/envoyer/?last=1');
            const data = await response.json();

            if (data && data.length > 0) {
                const current = data[0];
                this.updateElement('current-temp', `${current.temperature}°C`);
                this.updateElement('current-humidity', `${current.humidite}%`);
                this.updateElement('current-soil', `${current.humidite_sol}%`);
                this.updateElement('current-air', current.niveau_air);
                console.log('✅ Conditions chargées');
            }
        } catch (error) {
            console.error('❌ Erreur conditions:', error);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

        async startAirPrediction() {
        console.log('🔮 Début prédiction AIR');
        
        try {
            this.showLoading();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const response = await fetch('/api/predictions/');
            console.log('📡 Réponse AIR reçue, status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Données API AIR:', data);
            
            this.hideLoading();
            
            if (data.status === 'success' && data.air) {
                console.log('✅ Prédiction air:', data.air.prediction);
                this.displayAirResults(data.air);
                this.showNotification('Prédiction Air générée !', 'success');
            } else {
                throw new Error(data.error || 'Réponse API invalide');
            }

        } catch (error) {
            console.error('❌ Erreur prédiction air:', error);
            this.hideLoading();
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

    async startSoilPrediction() {
        console.log('🔮 Début prédiction SOL');
        
        try {
            this.showLoading();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const response = await fetch('/api/predictions/soil/');
            console.log('📡 Réponse SOL reçue, status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Données API SOL:', data);
            
            this.hideLoading();
            
            if (data.status === 'success' && data.soil) {
                console.log('✅ Prédiction sol:', data.soil.prediction);
                this.displaySoilResults(data.soil);
                this.showNotification('Prédiction Sol générée !', 'success');
            } else {
                throw new Error(data.error || 'Réponse API invalide');
            }
            
        } catch (error) {
            console.error('❌ Erreur prédiction sol:', error);
            this.hideLoading();
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }

        displayAirResults(airData) {
        console.log('🎯 Affichage résultat AIR:', airData.prediction);
        
        const elements = {
            section: document.getElementById('air-results'),
            icon: document.getElementById('prediction-icon'),
            result: document.getElementById('prediction-result'),
            confidence: document.getElementById('prediction-confidence')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`❌ Élément AIR manquant: ${key}`);
                this.showNotification('Erreur d\'affichage Air', 'error');
                return;
            }
        }

        const configs = {
            'bon': { icon: 'fas fa-check-circle', class: 'bon' },
            'moyen': { icon: 'fas fa-exclamation-circle', class: 'moyen' },
            'mauvais': { icon: 'fas fa-times-circle', class: 'mauvais' }
        };

        const prediction = String(airData.prediction || 'moyen').toLowerCase();
        const config = configs[prediction] || configs['moyen'];

        try {
            elements.icon.innerHTML = `<i class="${config.icon}"></i>`;
            elements.icon.className = `prediction-icon ${config.class}`;
            elements.result.textContent = prediction.charAt(0).toUpperCase() + prediction.slice(1);
            elements.result.className = `prediction-value ${config.class}`;
            elements.confidence.textContent = '85%';
            
            elements.section.style.display = 'block';
            elements.section.scrollIntoView({ behavior: 'smooth' });
            
            this.generateAlerts(prediction, 'air');
            this.generateRecommendations(airData, 'air');
            
            console.log('✅ Affichage AIR terminé');
            
        } catch (error) {
            console.error('❌ Erreur affichage air:', error);
            this.showNotification('Erreur d\'affichage des résultats air', 'error');
        }
    }

    displaySoilResults(soilData) {
        console.log('🎯 Affichage résultat SOL:', soilData.prediction);
        
        const elements = {
            section: document.getElementById('soil-results'),
            icon: document.getElementById('soil-icon'),
            result: document.getElementById('soil-result'),
            confidence: document.getElementById('soil-confidence')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`❌ Élément SOL manquant: ${key}`);
                this.showNotification('Erreur d\'affichage Sol', 'error');
                return;
            }
        }

        const configs = {
            'tres_sec': { icon: 'fas fa-exclamation-triangle', class: 'mauvais' },
            'assez_sec': { icon: 'fas fa-exclamation-circle', class: 'moyen' },
            'humide': { icon: 'fas fa-check-circle', class: 'bon' },
            'tres_humide': { icon: 'fas fa-tint', class: 'info' }
        };

        const prediction = String(soilData.prediction || 'humide').toLowerCase();
        const config = configs[prediction] || configs['humide'];

        try {
            elements.icon.innerHTML = `<i class="${config.icon}"></i>`;
            elements.icon.className = `prediction-icon ${config.class}`;
            
            // Formater le texte selon le niveau sol
            const predictionText = prediction.replace('_', ' ').charAt(0).toUpperCase() + prediction.replace('_', ' ').slice(1);
            elements.result.textContent = predictionText;
            elements.result.className = `prediction-value ${config.class}`;
            elements.confidence.textContent = '85%';
            
            elements.section.style.display = 'block';
            elements.section.scrollIntoView({ behavior: 'smooth' });
            
            this.generateAlerts(prediction, 'soil');
            this.generateRecommendations(soilData, 'soil');
            
            console.log('✅ Affichage SOL terminé');
            
        } catch (error) {
            console.error('❌ Erreur affichage sol:', error);
            this.showNotification('Erreur d\'affichage des résultats sol', 'error');
        }
    }

        generateAlerts(prediction, type) {
        const container = document.getElementById('predictive-alerts');
        if (!container) return;

        if (type === 'air') {
            container.innerHTML = '';
        }
        
        let alerts = [];
        
        if (type === 'air') {
            const airAlerts = {
                'bon': [{ type: 'success', icon: 'fas fa-check-circle', message: 'Excellentes conditions air - Aucun traitement nécessaire' }],
                'moyen': [{ type: 'warning', icon: 'fas fa-shield-alt', message: 'Qualité air modérée - Surveillance préventive recommandée' }],
                'mauvais': [{ type: 'danger', icon: 'fas fa-exclamation-triangle', message: 'Qualité air dégradée - Traitement curatif urgent requis' }]
            };
            alerts = airAlerts[prediction] || airAlerts['moyen'];
        } else if (type === 'soil') {
            const soilAlerts = {
                'tres_sec': [{ type: 'danger', icon: 'fas fa-exclamation-triangle', message: 'Sol très sec - Irrigation urgente nécessaire' }],
                'assez_sec': [{ type: 'warning', icon: 'fas fa-tint', message: 'Sol assez sec - Planifier irrigation sous 24h' }],
                'humide': [{ type: 'success', icon: 'fas fa-check-circle', message: 'Humidité sol optimale - Conditions idéales' }],
                'tres_humide': [{ type: 'info', icon: 'fas fa-info-circle', message: 'Sol très humide - Surveiller drainage' }]
            };
            alerts = soilAlerts[prediction] || soilAlerts['humide'];
        }
        
        alerts.forEach(alert => {
            const div = document.createElement('div');
            div.className = `alert-item ${alert.type}`;
            div.innerHTML = `<i class="${alert.icon}"></i><span>${alert.message}</span>`;
            container.appendChild(div);
        });
    }

    generateRecommendations(data, type) {
        const container = document.getElementById('treatment-recommendations');
        if (!container) return;

        if (type === 'air') {
            container.innerHTML = '';
        }

        // Recommandation de l'IA si disponible
        if (data.recommendation) {
            const div = document.createElement('div');
            div.className = 'recommendation-item';
            div.innerHTML = `
                <i class="fas fa-brain"></i>
                <div class="recommendation-content">
                    <div class="recommendation-title">Recommandation IA ${type === 'air' ? 'Air' : 'Sol'}</div>
                    <div class="recommendation-text">${data.recommendation}</div>
                </div>
            `;
            container.appendChild(div);
        }
    }

    showLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Animation de la barre de progression
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
            let progress = 0;
                const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
            progressFill.style.width = `${progress}%`;
        }, 200);

                // Nettoyer après 3 secondes
                setTimeout(() => {
                    clearInterval(interval);
                    if (progressFill) progressFill.style.width = '100%';
                }, 2000);
            }
        }
    }

    hideLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
        setTimeout(() => {
                modal.style.display = 'none';
                const progressFill = document.getElementById('progress-fill');
                if (progressFill) progressFill.style.width = '0%';
        }, 500);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white; padding: 1rem; border-radius: 8px; margin-bottom: 10px;
            display: flex; align-items: center; gap: 10px; font-weight: 500;
        `;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
        container.appendChild(notification);

        // Supprimer après 4 secondes
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
        }, 4000);
    }
}

// ===== FONCTIONS GLOBALES =====
let predictionsManager;

function startAirPrediction() {
    if (predictionsManager) {
        predictionsManager.startAirPrediction();
    } else {
        console.error('Manager non initialisé');
    }
}

function startSoilPrediction() {
    if (predictionsManager) {
        predictionsManager.startSoilPrediction();
    } else {
        console.error('Manager non initialisé');
    }
}

function clearPredictionHistory() {
    console.log('Effacement historique (à implémenter)');
} 

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 NOUVEAU FICHIER JS CHARGÉ - VERSION SIMPLIFIÉE');
    console.log('📏 Taille du code JS:', document.currentScript?.src || 'Script inline');
    predictionsManager = new PredictionsManager();
    console.log('🚀 Système initialisé - VERSION COURTE');
}); 