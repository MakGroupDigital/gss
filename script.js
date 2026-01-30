// ========== CUSTOM CURSOR ==========
const cursor = document.querySelector('.custom-cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

// Cursor hover effects
document.querySelectorAll('a, button, .service-card, .case-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2)';
        cursorFollower.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });
});

// ========== PARTICLES ANIMATION ==========
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 50;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = Math.random() > 0.5 ? '#FFC107' : '#4A90E2';
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ========== COUNTER ANIMATION ==========
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// ========== INTERSECTION OBSERVER ==========
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats')) {
                animateCounters();
                observer.unobserve(entry.target);
            }
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats');
    if (statsSection) observer.observe(statsSection);
    
    document.querySelectorAll('.service-card, .case-card, .sector-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
});

// ========== QUIZ FUNCTIONALITY ==========
let quizAnswers = {};
let currentStep = 1;

function openQuiz() {
    document.getElementById('quiz-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeQuiz() {
    document.getElementById('quiz-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetQuiz();
}

function resetQuiz() {
    quizAnswers = {};
    currentStep = 1;
    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
    document.querySelector('[data-step="1"]').classList.add('active');
    document.getElementById('quiz-result').style.display = 'none';
}

document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', function() {
        const step = this.closest('.quiz-step').dataset.step;
        const value = this.dataset.value;
        
        quizAnswers[`step${step}`] = value;
        
        // Animation
        this.style.background = 'var(--jaune)';
        this.style.color = 'var(--bleu-nuit)';
        
        setTimeout(() => {
            if (currentStep < 3) {
                document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
                currentStep++;
                document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
            } else {
                showQuizResult();
            }
        }, 300);
    });
});

function showQuizResult() {
    document.querySelector(`[data-step="3"]`).classList.remove('active');
    const resultDiv = document.getElementById('quiz-result');
    const resultContent = document.getElementById('result-content');
    
    // Generate personalized recommendation
    let recommendation = generateRecommendation(quizAnswers);
    resultContent.innerHTML = recommendation;
    
    resultDiv.style.display = 'block';
}

function generateRecommendation(answers) {
    const recommendations = {
        agro: {
            title: 'Solutions Agro-Industrielles',
            services: [
                'Optimisation de la chaîne de production',
                'Gestion de la supply chain agricole',
                'Transformation et conditionnement',
                'Distribution et export'
            ]
        },
        tech: {
            title: 'Transformation Digitale',
            services: [
                'Développement d\'applications métiers',
                'Intégration ERP/CRM',
                'Cybersécurité et protection des données',
                'Infrastructure cloud'
            ]
        },
        commerce: {
            title: 'Solutions E-Commerce',
            services: [
                'Plateforme e-commerce sur mesure',
                'Gestion des flux B2B/B2C',
                'Marketing digital et SEO',
                'Logistique et fulfillment'
            ]
        },
        logistique: {
            title: 'Optimisation Logistique',
            services: [
                'Gestion de la supply chain',
                'Import-export et dédouanement',
                'Tracking en temps réel',
                'Optimisation des coûts'
            ]
        }
    };
    
    const sector = recommendations[answers.step1] || recommendations.tech;
    
    return `
        <h4>${sector.title}</h4>
        <p>Basé sur votre profil, nous recommandons :</p>
        <ul>
            ${sector.services.map(service => `<li>${service}</li>`).join('')}
        </ul>
        <div class="roi-highlight">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>Économies estimées : 25-40% sur vos coûts opérationnels</span>
        </div>
    `;
}

// ========== ROI CALCULATOR ==========
const revenueInput = document.getElementById('revenue');
const costsInput = document.getElementById('costs');
const growthInput = document.getElementById('growth');

function calculateROI() {
    const revenue = parseFloat(revenueInput.value) || 0;
    const costs = parseFloat(costsInput.value) / 100;
    const growth = parseFloat(growthInput.value) / 100;
    
    // Calculations
    const currentCosts = revenue * costs;
    const savings = currentCosts * 0.25; // 25% reduction
    const potentialGrowth = revenue * growth;
    const totalROI = savings + (potentialGrowth * 0.3); // 30% of growth potential
    
    // Update display
    document.getElementById('savings').innerHTML = formatCurrency(savings);
    document.getElementById('potential').innerHTML = formatCurrency(potentialGrowth);
    document.getElementById('total-roi').innerHTML = formatCurrency(totalROI);
    
    // Update range displays
    document.getElementById('costs-value').textContent = Math.round(costsInput.value) + '%';
    document.getElementById('growth-value').textContent = Math.round(growthInput.value) + '%';
}

function formatCurrency(value) {
    const usd = value;
    const cny = value * 7.2; // 1 USD ≈ 7.2 CNY
    const eur = value * 0.92; // 1 USD ≈ 0.92 EUR
    
    return `$${new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
    }).format(usd)} <span style="font-size: 0.85em; opacity: 0.8;">(¥${new Intl.NumberFormat('zh-CN', {
        maximumFractionDigits: 0
    }).format(cny)} / €${new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0
    }).format(eur)})</span>`;
}

if (revenueInput) {
    revenueInput.addEventListener('input', calculateROI);
    costsInput.addEventListener('input', calculateROI);
    growthInput.addEventListener('input', calculateROI);
    
    // Initial calculation
    calculateROI();
}

// ========== CASE STUDIES ==========
function showCaseDetails(caseId) {
    const caseDetails = {
        1: {
            title: 'Coopérative Agricole - Transformation Complète',
            challenge: 'Une coopérative de 200 producteurs cherchait à augmenter sa capacité de transformation et à accéder aux marchés internationaux.',
            solution: 'Mise en place d\'une unité de transformation moderne, optimisation de la supply chain, et développement d\'une plateforme B2B pour l\'export.',
            results: [
                'Production multipliée par 2.5 en 18 mois',
                '45 nouveaux emplois créés',
                'Export vers 8 nouveaux pays',
                'Revenus des producteurs +60%'
            ]
        },
        2: {
            title: 'Distributeur - Transformation Digitale',
            challenge: 'Un distributeur traditionnel avec 15 magasins physiques voulait développer sa présence en ligne sans cannibaliser ses ventes physiques.',
            solution: 'Création d\'une plateforme omnicanale, intégration des stocks en temps réel, et stratégie marketing digital ciblée.',
            results: [
                '5M€ de CA digital en 12 mois',
                '15 000 nouveaux clients',
                'Taux de conversion de 3.2%',
                'Ventes physiques +12% (effet halo)'
            ]
        },
        3: {
            title: 'Industriel - Optimisation Logistique',
            challenge: 'Une entreprise industrielle avec des opérations dans 8 pays souffrait de coûts logistiques élevés et de délais imprévisibles.',
            solution: 'Refonte complète de la supply chain, mise en place d\'un système de tracking en temps réel, et négociation de nouveaux contrats de transport.',
            results: [
                'Réduction des coûts de 40%',
                'Délais de livraison -35%',
                'Taux de fiabilité 99.8%',
                'ROI atteint en 8 mois'
            ]
        }
    };
    
    const caseData = caseDetails[caseId];
    
    alert(`ÉTUDE DE CAS\n\n${caseData.title}\n\nDÉFI:\n${caseData.challenge}\n\nSOLUTION:\n${caseData.solution}\n\nRÉSULTATS:\n${caseData.results.join('\n')}\n\nContactez-nous pour en savoir plus !`);
}

// ========== CHATBOT ==========
let chatMinimized = false;

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    chatMinimized = !chatMinimized;
    
    if (chatMinimized) {
        chatbot.classList.add('minimized');
    } else {
        chatbot.classList.remove('minimized');
    }
}

function sendQuickReply(message) {
    const messagesDiv = document.getElementById('chat-messages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.style.cssText = 'background: var(--bleu-clair); color: white; padding: 1rem; border-radius: 15px; margin-bottom: 1rem; text-align: right;';
    userMsg.textContent = message;
    messagesDiv.appendChild(userMsg);
    
    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'bot-message';
        
        const botAvatar = document.createElement('div');
        botAvatar.className = 'bot-avatar';
        botAvatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>`;
        
        const msgContent = document.createElement('div');
        msgContent.className = 'message-content';
        
        if (message.includes('devis')) {
            msgContent.innerHTML = 'Excellent ! Pour vous préparer un devis personnalisé, je vous invite à remplir notre <a href="#contact" onclick="toggleChat()" style="color: var(--bleu-clair); font-weight: 600;">formulaire de contact</a>. Notre équipe vous répondra sous 24h.';
        } else if (message.includes('RDV')) {
            msgContent.innerHTML = 'Parfait ! Vous pouvez prendre rendez-vous directement via notre <a href="#contact" onclick="toggleChat()" style="color: var(--bleu-clair); font-weight: 600;">formulaire de contact</a> ou nous appeler au +XXX XX XX XX XX.';
        } else {
            msgContent.innerHTML = 'Nous proposons 7 pôles d\'expertise : Services & Sous-traitance, Commerce & e-Commerce, Logistique, Import-Export, Technologies, Agro-Industrie, et Formation. <a href="#expertises" onclick="toggleChat()" style="color: var(--bleu-clair); font-weight: 600;">Découvrez-les ici</a> !';
        }
        
        botMsg.appendChild(botAvatar);
        botMsg.appendChild(msgContent);
        messagesDiv.appendChild(botMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 1000);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== FORM SUBMISSION ==========
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show success message
        const btn = contactForm.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.innerHTML = '<svg style="display: inline-block; width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Message envoyé !';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            contactForm.reset();
        }, 3000);
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 25, 49, 0.98)';
        navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 25, 49, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// ========== PARALLAX EFFECT ==========
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ========== CLOSE MODAL ON OUTSIDE CLICK ==========
window.addEventListener('click', (e) => {
    const modal = document.getElementById('quiz-modal');
    if (e.target === modal) {
        closeQuiz();
    }
});

// ========== INITIAL ANIMATIONS ==========
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

console.log('Global Solutions Services - Site chargé avec succès');

// ========== SHARE FUNCTIONALITY ==========
function openShareModal() {
    document.getElementById('share-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    document.getElementById('share-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareViaWhatsApp() {
    const url = window.location.href;
    const text = "Découvrez Global Solutions Services Sarl (GSS) - Votre partenaire de croissance en RDC. 7 pôles d'expertise pour transformer votre entreprise !";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

function shareViaEmail() {
    const url = window.location.href;
    const subject = "Découvrez Global Solutions Services Sarl";
    const body = `Bonjour,\n\nJe vous recommande Global Solutions Services Sarl (GSS), un partenaire de confiance pour la croissance des entreprises en RDC.\n\nIls offrent 7 pôles d'expertise :\n- Services & Sous-traitance\n- Commerce & e-Commerce\n- Logistique & Supply Chain\n- Import-Export\n- Technologies & Innovation\n- Agro-Pastoral & Industrie\n- Formation & Consultancy\n\nDécouvrez leur site : ${url}\n\nCordialement`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function copyLink() {
    const url = window.location.href;
    
    // Créer un élément temporaire pour copier
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Afficher le feedback
    const feedback = document.getElementById('copy-feedback');
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

// Fermer le modal de partage en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    const shareModal = document.getElementById('share-modal');
    if (e.target === shareModal) {
        closeShareModal();
    }
});
