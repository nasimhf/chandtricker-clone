// Particles.js Configuration
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

// Enhanced Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-container') && !e.target.closest('.navbar')) {
                if (hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('nav-open');
                }
            }
        });

        navLinks.addEventListener('click', function(e) {
            if (e.target === navLinks) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                setTimeout(() => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('nav-open');
                }, 100);
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });
    }
});

function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        const isActive = hamburger.classList.contains('active');

        if (isActive) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
        } else {
            hamburger.classList.add('active');
            navLinks.classList.add('active');
            document.body.classList.add('nav-open');
        }
    }
}

// FAQ Toggle Function
function toggleFAQ(faqQuestion) {
    const faqItem = faqQuestion.closest('.faq-item');
    faqItem.classList.toggle('active');
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scrolling for Internal Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Contact Info Cards Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.info-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// CT Alert function
const ctIcons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };

function ctAlert(type, title, text) {
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'ct-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'ct-dialog';
        var iconEl = document.createElement('div');
        iconEl.className = 'ct-icon ' + type;
        iconEl.innerHTML = '<i class="fas ' + (ctIcons[type] || ctIcons.info) + '"></i>';
        var h3 = document.createElement('h3');
        h3.textContent = title;
        var p = document.createElement('p');
        p.textContent = text;
        var btn = document.createElement('button');
        btn.className = 'ct-btn ct-btn-ok';
        btn.textContent = 'OK';
        btn.onclick = function() { overlay.remove(); resolve(); };
        dialog.append(iconEl, h3, p, btn);
        overlay.appendChild(dialog);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) { overlay.remove(); resolve(); } });
        document.body.appendChild(overlay);
    });
}

// Auto-update copyright year
var yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();