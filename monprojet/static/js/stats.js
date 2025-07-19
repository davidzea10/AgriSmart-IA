// Exemple d'animation Chart.js pour la page Statistiques
// Les vraies données seront injectées côté Django plus tard

document.addEventListener('DOMContentLoaded', function() {
    const ctxTemp = document.getElementById('chartTemp').getContext('2d');
    const ctxHum = document.getElementById('chartHum').getContext('2d');
    const ctxAir = document.getElementById('chartAir').getContext('2d');

    new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
                label: 'Température (°C)',
                data: [22, 23, 21, 24, 25, 23, 22],
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {animation: {duration: 1200}}
    });

    new Chart(ctxHum, {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
                label: 'Humidité (%)',
                data: [45, 50, 48, 52, 49, 47, 46],
                borderColor: '#43a047',
                backgroundColor: 'rgba(67, 160, 71, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {animation: {duration: 1200}}
    });

    new Chart(ctxAir, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
                label: 'Qualité de l\'air',
                data: [800, 900, 950, 1000, 1100, 1050, 980],
                backgroundColor: '#ffa000',
            }]
        },
        options: {animation: {duration: 1200}}
    });
});
