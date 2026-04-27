// CHAND Blogpost - Enhanced Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme-preference') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
    }

    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            document.body.classList.add('dark-theme');
            if (icon) icon.className = 'fas fa-moon';
        }

        // Ensure nav-open is correctly handled on theme change if needed
        // but the request is specifically about dark-theme and nav-open
    }

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                localStorage.setItem('theme-preference', this.currentTheme);
                this.applyTheme(this.currentTheme);
            });
        }
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
            animateCounter('totalReaders', data.totalReaders || 0);
            animateCounter('totalArticles', data.totalArticles || 0);
            animateCounter('todayReaders', data.todayReaders || 0);
            animateCounter('totalLikes', data.totalLikes || 0);

            // For engagement, we might want a decimal or percentage
            const engagementElem = document.getElementById('userEngagement');
            if (engagementElem) {
                engagementElem.textContent = data.userEngagement || '0';
            }

            // Apply red color to the heart icon in stats if needed
            const heartStatIcon = document.querySelector('.fa-heart.stat-icon');
            if (heartStatIcon) heartStatIcon.style.color = '#ff4b2b';
        }
    } catch (e) { console.error(e); }
}

function animateCounter(elementId, end) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 2000;
    const startTime = performance.now();
    const start = parseInt(element.textContent) || 0;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentValue = start + (end - start) * eased;

        element.textContent = Math.floor(currentValue);

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = end;
        }
    }

    requestAnimationFrame(updateCounter);
}

async function loadPosts() {
    const grid = document.getElementById('postsGrid');
    const searchInput = document.getElementById('blogSearch');
    if (!grid) return;

    try {
        const response = await fetch('/api/blog/blogs');
        const data = await response.json();
        if (data.success) {
            const allBlogs = data.blogs;

            const renderBlogs = (blogsToRender) => {
                grid.innerHTML = blogsToRender.map(post => {
                    const date = 'Recently';
                    const views = post.views || 0;
                    const likes = post.likes || 0;
                    const category = post.category || 'Tricks';

                    return `
                    <article class="post-card" onclick="window.location.href='${post.url || `/blog/${post.id}`}'" style="cursor: pointer;">
                        <div class="post-image-container">
                            <img src="${post.image || 'https://placehold.co/400x225/FFD700/000000?text=No+Image'}" class="post-image">
                        </div>
                        <div class="post-content">
                            <div class="post-meta">
                                <span class="post-category-badge">${category}</span>
                                <span><i class="fas fa-eye"></i> ${views} views</span>
                                <span id="like-count-${post.id}"><i class="far fa-heart"></i> ${likes} likes</span>
                            </div>
                            <h3 class="post-title">${post.title}</h3>
                            <p class="post-excerpt">${post.content.substring(0, 100)}...</p>
                            <div class="post-author">
                                <img src="https://cdn.jsdelivr.net/gh/chanddark/Image1/images/icon.png" class="author-avatar" alt="CHAND">
                                <span>By ${post.author || 'CHAND'}</span>
                            </div>
                            <div class="post-actions" onclick="event.stopPropagation()">
                                <a href="${post.url || `/blog/${post.id}`}" class="btn btn-primary"><i class="fas fa-book-open"></i> Read Article</a>
                                <button class="action-btn like-btn" onclick="likePost('${post.id}')" id="like-btn-${post.id}">
                                    <i class="far fa-heart"></i>
                                </button>
                                <button class="action-btn share-btn" onclick="sharePost('${post.title}', '${window.location.origin}${post.url || `/blog/${post.id}`}')">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    </article>
                    `;
                }).join('');
            };

            renderBlogs(allBlogs);

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredBlogs = allBlogs.filter(blog => 
                        blog.title.toLowerCase().includes(searchTerm) || 
                        blog.content.toLowerCase().includes(searchTerm) ||
                        (blog.category && blog.category.toLowerCase().includes(searchTerm))
                    );
                    renderBlogs(filteredBlogs);
                });
            }
        }
    } catch (e) { console.error(e); }
}

async function likePost(postId) {
    try {
        const response = await fetch(`/api/blog/blogs/${postId}/like`, { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            const likeCountElem = document.getElementById(`like-count-${postId}`);
            if (likeCountElem) {
                likeCountElem.innerHTML = `<i class="fas fa-heart" style="color: #ff4b2b;"></i> ${data.likes} likes`;
            }
            const likeBtn = document.getElementById(`like-btn-${postId}`);
            if (likeBtn) {
                likeBtn.classList.add('active');
                likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
                likeBtn.disabled = true;
            }
        }
    } catch (e) { console.error(e); }
}

function sharePost(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(console.error);
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    loadStats();
    loadPosts();
});

// Auto-update copyright year
var copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

// Enhanced Loading Screen
(function() {
    'use strict';
    class EnhancedLoadingScreen {
        constructor() {
            this.preloader = document.getElementById('preloader');
            this.progressBar = document.getElementById('loaderProgressBar');
            this.percentage = document.getElementById('loaderPercentage');
            this.tip = document.getElementById('loaderTip');
            this.progress = 0;
            this.loadingTips = [
                'Preparing premium posts...',
                'Loading secure tricks...',
                'Initializing blog experience...',
                'Almost ready...',
                'Finalizing setup...'
            ];
            this.init();
        }
        init() {
            this.createParticles();
            this.simulateLoading();
            window.addEventListener('load', () => this.completeLoading());
        }
        createParticles() {
            const particlesContainer = document.getElementById('loaderParticles');
            if (!particlesContainer) return;
            for (let i = 0; i < 25; i++) {
                const particle = document.createElement('div');
                particle.className = 'loader-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                particlesContainer.appendChild(particle);
            }
        }
        simulateLoading() {
            this.loadingInterval = setInterval(() => {
                if (this.progress < 90) {
                    this.progress += Math.random() * 12;
                    if (this.progress > 90) this.progress = 90;
                    this.updateProgress();
                    if (this.progress > 20 && this.progress < 25) this.tip.textContent = this.loadingTips[1];
                    else if (this.progress > 45 && this.progress < 50) this.tip.textContent = this.loadingTips[2];
                    else if (this.progress > 70 && this.progress < 75) this.tip.textContent = this.loadingTips[3];
                }
            }, 150);
        }
        updateProgress() {
            if (this.progressBar) this.progressBar.style.width = this.progress + '%';
            if (this.percentage) this.percentage.textContent = Math.round(this.progress) + '%';
        }
        completeLoading() {
            clearInterval(this.loadingInterval);
            this.progress = 100;
            this.updateProgress();
            if (this.tip) this.tip.textContent = this.loadingTips[4];
            setTimeout(() => {
                if (this.preloader) this.preloader.classList.add('hidden');
            }, 800);
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        new EnhancedLoadingScreen();
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }, { passive: true });
    });
})();
