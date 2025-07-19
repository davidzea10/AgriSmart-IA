// ===== BARRE DE NAVIGATION AGRISMART =====

document.addEventListener('DOMContentLoaded', function() {
    // Obtenir le chemin actuel
    const currentPath = window.location.pathname;
    
    // Obtenir tous les liens de navigation
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Supprimer la classe active de tous les liens
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Ajouter la classe active au lien correspondant
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Correspondance exacte pour la page d'accueil
        if (currentPath === '/' && linkPath === '/') {
            link.classList.add('active');
        }
        // Correspondance pour les autres pages
        else if (currentPath !== '/' && linkPath !== '/' && currentPath.includes(linkPath.slice(1, -1))) {
            link.classList.add('active');
        }
    });
    
    // Ajouter des effets de survol améliorés
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(4px)';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(0)';
            }
        });
    });
    
    // Animation d'apparition de la sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.opacity = '0';
        sidebar.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            sidebar.style.transition = 'all 0.6s ease';
            sidebar.style.opacity = '1';
            sidebar.style.transform = 'translateX(0)';
        }, 100);
        
        // Animation échelonnée des éléments de menu
        navLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateX(-10px)';
            
            setTimeout(() => {
                link.style.transition = 'all 0.4s ease';
                link.style.opacity = '1';
                link.style.transform = 'translateX(0)';
            }, 200 + (index * 50));
        });
    }
});

// ===== RESPONSIVE MOBILE TOGGLE =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Fermer la sidebar en cliquant en dehors (mobile)
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        
        if (!isClickInsideSidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }
});

// Debug pour vérifier le chargement
console.log('🌱 Barre de navigation AgriSmart chargée');
