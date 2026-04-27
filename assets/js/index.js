
(function() {
    'use strict';

    // ==========================================
    // ENHANCED LOADING SCREEN CLASS
    // ==========================================
    class EnhancedLoadingScreen {
        constructor() {
            this.preloader = document.getElementById('preloader');
            this.progressBar = document.getElementById('loaderProgressBar');
            this.percentage = document.getElementById('loaderPercentage');
            this.tip = document.getElementById('loaderTip');
            this.audioControl = document.getElementById('audioControl');
            
            this.progress = 0;
            this.loadingTips = [
                'Preparing premium features...',
                'Loading secure connections...',
                'Initializing your experience...',
                'Almost ready...',
                'Finalizing setup...'
            ];
            
            this.init();
        }

        init() {
            this.createParticles();
            this.simulateLoading();
            
            window.addEventListener('load', () => {
                this.completeLoading();
            });

            if (this.audioControl) {
                this.audioControl.addEventListener('click', () => {
                    this.playWelcomeMessage();
                });
            }
        }

        createParticles() {
            const particlesContainer = document.getElementById('loaderParticles');
            if (!particlesContainer) return;

            const particleCount = 25;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'loader-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        simulateLoading() {
            const interval = setInterval(() => {
                if (this.progress < 90) {
                    this.progress += Math.random() * 12;
                    if (this.progress > 90) this.progress = 90;
                    
                    this.updateProgress();
                    
                    if (this.progress > 20 && this.progress < 25) {
                        this.tip.textContent = this.loadingTips[1];
                    } else if (this.progress > 45 && this.progress < 50) {
                        this.tip.textContent = this.loadingTips[2];
                    } else if (this.progress > 70 && this.progress < 75) {
                        this.tip.textContent = this.loadingTips[3];
                    }
                }
            }, 150);

            this.loadingInterval = interval;
        }

        updateProgress() {
            if (this.progressBar) {
                this.progressBar.style.width = this.progress + '%';
            }
            if (this.percentage) {
                this.percentage.textContent = Math.round(this.progress) + '%';
            }
        }

        completeLoading() {
            clearInterval(this.loadingInterval);
            this.progress = 100;
            this.updateProgress();
            if (this.tip) this.tip.textContent = this.loadingTips[4];
            
            setTimeout(() => {
                if (this.preloader) {
                    this.preloader.classList.add('hidden');
                }
                this.playWelcomeMessage();
            }, 800);
        }

        playWelcomeMessage() {
            if ('speechSynthesis' in window) {
                const message = new SpeechSynthesisUtterance("Welcome to CHAND TRICKER. Loading your elite experience.");
                message.rate = 0.9;
                message.pitch = 1;
                window.speechSynthesis.speak(message);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        new EnhancedLoadingScreen();
        initTypingAnimation();
        initScrollEffects();
        trackVisitor();
        loadStatsFromAPI();
        setInterval(loadStatsFromAPI, 30000);
        checkAuthStatus();
    });

    function initTypingAnimation() {
        const typingElement = document.getElementById('typingText');
        if (!typingElement) return;

        const phrases = [
            'Welcome to Digital Excellence',
            'Free Tools for Users',
            'Unlock Your Digital Potential',
            'Innovation Meets Simplicity'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 60;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        setTimeout(type, 1000);
    }

    function initScrollEffects() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.stat-box, .gallery-item, .feature-card').forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    

    async function trackVisitor() {
        try {
            await fetch('/api/track-visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {}
    }

    async function loadStatsFromAPI() {
        try {
            const response = await fetch('/api/public-stats');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.stats) {
                    const stats = data.stats;
                    animateCounter('totalUsersCount', stats.totalUsers || 0);
                    animateCounter('totalToolsCount', stats.totalTools || 10);
                    animateCounter('totalVisitors', stats.totalVisitors || 0);
                    animateCounter('totalToolUsage', stats.totalToolUsage || 0);
                    animateCounter('totalActivities', stats.totalActivities || 0);
                    animateCounter('totalCoinSpent', stats.totalCoinSpent || 0);
                    
                    const securityEl = document.getElementById('securityRate');
                    if (securityEl && stats.securityRate) {
                        securityEl.textContent = stats.securityRate + '%';
                        securityEl.setAttribute('data-target', stats.securityRate);
                    }
                    const uptimeEl = document.getElementById('uptime');
                    if (uptimeEl && stats.uptime) {
                        uptimeEl.textContent = stats.uptime;
                    }
                }
            } else {
                setDefaultStats();
            }
        } catch (error) {
            setDefaultStats();
        }
    }

    function formatLargeNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toString();
    }

    function setDefaultStats() {
        animateCounter('totalUsersCount', 0);
        animateCounter('totalToolsCount', 10);
        animateCounter('totalVisitors', 0);
        animateCounter('totalToolUsage', 0);
        animateCounter('totalActivities', 0);
        animateCounter('totalCoinSpent', 0);
        
        const securityEl = document.getElementById('securityRate');
        if (securityEl) {
            securityEl.textContent = '99.9%';
        }
        const uptimeEl = document.getElementById('uptime');
        if (uptimeEl) {
            uptimeEl.textContent = '24/7';
        }
    }

    function animateCounter(elementId, end, suffix) {
        suffix = suffix || '';
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 2000;
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        const start = 0;

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (end - start) * eased;

            let displayValue;
            if (isDecimal) {
                displayValue = currentValue.toFixed(1) + suffix;
            } else {
                displayValue = formatLargeNumber(Math.floor(currentValue)) + suffix;
            }
            element.textContent = displayValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                const finalValue = isDecimal ? end.toFixed(1) + suffix : formatLargeNumber(end) + suffix;
                element.textContent = finalValue;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const loginBtn = document.querySelector('.login-btn');
        const profileBtn = document.querySelector('.profile-btn');
        const paymentBtn = document.querySelector('.payment-btn');
        
        const profileMore = document.querySelector('.profile-more');
        const paymentMore = document.querySelector('.payment-more');
        const quickAccessMore = document.querySelector('.quick-access-more');
        const supportMore = document.querySelector('.support-more');
        const userSearchMore = document.querySelector('.user-search-more');
        const referralMore = document.querySelector('.referral-more');

        if (token) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'flex';
            if (paymentBtn) paymentBtn.style.display = 'flex';
          
            if (profileMore) profileMore.style.display = 'flex';
            if (paymentMore) paymentMore.style.display = 'flex';
            if (quickAccessMore) quickAccessMore.style.display = 'flex';
            if (supportMore) supportMore.style.display = 'flex';
            if (userSearchMore) userSearchMore.style.display = 'flex';
            if (referralMore) referralMore.style.display = 'flex';
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (profileBtn) profileBtn.style.display = 'none';
            if (paymentBtn) paymentBtn.style.display = 'none';
            
            if (profileMore) profileMore.style.display = 'none';
            if (paymentMore) paymentMore.style.display = 'none';
            if (quickAccessMore) quickAccessMore.style.display = 'none';
            if (supportMore) supportMore.style.display = 'none';
            if (userSearchMore) userSearchMore.style.display = 'none';
            if (referralMore) referralMore.style.display = 'none';
        }
    }

    checkAuthStatus();

    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
