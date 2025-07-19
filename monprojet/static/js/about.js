// ===== PAGE À PROPOS AGRISMART - INTERACTIONS =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 Page À propos AgriSmart chargée');
    initializeAboutPage();
});

function initializeAboutPage() {
    initializeFAQ();
    initializeScrollAnimations();
    initializeStatCounters();
    initializeInteractiveElements();
}

// ===== FAQ INTERACTIVE =====
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer les autres FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle la FAQ actuelle
            item.classList.toggle('active');
            
            // Animation smooth
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });
}

// ===== ANIMATIONS AU SCROLL =====
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animation spéciale pour les cartes de fonctionnalités
                if (entry.target.classList.contains('feature-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, delay);
                }
                
                // Animation pour les étapes
                if (entry.target.classList.contains('step-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                    setTimeout(() => {
                        entry.target.classList.add('slide-in');
                    }, delay);
                }
            }
        });
    }, observerOptions);

    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll(`
        .feature-item,
        .step-item,
        .tech-item,
        .prereq-item,
        .faq-item
    `);

    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== COMPTEURS ANIMÉS =====
function initializeStatCounters() {
    const statElements = document.querySelectorAll('.support-option strong');
    
    const animateCounter = (element, finalValue, duration = 2000) => {
        const startValue = 0;
        const increment = finalValue / (duration / 16);
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            if (element.textContent.includes('%')) {
                element.textContent = Math.floor(currentValue) + '%';
            } else if (element.textContent.includes('+')) {
                element.textContent = '+' + Math.floor(currentValue);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }
        }, 16);
    };

    // Observer pour déclencher l'animation au scroll
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                const value = parseInt(text.replace(/[^\d]/g, ''));
                
                if (value && !element.dataset.animated) {
                    element.dataset.animated = 'true';
                    animateCounter(element, value);
                }
            }
        });
    });

    statElements.forEach(el => {
        counterObserver.observe(el);
    });
}

// ===== ÉLÉMENTS INTERACTIFS =====
function initializeInteractiveElements() {
    // Animation au survol des cartes de fonctionnalités
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('.feature-icon').style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.querySelector('.feature-icon').style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Animation au survol des technologies
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('.tech-icon').style.transform = 'scale(1.2)';
            item.querySelector('.tech-icon').style.color = '#2ecc71';
        });
        
        item.addEventListener('mouseleave', () => {
            item.querySelector('.tech-icon').style.transform = 'scale(1)';
            item.querySelector('.tech-icon').style.color = '#3498db';
        });
    });

    // Parallax simple pour la hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }

    // Animation des icônes Font Awesome
    animateIcons();
}

// ===== ANIMATION DES ICÔNES =====
function animateIcons() {
    const icons = document.querySelectorAll('.feature-icon i, .tech-icon');
    
    icons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.animation = 'pulse 2s ease-in-out infinite';
            icon.style.animationDelay = (index * 0.2) + 's';
        }, index * 100);
    });
}

// ===== SMOOTH SCROLL POUR LES ANCRES =====
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== EASTER EGG - CLIC SUR LE LOGO =====
function initializeEasterEgg() {
    const heroIcon = document.querySelector('.hero-icon');
    let clickCount = 0;
    
    if (heroIcon) {
        heroIcon.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount === 5) {
                showEasterEggMessage();
                clickCount = 0;
            }
            
            // Animation du clic
            heroIcon.style.transform = 'scale(0.9)';
            setTimeout(() => {
                heroIcon.style.transform = 'scale(1)';
            }, 150);
        });
    }
}

function showEasterEggMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: bounceIn 0.6s ease;
    `;
    
    message.innerHTML = `
        <h3>🎉 Félicitations !</h3>
        <p>Vous avez découvert l'easter egg d'AgriSmart !<br>
        Merci de votre curiosité 🌱</p>
        <button onclick="this.parentNode.remove()" style="
            background: white;
            color: #2ecc71;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            cursor: pointer;
            font-weight: 600;
        ">Fermer</button>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remove après 5 secondes
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// ===== STYLES CSS DYNAMIQUES =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes bounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease forwards;
        }
        
        .slide-in {
            animation: slideInLeft 0.8s ease forwards;
        }
        
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        .feature-icon, .tech-icon {
            transition: all 0.3s ease;
        }
        
        .hero-icon {
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .hero-icon:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALISATION COMPLÈTE =====
document.addEventListener('DOMContentLoaded', function() {
    addDynamicStyles();
    initializeSmoothScroll();
    initializeEasterEgg();
    
    // Message de bienvenue dans la console
    console.log(`
    🌱 ================================
       Bienvenue sur AgriSmart !
       Développé par Débuze David
       Pour l'agriculture intelligente
    ================================ 🌱
    `);
});

// ===== DÉTECTION DU SUPPORT TOUCH =====
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Ajuster les interactions pour mobile
if (isTouchDevice()) {
    document.body.classList.add('touch-device');
    
    // Remplacer les hover par des tap sur mobile
    const hoverElements = document.querySelectorAll('.feature-item, .tech-item');
    hoverElements.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('touch-hover');
        });
        
        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.classList.remove('touch-hover');
            }, 300);
        });
    });
}

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Page About chargée en ${Math.round(loadTime)}ms`);
});

console.log('🚀 Script About.js initialisé avec succès !'); 