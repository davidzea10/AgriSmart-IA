// ===== HISTORIQUE AGRISMART =====

let currentPage = 1;
let totalPages = 5;
let filteredData = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Page Historique AgriSmart chargée');
    initializeHistorique();
});

function initializeHistorique() {
    // Initialiser la pagination
    updatePaginationButtons();
    
    // Charger les données initiales
    loadHistoriqueData();
    
    // Initialiser les écouteurs d'événements
    setupEventListeners();
}

function setupEventListeners() {
    // Fermer le modal en cliquant en dehors
    window.onclick = function(event) {
        const modal = document.getElementById('export-modal');
        if (event.target === modal) {
            closeExportModal();
        }
    }
    
    // Touches du clavier pour le modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeExportModal();
        }
    });
}

// ===== GESTION DES FILTRES =====
function applyFilters() {
    const periode = document.getElementById('periode-filter').value;
    const type = document.getElementById('type-filter').value;
    
    showLoading();
    
    // Simuler un appel API
    setTimeout(() => {
        console.log('🔍 Application des filtres:', { periode, type });
        
        // Ici vous ajouteriez la logique pour filtrer les données
        filterTableData(periode, type);
        
        hideLoading();
        showNotification('Filtres appliqués avec succès', 'success');
    }, 1000);
}

function filterTableData(periode, type) {
    const tableBody = document.getElementById('table-body');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.forEach(row => {
        let shouldShow = true;
        
        // Filtrage par type de données
        if (type !== 'all') {
            // Logique de filtrage par type
            // Vous pouvez ajouter une logique plus complexe ici
        }
        
        // Filtrage par période
        if (periode !== 'all') {
            const dateCell = row.querySelector('td:first-child');
            if (dateCell) {
                const rowDate = new Date(dateCell.textContent.split('/').reverse().join('-'));
                const today = new Date();
                
                switch(periode) {
                    case 'today':
                        shouldShow = rowDate.toDateString() === today.toDateString();
                        break;
                    case 'yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        shouldShow = rowDate.toDateString() === yesterday.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        shouldShow = rowDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        shouldShow = rowDate >= monthAgo;
                        break;
                }
            }
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
    
    updatePagination();
}

// ===== GESTION DE LA PAGINATION =====
function changePage(direction) {
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updatePaginationButtons();
        loadPageData(currentPage);
    }
}

function updatePaginationButtons() {
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function updatePagination() {
    const tableBody = document.getElementById('table-body');
    const visibleRows = Array.from(tableBody.querySelectorAll('tr:not([style*="display: none"])'));
    
    const rowsPerPage = 10;
    totalPages = Math.ceil(visibleRows.length / rowsPerPage);
    
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
    
    updatePaginationButtons();
}

function loadPageData(page) {
    showLoading();
    
    // Simuler le chargement de nouvelles données
    setTimeout(() => {
        console.log('📄 Chargement page:', page);
        hideLoading();
    }, 500);
}

// ===== GESTION DE L'EXPORT =====
function showExportModal() {
    document.getElementById('export-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeExportModal() {
    document.getElementById('export-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function exportData(format) {
    showLoading();
    closeExportModal();
    
    // Utiliser l'URL Django pour l'export
    const exportUrl = `/export/?format=${format}`;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = `historique_agrismart.${format === 'excel' ? 'xls' : 'csv'}`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        hideLoading();
        showNotification(`Export ${format.toUpperCase()} lancé !`, 'success');
    }, 1000);
}

function collectTableData() {
    const table = document.getElementById('historique-table');
    const headers = [];
    const rows = [];
    
    // Collecter les en-têtes
    table.querySelectorAll('thead th').forEach(th => {
        const text = th.textContent.trim();
        headers.push(text);
    });
    
    // Collecter les données des lignes visibles
    table.querySelectorAll('tbody tr:not([style*="display: none"])').forEach(tr => {
        const row = [];
        const cells = tr.querySelectorAll('td');
        
        for (let i = 0; i < cells.length; i++) { // Toutes les colonnes
            let cellText = cells[i].textContent.trim();
            
            // Nettoyer le texte des badges
            if (cells[i].querySelector('.air-quality-badge')) {
                cellText = cells[i].querySelector('.air-quality-badge').textContent.trim();
            }
            
            row.push(cellText);
        }
        
        rows.push(row);
    });
    
    return { headers, rows };
}

function exportToCSV(data) {
    let csv = data.headers.join(',') + '\n';
    
    data.rows.forEach(row => {
        // Échapper les virgules et guillemets dans les données
        const escapedRow = row.map(cell => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return '"' + cell.replace(/"/g, '""') + '"';
            }
            return cell;
        });
        csv += escapedRow.join(',') + '\n';
    });
    
    downloadFile(csv, 'historique_agrismart.csv', 'text/csv');
}

function exportToExcel(data) {
    // Créer un tableau HTML pour Excel
    let html = '<table border="1">';
    
    // En-têtes
    html += '<thead><tr>';
    data.headers.forEach(header => {
        html += `<th style="background-color: #2ecc71; color: white; font-weight: bold;">${header}</th>`;
    });
    html += '</tr></thead>';
    
    // Données
    html += '<tbody>';
    data.rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    
    downloadFile(html, 'historique_agrismart.xls', 'application/vnd.ms-excel');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
}

// ===== ACTIONS SUR LES MESURES =====
function viewDetails(mesureId) {
    console.log('👁️ Voir détails mesure:', mesureId);
    showNotification('Détails de la mesure #' + mesureId, 'info');
    
    // Ici vous pourriez ouvrir un modal avec les détails
}

function deleteMeasure(mesureId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
        showLoading();
        
        // Simuler la suppression
        setTimeout(() => {
            const row = document.querySelector(`tr[data-id="${mesureId}"]`);
            if (row) {
                row.remove();
                updatePagination();
            }
            
            hideLoading();
            showNotification('Mesure supprimée avec succès', 'success');
        }, 1000);
    }
}

// ===== UTILITAIRES =====
function loadHistoriqueData() {
    // Charger les données initiales si nécessaire
    console.log('📊 Chargement des données historiques');
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Créer une notification toast
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Styles de la notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '1002',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Ajouter les animations CSS pour les notifications
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 