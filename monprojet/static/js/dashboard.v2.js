// ===== DASHBOARD AGRISMART V2 =====

class DashboardManager {
    constructor() {
        this.charts = {};
        this.lastData = null;
        this.historicalData = [];
        
        this.initializeCharts();
        this.startRealTimeUpdates();
    }

    // Configuration des graphiques
    initializeCharts() {
        const chartConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: '#E0E0E0' },
                        ticks: { color: '#757575' }
                    },
                    y: {
                        grid: { color: '#E0E0E0' },
                        ticks: { color: '#757575' }
                    }
                }
            }
        };

        // Graphique Humidité Sol
        this.charts.soil = new Chart(document.getElementById('soilChart').getContext('2d'), {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidité Sol',
                    data: [],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        // Graphique Température
        this.charts.temp = new Chart(document.getElementById('tempChart').getContext('2d'), {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Température',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        // Graphique Humidité Air
        this.charts.hum = new Chart(document.getElementById('humChart').getContext('2d'), {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidité Air',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        // Graphique Qualité Air
        this.charts.air = new Chart(document.getElementById('airChart').getContext('2d'), {
            ...chartConfig,
            data: {
                labels: [],
                datasets: [{
                    label: 'Qualité Air',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        console.log('✅ Graphiques initialisés');
    }

    // Mise à jour en temps réel
    startRealTimeUpdates() {
        this.updateDashboard();
        
        // Actualisation toutes les 5 secondes
        setInterval(() => this.updateDashboard(), 5000);
    }

    // Mise à jour du dashboard
    async updateDashboard() {
        try {
            const response = await fetch('/envoyer/?last=1');
            const data = await response.json();
            
            if (data && data.length > 0) {
                const latest = data[0];
                console.log('📊 Dernières données reçues:', latest);
                
                // Mise à jour des métriques
                this.updateMetrics(latest);
                
                // Calcul des changements si on a des données précédentes
                if (this.lastData) {
                    this.updateChanges(latest, this.lastData);
                }
                
                // Mise à jour des graphiques
                this.updateCharts(latest);
                
                // Mise à jour du tableau
                this.updateTable(latest);
                
                // Mise à jour des alertes
                this.updateAlerts(latest);
                
                // Sauvegarder les données actuelles
                this.lastData = latest;
                this.addToHistory(latest);
                
            } else {
                console.log('⚠️ Aucune donnée reçue');
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour:', error);
        }
    }

    // Mise à jour des métriques principales
    updateMetrics(data) {
        // Humidité Sol
        document.getElementById('soil-current').textContent = `${data.humidite_sol}%`;
        document.getElementById('soil-level').textContent = data.niveau_sol;
        
        // Température
        document.getElementById('temp-current').textContent = `${data.temperature}°C`;
        
        // Humidité Air
        document.getElementById('hum-current').textContent = `${data.humidite}%`;
        
        // Qualité Air
        document.getElementById('air-current').textContent = data.niveau_air;
        document.getElementById('air-index').textContent = data.qualite_air;
    }

    // Calcul et affichage des changements
    updateChanges(current, previous) {
        // Humidité Sol
        const soilChange = parseFloat(current.humidite_sol) - parseFloat(previous.humidite_sol);
        this.updateChangeElement('soil-change', soilChange, '%');
        
        // Température
        const tempChange = parseFloat(current.temperature) - parseFloat(previous.temperature);
        this.updateChangeElement('temp-change', tempChange, '°C');
        
        // Humidité Air
        const humChange = parseFloat(current.humidite) - parseFloat(previous.humidite);
        this.updateChangeElement('hum-change', humChange, '%');
        
        // Qualité Air
        const airChange = parseInt(current.qualite_air) - parseInt(previous.qualite_air);
        this.updateChangeElement('air-change', airChange, '');
    }

    updateChangeElement(elementId, change, unit) {
        const element = document.getElementById(elementId);
        if (element) {
            const sign = change > 0 ? '+' : '';
            element.textContent = `${sign}${change.toFixed(1)}${unit}`;
            element.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    // Mise à jour des graphiques
    updateCharts(newData) {
        // Ajouter la nouvelle donnée à l'historique
        this.historicalData.push(newData);
        
        // Garder seulement les 30 dernières mesures
        if (this.historicalData.length > 30) {
            this.historicalData.shift();
        }
        
        // Préparer les données pour les graphiques
        const labels = this.historicalData.map(item => {
            const date = new Date(item.date_recue);
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        });
        
        // Mise à jour de chaque graphique
        this.updateChart('soil', labels, this.historicalData.map(item => item.humidite_sol));
        this.updateChart('temp', labels, this.historicalData.map(item => item.temperature));
        this.updateChart('hum', labels, this.historicalData.map(item => item.humidite));
        this.updateChart('air', labels, this.historicalData.map(item => item.qualite_air));
    }

    updateChart(name, labels, data) {
        const chart = this.charts[name];
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update('none');
        }
    }

    // Mise à jour du tableau
    updateTable(newData) {
        const tableBody = document.getElementById('measurements-table');
        if (!tableBody) return;
        
        // Créer une nouvelle ligne
        const row = document.createElement('tr');
        const date = new Date(newData.date_recue);
        
        row.innerHTML = `
            <td>${date.toLocaleTimeString('fr-FR')}</td>
            <td>${newData.humidite_sol}%</td>
            <td>${newData.niveau_sol}</td>
            <td>${newData.temperature}°C</td>
            <td>${newData.humidite}%</td>
            <td>${newData.qualite_air}</td>
            <td>${newData.niveau_air}</td>
        `;
        
        // Ajouter au début du tableau
        if (tableBody.firstChild) {
            tableBody.insertBefore(row, tableBody.firstChild);
        } else {
            tableBody.appendChild(row);
        }
        
        // Garder seulement les 10 dernières lignes
        while (tableBody.children.length > 10) {
            tableBody.removeChild(tableBody.lastChild);
        }
    }

    // Mise à jour des alertes
    updateAlerts(data) {
        const alerts = [];
        
        // Alerte humidité sol
        if (data.humidite_sol < 20) {
            alerts.push({
                type: 'danger',
                icon: 'fa-seedling',
                title: 'Sol très sec',
                message: `Humidité du sol critique: ${data.humidite_sol}% - Irrigation urgente requise`
            });
        } else if (data.humidite_sol < 50) {
            alerts.push({
                type: 'warning',
                icon: 'fa-tint',
                title: 'Sol assez sec',
                message: `Humidité du sol: ${data.humidite_sol}% - Planifier l'irrigation`
            });
        }
        
        // Alerte température
        if (data.temperature > 35) {
            alerts.push({
                type: 'warning',
                icon: 'fa-temperature-high',
                title: 'Température élevée',
                message: `Température: ${data.temperature}°C - Risque de stress thermique`
            });
        }
        
        // Alerte qualité air
        if (data.qualite_air > 3000) {
            alerts.push({
                type: 'danger',
                icon: 'fa-wind',
                title: 'Qualité air dégradée',
                message: `Indice: ${data.qualite_air} - Traitement phytosanitaire recommandé`
            });
        }
        
        this.displayAlerts(alerts);
    }

    displayAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">Conditions optimales</div>
                        <div class="alert-message">Tous les paramètres sont dans les normes</div>
                    </div>
                    <div class="alert-time">${new Date().toLocaleTimeString('fr-FR')}</div>
                </div>
            `;
            return;
        }
        
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.type}`;
            alertElement.innerHTML = `
                <div class="alert-icon">
                    <i class="fas ${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <div class="alert-time">${new Date().toLocaleTimeString('fr-FR')}</div>
            `;
            container.appendChild(alertElement);
        });
    }

    // Gestion de l'historique
    addToHistory(data) {
        this.historicalData.push(data);
        if (this.historicalData.length > 30) {
            this.historicalData.shift();
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
}); 