// Global Variables
let allServices = [];

// ctAlert function
function ctAlert(type, title, text, html, btnText) {
    return new Promise((resolve) => {
        var overlay = document.createElement('div');
        overlay.className = 'ct-alert-overlay';
        overlay.id = 'ctAlertOverlay';
        
        var iconClass = type;
        var icon = type === 'warning' ? '&#9888;' : type === 'error' ? '&#10060;' : type === 'success' ? '&#10004;' : '&#8505;';
        
        var content = '';
        if (html) {
            content = '<div class="ct-alert-text">' + html + '</div>';
        } else if (text) {
            content = '<div class="ct-alert-text">' + text + '</div>';
        }
        
        overlay.innerHTML = '<div class="ct-alert-box">' +
            '<div class="ct-alert-icon ' + iconClass + '">' + icon + '</div>' +
            '<div class="ct-alert-title">' + title + '</div>' +
            content +
            '<button class="ct-alert-btn" id="ctAlertOk">' + (btnText || 'OK') + '</button>' +
            '</div>';
        
        document.body.appendChild(overlay);
        setTimeout(function() { overlay.classList.add('active'); }, 10);
        
        document.getElementById('ctAlertOk').onclick = function() {
            closeCtAlert();
            resolve({ isConfirmed: true });
        };
    });
}

function closeCtAlert() {
    var overlay = document.getElementById('ctAlertOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(function() { overlay.remove(); }, 300);
    }
}

// Load Services from API
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        
        if (response.ok) {
            const data = await response.json();
            allServices = data.services || [];
            displayServices();
        } else {
            throw new Error('Failed to load services');
        }
    } catch (error) {
        console.error('Error loading services:', error);
        displayErrorState();
    }
}

// Display Services
function displayServices() {
    const grid = document.getElementById('servicesGrid');

    if (allServices.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-gem"></i>
                <h3>No Services Available</h3>
                <p>Our premium services are being updated. Please check back soon.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = allServices.map((service, serviceIndex) => {
        const images = service.images || (service.image ? [service.image] : []);
        const hasMultipleImages = images.length > 1;
        
        let imageSection = '';
        if (images.length > 0) {
            if (hasMultipleImages) {
                imageSection = `
                    <div class="image-gallery" data-gallery-id="${serviceIndex}">
                        ${images.map((img, idx) => `
                            <img src="${img}" alt="${service.name} image ${idx + 1}" class="gallery-image ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                        `).join('')}
                        <button class="gallery-nav prev" onclick="navigateGallery(${serviceIndex}, -1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="gallery-nav next" onclick="navigateGallery(${serviceIndex}, 1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="gallery-dots">
                            ${images.map((_, idx) => `
                                <button class="gallery-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${serviceIndex}, ${idx})" data-dot-index="${idx}"></button>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                imageSection = `<img src="${images[0]}" alt="${service.name}" class="single-image" onerror="this.style.display='none'">`;
            }
        } else {
            imageSection = `<i class="${service.icon || 'fas fa-star'} service-icon"></i>`;
        }
        
        return `
        <div class="service-card">
            <div class="service-header">
                <span class="premium-badge">${service.tier}</span>
                ${imageSection}
                <h3 class="service-title">${service.name}</h3>
                <p class="service-subtitle">${getTierSubtitle(service.tier)}</p>
            </div>
            <div class="service-body">
                <p class="service-description">${service.description}</p>
                <ul class="service-features">
                    ${(service.features || []).map(feature => `
                        <li><i class="fas fa-check"></i> ${feature}</li>
                    `).join('')}
                </ul>
                <div class="service-price">
                    <div class="price-info">
                        <span class="price-amount">Rs ${formatPrice(service.price)}</span>
                        <span class="price-period">per project</span>
                    </div>
                    <button class="service-btn" onclick="handleServiceInquiry('${service.name}', '${service.tier}')">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    `}).join('');

    animateServiceCards();
}

// Display Error State
function displayErrorState() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Unable to Load Services</h3>
            <p>We're experiencing technical difficulties. Please try again later.</p>
            <button class="btn btn-primary" onclick="loadServices()" style="margin-top: 20px;">
                <i class="fas fa-refresh"></i> Try Again
            </button>
        </div>
    `;
}

// Helper Functions
function getTierSubtitle(tier) {
    const subtitles = {
        'Gold': 'Premium Excellence',
        'Platinum': 'Elite Solutions',
        'Diamond': 'Ultimate Experience'
    };
    return subtitles[tier] || 'Professional Service';
}

function formatPrice(price) {
    const numericPrice = price.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(numericPrice);
    
    if (isNaN(parsed)) return price;
    
    return parsed.toLocaleString('en-US');
}

function navigateGallery(galleryId, direction) {
    const gallery = document.querySelector(`[data-gallery-id="${galleryId}"]`);
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('.gallery-image');
    const dots = gallery.querySelectorAll('.gallery-dot');
    let currentIndex = 0;
    
    images.forEach((img, idx) => {
        if (img.classList.contains('active')) currentIndex = idx;
    });
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    images[newIndex].classList.add('active');
    dots[newIndex].classList.add('active');
}

function goToSlide(galleryId, slideIndex) {
    const gallery = document.querySelector(`[data-gallery-id="${galleryId}"]`);
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('.gallery-image');
    const dots = gallery.querySelectorAll('.gallery-dot');
    
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    images[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
}

function animateServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Handle Service Inquiry
function handleServiceInquiry(serviceName, tier) {
    if (!requireAuth(`${serviceName} service`)) {
        return;
    }

    var html = '<div style="text-align: center; padding: 20px;">' +
        '<i class="fas fa-crown" style="font-size: 3rem; color: #FFD700; margin-bottom: 20px;"></i>' +
        '<div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.3); margin-bottom: 20px;">' +
        '<p style="color: #FFD700; margin: 0; font-weight: bold;">' + tier + ' Tier Service</p>' +
        '</div>' +
        '<p style="color: #C0C0C0; margin-bottom: 20px;">Thank you for your interest in our ' + serviceName + ' service!</p>' +
        '<p style="color: #C0C0C0; margin-bottom: 30px;">Our VIP team will contact you within 24 hours to discuss your requirements and provide a customized solution.</p>' +
        '<div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.3);">' +
        '<p style="color: #FFD700; margin: 0; font-weight: bold;">Next Steps:</p>' +
        '<p style="color: #C0C0C0; margin: 5px 0 0 0;">• Initial consultation call<br>• Project scope discussion<br>• Custom proposal delivery<br>• Dedicated project manager assignment</p>' +
        '</div>' +
        '</div>';
    
    ctAlert('info', serviceName, null, html, 'Understood').then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/contact';
        }
    });
}

// Particles.js Configuration
function initParticles() {
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#FFD700' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#FFD700', opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
                modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
            },
            retina_detect: true
        });
    }
}

// Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add SweetAlert custom styles
function initCustomStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-swal-popup {
            border: 2px solid rgba(255, 215, 0, 0.5) !important;
            border-radius: 20px !important;
        }
        .custom-swal-title {
            color: #FFD700 !important;
            font-family: 'Orbitron', sans-serif !important;
        }
        .custom-swal-button {
            background: linear-gradient(135deg, #FFD700, #FFA500) !important;
            color: #0a0a0a !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 12px 25px !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }
        .custom-swal-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4) !important;
        }
    `;
    document.head.appendChild(style);
}

// Update copyright year
function updateCopyrightYear() {
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    initParticles();
    initSmoothScrolling();
    initCustomStyles();
    updateCopyrightYear();
});
