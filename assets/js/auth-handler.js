
// Universal Authentication Handler
class AuthHandler {
    constructor() {
        this.token = null;
        this.user = null;
        this.init();
    }

    init() {
        this.loadAuthState();
        this.updateAuthUI();
        this.bindEvents();
    }

    loadAuthState() {
        this.token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        this.user = userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn() {
        return !!(this.token && this.user);
    }

    updateAuthUI() {
        const isLoggedIn = this.isLoggedIn();
        
        // Update login/logout buttons
        const loginBtns = document.querySelectorAll('.login-btn, #loginBtn, .nav-login');
        const logoutBtns = document.querySelectorAll('.logout-btn, #logoutBtn, .nav-logout');
        const profileBtns = document.querySelectorAll('.profile-btn, #profileBtn, .nav-profile');
        
        loginBtns.forEach(btn => {
            if (btn) {
                btn.style.display = isLoggedIn ? 'none' : 'inline-block';
            }
        });
        
        logoutBtns.forEach(btn => {
            if (btn) {
                btn.style.display = isLoggedIn ? 'inline-block' : 'none';
            }
        });
        
        profileBtns.forEach(btn => {
            if (btn) {
                btn.style.display = isLoggedIn ? 'inline-block' : 'none';
            }
        });

        // Update user info displays
        const userDisplays = document.querySelectorAll('.user-display, .username-display');
        userDisplays.forEach(display => {
            if (display && this.user) {
                display.textContent = this.user.username;
            }
        });

        // Update navigation links based on auth state
        this.updateNavigation(isLoggedIn);
    }

    updateNavigation(isLoggedIn) {
        // Handle different navigation structures
        const navLinks = document.querySelector('.nav-links, #navLinks');
        if (!navLinks) return;

        // Find existing login/logout links
        const existingLoginLink = navLinks.querySelector('a[href="/login"], a[href="login.html"]');
        const existingLogoutLink = navLinks.querySelector('.logout-link');
        const existingProfileLink = navLinks.querySelector('a[href="/profile"], a[href="profile.html"]');

        if (isLoggedIn) {
            // Hide login link
            if (existingLoginLink) {
                existingLoginLink.style.display = 'none';
            }

            // Show/create profile link
            if (existingProfileLink) {
                existingProfileLink.style.display = 'inline-block';
            } else {
                this.createProfileLink(navLinks);
            }

            // Show/create logout link
            if (existingLogoutLink) {
                existingLogoutLink.style.display = 'inline-block';
            } else {
                this.createLogoutLink(navLinks);
            }
        } else {
            // Show login link
            if (existingLoginLink) {
                existingLoginLink.style.display = 'inline-block';
            }

            // Hide profile and logout links
            if (existingProfileLink) {
                existingProfileLink.style.display = 'none';
            }
            if (existingLogoutLink) {
                existingLogoutLink.style.display = 'none';
            }
        }
    }

    createProfileLink(navLinks) {
        const profileLink = document.createElement('a');
        profileLink.href = '/profile';
        profileLink.innerHTML = '<i class="fas fa-user"></i> Profile';
        profileLink.className = 'nav-profile';
        profileLink.style.display = 'inline-block';
        
        // Insert before logout link or at the end
        const logoutLink = navLinks.querySelector('.logout-link');
        if (logoutLink) {
            navLinks.insertBefore(profileLink, logoutLink);
        } else {
            navLinks.appendChild(profileLink);
        }
    }

    createLogoutLink(navLinks) {
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutLink.className = 'logout-link nav-logout';
        logoutLink.style.display = 'inline-block';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        navLinks.appendChild(logoutLink);
    }

    bindEvents() {
        // Bind logout events to existing logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, #logoutBtn, .nav-logout, .logout-link') || 
                e.target.closest('.logout-btn, #logoutBtn, .nav-logout, .logout-link')) {
                e.preventDefault();
                this.logout();
            }
        });

        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'user') {
                this.loadAuthState();
                this.updateAuthUI();
            }
        });
    }

    async logout() {
        // Delegate to unified logout handler for consistency
        if (window.unifiedLogoutHandler) {
            await window.unifiedLogoutHandler.showLogoutConfirmation();
        }
    }

    // Method to manually trigger UI update
    refresh() {
        this.loadAuthState();
        this.updateAuthUI();
    }

    // Method to check if user needs authentication for protected features
    requireAuth(featureName = 'this feature') {
        if (!this.isLoggedIn()) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Authentication Required',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas fa-lock" style="font-size: 3rem; color: #FFD700; margin-bottom: 20px;"></i>
                            <p style="color: #C0C0C0; margin-bottom: 20px;">You need to be logged in to access ${featureName}.</p>
                            <p style="color: #FFD700; font-weight: bold;">Would you like to login now?</p>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonColor: '#FFD700',
                    cancelButtonColor: '#ff6b6b',
                    confirmButtonText: '<i class="fas fa-sign-in-alt"></i> Login Now',
                    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
                    background: 'rgba(26, 26, 26, 0.95)',
                    color: '#ffffff',
                    backdrop: 'rgba(0, 0, 0, 0.8)',
                    customClass: {
                        popup: 'auth-required-popup',
                        confirmButton: 'btn-auth-confirm',
                        cancelButton: 'btn-auth-cancel'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
            } else {
                const confirmed = confirm(`You need to be logged in to access ${featureName}. Would you like to login now?`);
                if (confirmed) {
                    window.location.href = '/login';
                }
            }
            return false;
        }
        return true;
    }

    // Method to show feature access confirmation
    confirmFeatureAccess(featureName, callback) {
        if (!this.isLoggedIn()) {
            this.requireAuth(featureName);
            return false;
        }

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Confirm Access',
                html: `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-question-circle" style="font-size: 3rem; color: #FFD700; margin-bottom: 20px;"></i>
                        <p style="color: #C0C0C0; margin-bottom: 20px;">Do you want to proceed with ${featureName}?</p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#FFD700',
                cancelButtonColor: '#ff6b6b',
                confirmButtonText: '<i class="fas fa-check"></i> Yes, Proceed',
                cancelButtonText: '<i class="fas fa-times"></i> Cancel',
                background: 'rgba(26, 26, 26, 0.95)',
                color: '#ffffff',
                backdrop: 'rgba(0, 0, 0, 0.8)'
            }).then((result) => {
                if (result.isConfirmed && callback) {
                    callback();
                }
            });
        } else {
            const confirmed = confirm(`Do you want to proceed with ${featureName}?`);
            if (confirmed && callback) {
                callback();
            }
        }
        return true;
    }
}

// Initialize auth handler when DOM is ready
let authHandler;

function initializeAuth() {
    authHandler = new AuthHandler();
    
    // Expose globally for manual updates
    window.authHandler = authHandler;
    
    // Update auth state periodically
    setInterval(() => {
        authHandler.refresh();
    }, 30000); // Every 30 seconds
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Global function to check authentication before accessing features
function requireAuth(featureName = 'this feature') {
    if (window.authHandler) {
        return window.authHandler.requireAuth(featureName);
    }
    return false;
}

// Global function to confirm feature access
function confirmFeatureAccess(featureName, callback) {
    if (window.authHandler) {
        return window.authHandler.confirmFeatureAccess(featureName, callback);
    }
    return false;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHandler;
}
