// Variables globales
let tempChart, humChart, airChart;
let lastMeasurements = [];
let previousData = null;
let historicalData = [];

// Configuration des graphiques
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#E0E0E0'
                },
                ticks: {
                    color: '#757575'
                }
            },
            y: {
                grid: {
                    color: '#E0E0E0'
                },
                ticks: {
                    color: '#757575'
                }
            }
        }
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    initializeCharts();
    loadInitialData();
    updateDashboard();
    
    // Actualisation toutes les 5 secondes
    setInterval(updateDashboard, 5000);
    
    // Actualisation des graphiques toutes les 30 secondes
    setInterval(loadHistoricalData, 30000);
});

// Initialisation des graphiques
function initializeCharts() {
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    const humCtx = document.getElementById('humChart').getContext('2d');
    const airCtx = document.getElementById('airChart').getContext('2d');
    
    tempChart = new Chart(tempCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Température',
                data: [],
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        }
    });
    
    humChart = new Chart(humCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Humidité',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        }
    });
    
    airChart = new Chart(airCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Qualité Air',
                data: [],
                borderColor: '#66BB6A',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        }
    });
    
    console.log('Charts initialized');
}

// Chargement des données initiales
async function loadInitialData() {
    try {
        console.log('Loading initial data...');
        const response = await fetch('/envoyer/?last=1');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data && data.length > 0) {
            updateMetrics(data[0]);
            loadHistoricalData();
        } else {
            console.log('No data received, using fallback');
            // Fallback avec données simulées
            historicalData = generateHistoricalData();
            updateCharts(historicalData);
            updateTable(historicalData);
            updateAlerts(historicalData);
            calculateAverages(historicalData);
        }
    } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        // Fallback en cas d'erreur
        historicalData = generateHistoricalData();
        updateCharts(historicalData);
        updateTable(historicalData);
        updateAlerts(historicalData);
        calculateAverages(historicalData);
    }
}

// Mise à jour du dashboard
async function updateDashboard() {
    try {
        const response = await fetch('/envoyer/?last=1');
        const data = await response.json();
        
        if (data && data.length > 0) {
            const currentData = data[0];
            updateMetrics(currentData);
            
            // Calcul des changements
            if (previousData) {
                updateChanges(currentData, previousData);
            }
            
            previousData = currentData;
            
            // Ajouter aux données historiques
            if (historicalData.length === 0) {
                historicalData = generateHistoricalData();
            }
            
            calculateAverages(historicalData);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
    }
}

// Mise à jour des métriques
function updateMetrics(data) {
    console.log('Updating metrics with:', data);
    
    // Température
    const tempElement = document.getElementById('temp-current');
    if (tempElement && data.temperature !== undefined) {
        tempElement.textContent = `${parseFloat(data.temperature).toFixed(1)}°C`;
    }
    
    // Humidité
    const humElement = document.getElementById('hum-current');
    if (humElement && data.humidite !== undefined) {
        humElement.textContent = `${parseFloat(data.humidite).toFixed(1)}%`;
    }
    
    // Qualité de l'air
    const airElement = document.getElementById('air-current');
    const airIndexElement = document.getElementById('air-index');
    if (airElement && data.niveau_air) {
        airElement.textContent = data.niveau_air;
    }
    if (airIndexElement && data.qualite_air !== undefined) {
        airIndexElement.textContent = data.qualite_air;
    }
}

// Calcul et affichage des changements
function updateChanges(current, previous) {
    // Température
    const tempChange = parseFloat(current.temperature) - parseFloat(previous.temperature);
    const tempChangeElement = document.getElementById('temp-change');
    if (tempChangeElement) {
        const changeText = tempChange > 0 ? `+${tempChange.toFixed(1)}°C` : `${tempChange.toFixed(1)}°C`;
        tempChangeElement.textContent = changeText;
        tempChangeElement.className = `metric-change ${tempChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Humidité
    const humChange = parseFloat(current.humidite) - parseFloat(previous.humidite);
    const humChangeElement = document.getElementById('hum-change');
    if (humChangeElement) {
        const changeText = humChange > 0 ? `+${humChange.toFixed(1)}%` : `${humChange.toFixed(1)}%`;
        humChangeElement.textContent = changeText;
        humChangeElement.className = `metric-change ${humChange >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Qualité de l'air
    const airChange = parseInt(current.qualite_air) - parseInt(previous.qualite_air);
    const airChangeElement = document.getElementById('air-change');
    if (airChangeElement) {
        const changeText = airChange > 0 ? `+${airChange}` : `${airChange}`;
        airChangeElement.textContent = changeText;
        airChangeElement.className = `metric-change ${airChange >= 0 ? 'positive' : 'negative'}`;
    }
}

// Chargement des données historiques pour les graphiques
async function loadHistoricalData() {
    try {
        // Pour l'instant, utiliser des données simulées
        // Plus tard, remplacer par un vrai endpoint pour les données historiques
        historicalData = generateHistoricalData();
        updateCharts(historicalData);
        updateTable(historicalData);
        updateAlerts(historicalData);
        calculateAverages(historicalData);
    } catch (error) {
        console.error('Erreur lors du chargement historique:', error);
    }
}

// Mise à jour des graphiques
function updateCharts(data = null) {
    if (!data) {
        data = generateHistoricalData();
    }
    
    const labels = data.map(item => {
        const date = new Date(item.date_recue);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    });
    
    const tempData = data.map(item => item.temperature);
    const humData = data.map(item => item.humidite);
    const airData = data.map(item => item.qualite_air);
    
    // Mise à jour du graphique température
    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = tempData;
    tempChart.update('none');
    
    // Mise à jour du graphique humidité
    humChart.data.labels = labels;
    humChart.data.datasets[0].data = humData;
    humChart.update('none');
    
    // Mise à jour du graphique qualité air
    airChart.data.labels = labels;
    airChart.data.datasets[0].data = airData;
    airChart.update('none');
    
    console.log('Charts updated with', data.length, 'data points');
}

// Mise à jour du tableau des mesures
function updateTable(data) {
    const tableBody = document.getElementById('measurements-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.slice(0, 10).reverse().forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.date_recue);
        const timeString = date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        row.innerHTML = `
            <td>${timeString}</td>
            <td>${item.temperature.toFixed(1)}°C</td>
            <td>${item.humidite.toFixed(1)}%</td>
            <td>${item.qualite_air}</td>
            <td>${item.niveau_air}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mise à jour des alertes
function updateAlerts(data) {
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) return;
    
    const alerts = generateAlerts(data);
    
    alertsContainer.innerHTML = '';
    
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
            <div class="alert-time">${alert.time}</div>
        `;
        
        alertsContainer.appendChild(alertElement);
    });
}

// Génération de données historiques simulées
function generateHistoricalData() {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5 minutes d'intervalle
        
        const temp = 22 + Math.sin(i * 0.3) * 4 + Math.random() * 2;
        const hum = 65 + Math.cos(i * 0.2) * 15 + Math.random() * 5;
        const air = Math.floor(60 + Math.sin(i * 0.4) * 20 + Math.random() * 10);
        
        let niveau_air;
        if (air >= 80) niveau_air = "Excellent";
        else if (air >= 60) niveau_air = "Bon";
        else if (air >= 40) niveau_air = "Moyen";
        else niveau_air = "Mauvais";
        
        data.push({
            temperature: parseFloat(temp.toFixed(1)),
            humidite: parseFloat(hum.toFixed(1)),
            qualite_air: air,
            niveau_air: niveau_air,
            date_recue: time.toISOString()
        });
    }
    
    return data;
}

// Génération d'alertes simulées
function generateAlerts(data) {
    const alerts = [];
    const now = new Date();
    
    if (!data || data.length === 0) return alerts;
    
    // Alerte température
    const lastTemp = data[data.length - 1].temperature;
    if (lastTemp > 28) {
        alerts.push({
            type: 'warning',
            icon: 'fa-temperature-high',
            title: 'Température élevée',
            message: `La température a atteint ${lastTemp.toFixed(1)}°C. Vérifiez l'irrigation.`,
            time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    }
    
    // Alerte humidité
    const lastHum = data[data.length - 1].humidite;
    if (lastHum < 40) {
        alerts.push({
            type: 'danger',
            icon: 'fa-droplet-slash',
            title: 'Humidité faible',
            message: `L'humidité est descendue à ${lastHum.toFixed(1)}%. Risque de stress hydrique.`,
            time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    }
    
    // Alerte qualité air
    const lastAir = data[data.length - 1].qualite_air;
    if (lastAir < 30) {
        alerts.push({
            type: 'danger',
            icon: 'fa-wind',
            title: 'Qualité de l\'air dégradée',
            message: `L'indice de qualité de l'air est à ${lastAir}. Vérifiez la ventilation.`,
            time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    }
    
    // Alerte info si tout va bien
    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            icon: 'fa-check-circle',
            title: 'Conditions optimales',
            message: 'Tous les paramètres sont dans les normes optimales pour l\'agriculture.',
            time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
    }
    
    return alerts;
}

// Calcul des moyennes 24h
function calculateAverages(data) {
    if (!data || data.length === 0) return;
    
    const tempAvg = data.reduce((sum, item) => sum + item.temperature, 0) / data.length;
    const humAvg = data.reduce((sum, item) => sum + item.humidite, 0) / data.length;
    
    const tempAvgElement = document.getElementById('temp-avg');
    const humAvgElement = document.getElementById('hum-avg');
    
    if (tempAvgElement) {
        tempAvgElement.textContent = `${tempAvg.toFixed(1)}°C`;
    }
    if (humAvgElement) {
        humAvgElement.textContent = `${humAvg.toFixed(1)}%`;
    }
} 