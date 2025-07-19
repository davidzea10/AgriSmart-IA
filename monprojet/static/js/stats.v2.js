// ===== STATISTIQUES AGRISMART V2 =====

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les données JSON injectées par Django
    const mesuresData = JSON.parse(document.getElementById('mesures-data').textContent);
    
    // Initialiser tous les graphiques
    initializeCharts(mesuresData);
});

function initializeCharts(data) {
    // Configuration commune des graphiques
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        animation: {
            duration: 1200
        }
    };

    // 1. Distribution de l'humidité du sol (Graphique en donut)
    const soilDistCtx = document.getElementById('soilDistChart').getContext('2d');
    const soilDistribution = JSON.parse(document.getElementById('soil-distribution').textContent);
    
    new Chart(soilDistCtx, {
        type: 'doughnut',
        data: {
            labels: ['Très Sec', 'Assez Sec', 'Humide', 'Très Humide'],
            datasets: [{
                data: [
                    soilDistribution.tres_sec,
                    soilDistribution.assez_sec,
                    soilDistribution.humide,
                    soilDistribution.tres_humide
                ],
                backgroundColor: [
                    '#e74c3c',  // Rouge pour très sec
                    '#f39c12',  // Orange pour assez sec
                    '#2ecc71',  // Vert pour humide
                    '#3498db'   // Bleu pour très humide
                ]
            }]
        },
        options: {
            ...commonOptions,
            cutout: '70%'
        }
    });

    // 2. Tendances journalières
    const dailyCtx = document.getElementById('dailyTrendsChart').getContext('2d');
    
    // Préparer les données
    const dates = data.map(m => m.date);
    const temperatures = data.map(m => m.temperature);
    const humidites = data.map(m => m.humidite);
    const humiditeSol = data.map(m => m.humidite_sol);
    
    new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Température (°C)',
                    data: temperatures,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Humidité Air (%)',
                    data: humidites,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Humidité Sol (%)',
                    data: humiditeSol,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });

    // 3. Corrélation Température/Humidité (Scatter plot)
    const correlationCtx = document.getElementById('correlationChart').getContext('2d');
    
    // Préparer les données pour le scatter plot
    const scatterData = data.map(m => ({
        x: m.temperature,
        y: m.humidite_sol
    }));
    
    new Chart(correlationCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Corrélation Température/Humidité Sol',
                data: scatterData,
                backgroundColor: 'rgba(52, 152, 219, 0.6)'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Température (°C)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Humidité Sol (%)'
                    }
                }
            }
        }
    });

    // 4. Qualité Air par Période
    const airQualityCtx = document.getElementById('airQualityChart').getContext('2d');
    
    // Calculer la moyenne de qualité d'air par période
    const qualiteAir = data.map(m => m.qualite_air);
    
    new Chart(airQualityCtx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Qualité de l\'air',
                data: qualiteAir,
                backgroundColor: 'rgba(243, 156, 18, 0.6)',
                borderColor: '#f39c12',
                borderWidth: 1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Indice de qualité'
                    }
                }
            }
        }
    });
} 