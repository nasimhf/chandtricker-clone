/**
 * Unified Navigation Handler
 * Handles responsive hamburger menu toggle and authentication state
 * 
 * Menu behavior based on login state:
 * - NOT logged in: Home, Tools, Services, About, Contact, Login
 * - Logged in: Home, Tools, Services, About, Contact, Profile, Logout
 */

document.addEventListener('DOMContentLoaded', function() {
    initUnifiedNavigation();
});

function initUnifiedNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    // Initialize hamburger menu functionality
    if (hamburger && navLinks) {
        // Ensure proper attributes
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('tabindex', '0');

        // Hamburger click handler - toggles mobile menu
        const hamburgerClickHandler = function(e) {
            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();
            toggleMobileMenu();
        };
        
        // Use click for both desktop and mobile - more reliable
        hamburger.addEventListener('click', hamburgerClickHandler);
        
        // Touch handler - simplified for mobile
        hamburger.addEventListener('touchend', function(e) {
            e.preventDefault();
            hamburgerClickHandler(e);
        });

        // Keyboard accessibility for hamburger
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
            }
        });

        // Close menu when clicking outside navigation
        const outsideClickHandler = function(e) {
            if (hamburger.classList.contains('active')) {
                if (!e.target.closest('.nav-container') && !e.target.closest('.navbar') && !e.target.closest('.more-dropdown')) {
                    closeMobileMenu();
                }
            }
        };
        document.addEventListener('click', outsideClickHandler);
        document.addEventListener('touchend', function(e) {
            if (e.cancelable) {
                outsideClickHandler(e);
            }
        });

        // Close menu when clicking navigation links (except logout)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (!this.classList.contains('logout-link') && !this.classList.contains('logout-btn')) {
                    setTimeout(() => closeMobileMenu(), 50);
                }
            });
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
                closeMoreDropdown();
            }
        });

        // Handle window resize - close mobile menu on larger screens
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
            handleMoreDropdown();
        });
    }

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Initialize authentication state FIRST — updateAuthUI calls handleMoreDropdown synchronously
    initAuthState();

    // Initialize dropdown events
    initMoreDropdownEvents();
    
    // Handle logout button clicks
    initLogoutHandlers();
    
    // Set active navigation link
    setActiveNavLink();
}

/**
 * Toggle mobile menu open/close
 */
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        try {
            const isOpen = hamburger.classList.contains('active');
            
            // Toggle all required classes
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('nav-open');
            
            // Update aria-expanded for accessibility
            hamburger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            
            // Focus first link when menu opens (for accessibility)
            if (!isOpen && window.innerWidth <= 768) {
                const firstLink = navLinks.querySelector('a[href]');
                if (firstLink) {
                    setTimeout(() => {
                        try {
                            firstLink.focus();
                        } catch (e) {}
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Toggle menu error:', error);
        }
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        try {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('nav-open');
            hamburger.setAttribute('aria-expanded', 'false');
        } catch (error) {
            console.error('Close menu error:', error);
        }
    }
}

/**
 * Handle More dropdown.
 * CSS (body.user-logged-in) controls which links are hidden in nav bar.
 * JS only populates the More menu content.
 */
function handleMoreDropdown() {
    if (window.innerWidth <= 768) return;

    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const isLoggedIn = !!(localStorage.getItem('token') && localStorage.getItem('user'));

    if (isLoggedIn) {
        populateMoreMenuLoggedIn(navLinks);
    } else {
        document.body.classList.remove('user-logged-in');
        handleDynamicOverflow(navLinks);
    }
}

/**
 * Logged in: CSS already hides extra nav links via body.user-logged-in.
 * JS just populates the More menu with the correct items.
 */
function populateMoreMenuLoggedIn(navLinks) {
    if (!navLinks.querySelector('.more-dropdown')) {
        createMoreDropdown(navLinks);
    }

    const moreMenu = navLinks.querySelector('.more-menu');
    if (!moreMenu) return;

    // Collect: all auth-only links except profile-btn + logout
    const authOnlyLinks = navLinks.querySelectorAll(
        ':scope > .auth-only-link:not(.profile-btn):not(.nav-divider)'
    );
    const logoutBtn = navLinks.querySelector(':scope > .logout-btn');

    moreMenu.innerHTML = '';

    authOnlyLinks.forEach(link => {
        if (link.classList.contains('logout-btn')) return; // handled separately below
        const clone = link.cloneNode(true);
        clone.removeAttribute('style');
        clone.style.setProperty('display', 'flex', 'important');
        moreMenu.appendChild(clone);
    });

    if (logoutBtn) {
        const logoutClone = logoutBtn.cloneNode(true);
        logoutClone.removeAttribute('style');
        logoutClone.style.setProperty('display', 'flex', 'important');
        moreMenu.appendChild(logoutClone);
    }
}

/**
 * Logged out: dynamic overflow detection (no CSS class needed)
 */
function handleDynamicOverflow(navLinks) {
    showAllNavItems();

    const navContainer = document.querySelector('.nav-container');
    const navBrand = document.querySelector('.nav-brand');
    if (!navContainer || !navBrand) return;

    const containerWidth = navContainer.offsetWidth;
    const brandWidth = navBrand.offsetWidth;
    const availableWidth = containerWidth - brandWidth - 60;

    const allLinks = navLinks.querySelectorAll(':scope > a:not(.more-dropdown a)');
    let totalWidth = 0;
    const overflowingLinks = [];

    allLinks.forEach(link => {
        totalWidth += link.offsetWidth + 8;
        if (totalWidth > availableWidth) overflowingLinks.push(link);
    });

    if (overflowingLinks.length > 0) {
        if (!navLinks.querySelector('.more-dropdown')) createMoreDropdown(navLinks);
        const moreMenu = navLinks.querySelector('.more-menu');
        if (moreMenu) {
            moreMenu.innerHTML = '';
            overflowingLinks.forEach(link => {
                const clone = link.cloneNode(true);
                clone.style.setProperty('display', 'flex', 'important');
                moreMenu.appendChild(clone);
                link.style.setProperty('display', 'none', 'important');
            });
        }
        const dropdown = navLinks.querySelector('.more-dropdown');
        if (dropdown) dropdown.style.display = 'block';
    } else {
        const dropdown = navLinks.querySelector('.more-dropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
}

function showAllNavItems() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const allLinks = navLinks.querySelectorAll(':scope > a');
    allLinks.forEach(link => {
        // Only show if not hidden by auth state
        if (!link.hasAttribute('data-auth-hidden')) {
            link.style.setProperty('display', 'flex', 'important');
        }
    });

    const moreDropdown = navLinks.querySelector('.more-dropdown');
    if (moreDropdown && window.innerWidth <= 768) {
        moreDropdown.style.display = 'none';
    }
}

function createMoreDropdown(navLinks) {
    const existingDropdown = navLinks.querySelector('.more-dropdown');
    if (existingDropdown) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'more-dropdown';
    dropdown.innerHTML = `
        <button class="more-btn">
            <i class="fas fa-ellipsis-h"></i>
            <span>More</span>
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="more-menu"></div>
    `;
    navLinks.appendChild(dropdown);
    
    initMoreDropdownEvents();
}

function initMoreDropdownEvents() {
    const moreDropdown = document.querySelector('.more-dropdown');
    if (!moreDropdown) return;

    const moreBtn = moreDropdown.querySelector('.more-btn');
    if (moreBtn) {
        moreBtn.removeEventListener('click', toggleMoreDropdown);
        moreBtn.addEventListener('click', toggleMoreDropdown);
    }

    document.removeEventListener('click', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);

    // Desktop hover functionality - only for screens larger than 768px
    if (window.innerWidth > 768) {
        moreDropdown.addEventListener('mouseenter', openMoreDropdownDesktop);
        moreDropdown.addEventListener('mouseleave', closeMoreDropdownDesktop);
    }
}

function toggleMoreDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    const moreDropdown = document.querySelector('.more-dropdown');
    if (moreDropdown) {
        moreDropdown.classList.toggle('open');
    }
}

function closeMoreDropdown() {
    const moreDropdown = document.querySelector('.more-dropdown');
    if (moreDropdown) {
        moreDropdown.classList.remove('open');
    }
}

function handleOutsideClick(e) {
    const moreDropdown = document.querySelector('.more-dropdown');
    if (moreDropdown && !moreDropdown.contains(e.target)) {
        // Only close on click if not on desktop (where hover is primary)
        if (window.innerWidth <= 768) {
            moreDropdown.classList.remove('open');
        }
    }
}

/**
 * Open more dropdown on desktop hover
 */
function openMoreDropdownDesktop() {
    const moreDropdown = document.querySelector('.more-dropdown');
    if (moreDropdown && window.innerWidth > 768) {
        moreDropdown.classList.add('open');
    }
}

/**
 * Close more dropdown on desktop hover exit
 */
function closeMoreDropdownDesktop() {
    const moreDropdown = document.querySelector('.more-dropdown');
    if (moreDropdown && window.innerWidth > 768) {
        moreDropdown.classList.remove('open');
    }
}

/**
 * Initialize authentication state and update menu accordingly
 * Shows/hides Login, Profile, and Logout buttons based on auth state
 */
function initAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const isLoggedIn = !!(token && userStr);
    
    updateAuthUI(isLoggedIn);
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token' || e.key === 'user') {
            const newToken = localStorage.getItem('token');
            const newUser = localStorage.getItem('user');
            updateAuthUI(!!(newToken && newUser));
        }
    });
}

/**
 * Update UI based on login state
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
function updateAuthUI(isLoggedIn) {
    // Find login buttons
    const loginBtns = document.querySelectorAll('.login-btn, #loginBtn, a[href="/login"].login-btn');
    // Find signup buttons
    const signupBtns = document.querySelectorAll('.signup-btn, #signupBtn, a[href="/signup"].signup-btn');
    // Find profile buttons
    const profileBtns = document.querySelectorAll('.profile-btn, #profileBtn, a[href="/profile"].profile-btn');
    // Find logout buttons
    const logoutBtns = document.querySelectorAll('.logout-btn, .logout-link, #logoutBtn');
    // Find all auth-only links (visible when logged in)
    const authOnlyLinks = document.querySelectorAll('.auth-only-link');
    // Find nav dividers
    const navDividers = document.querySelectorAll('.nav-divider');
    
    if (isLoggedIn) {
        // Add CSS class — desktop CSS will hide extra nav links automatically
        document.body.classList.add('user-logged-in');

        loginBtns.forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
            btn.setAttribute('data-auth-hidden', 'true');
        });
        signupBtns.forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
            btn.setAttribute('data-auth-hidden', 'true');
        });
        profileBtns.forEach(btn => {
            btn.style.setProperty('display', 'flex', 'important');
            btn.removeAttribute('data-auth-hidden');
        });
        // Auth-only links: set display flex WITHOUT !important
        // so CSS body.user-logged-in rule (display:none !important) can override on desktop
        authOnlyLinks.forEach(link => {
            link.style.display = 'flex';
            link.removeAttribute('data-auth-hidden');
        });
        navDividers.forEach(divider => {
            divider.style.display = 'flex';
        });
    } else {
        // Remove CSS class when logged out
        document.body.classList.remove('user-logged-in');

        loginBtns.forEach(btn => {
            btn.style.setProperty('display', 'flex', 'important');
            btn.removeAttribute('data-auth-hidden');
        });
        signupBtns.forEach(btn => {
            btn.style.setProperty('display', 'flex', 'important');
            btn.removeAttribute('data-auth-hidden');
        });
        profileBtns.forEach(btn => {
            btn.style.setProperty('display', 'none', 'important');
            btn.setAttribute('data-auth-hidden', 'true');
        });
        authOnlyLinks.forEach(link => {
            link.style.setProperty('display', 'none', 'important');
            link.setAttribute('data-auth-hidden', 'true');
        });
        navDividers.forEach(divider => {
            divider.style.setProperty('display', 'none', 'important');
        });
    }

    // Populate More menu content (CSS handles visibility on desktop)
    handleMoreDropdown();
}

/**
 * Initialize logout button handlers
 */
function initLogoutHandlers() {
    document.addEventListener('click', async function(e) {
        const logoutBtn = e.target.closest('.logout-btn, .logout-link');
        if (logoutBtn) {
            e.preventDefault();
            await handleLogout(e);
        }
    });
}

/**
 * Handle logout action - delegates to unified logout handler
 */
async function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    
    if (window.unifiedLogoutHandler) {
        closeMobileMenu();
    }
    window.location.href = '/logout';
}

/**
 * Show custom logout confirmation modal (fallback when SweetAlert2 is not available)
 */
function showLogoutConfirmModal() {
    return new Promise((resolve) => {
        // Remove any existing modal
        const existingModal = document.getElementById('logoutConfirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'logoutConfirmModal';
        modal.className = 'logout-modal-overlay';
        modal.innerHTML = `
            <div class="logout-modal-content">
                <div class="logout-modal-header">
                    <i class="fas fa-sign-out-alt"></i>
                    <h3>Logout Confirmation</h3>
                </div>
                <div class="logout-modal-body">
                    <p>Are you sure you want to logout?</p>
                    <p class="logout-modal-subtext">You will need to login again to access your account.</p>
                </div>
                <div class="logout-modal-footer">
                    <button class="logout-modal-btn logout-modal-btn-cancel" id="logoutCancelBtn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="logout-modal-btn logout-modal-btn-confirm" id="logoutConfirmBtn">
                        <i class="fas fa-sign-out-alt"></i> Yes, Logout
                    </button>
                </div>
            </div>
        `;
        
        // Add modal styles if not already present
        if (!document.getElementById('logoutModalStyles')) {
            const styles = document.createElement('style');
            styles.id = 'logoutModalStyles';
            styles.textContent = `
                .logout-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                    animation: logoutModalFadeIn 0.3s ease-out;
                    padding: 20px;
                }
                
                @keyframes logoutModalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes logoutModalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .logout-modal-content {
                    background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(42, 42, 42, 0.95));
                    border: 2px solid #FFD700;
                    border-radius: 20px;
                    max-width: 420px;
                    width: 100%;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.15);
                    animation: logoutModalSlideIn 0.4s ease-out;
                    overflow: hidden;
                }
                
                .logout-modal-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ffd700, #ffed4a, #ffd700);
                    background-size: 200% 100%;
                    animation: shimmer 3s ease-in-out infinite;
                }
                
                @keyframes shimmer {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .logout-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    padding: 30px 25px 20px;
                    text-align: center;
                }
                
                .logout-modal-header i {
                    font-size: 2.5rem;
                    color: #FFD700;
                    text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                }
                
                .logout-modal-header h3 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    color: #FFD700;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }
                
                .logout-modal-body {
                    padding: 15px 30px 25px;
                    text-align: center;
                }
                
                .logout-modal-body p {
                    color: #ffffff;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin: 0 0 10px 0;
                }
                
                .logout-modal-subtext {
                    color: #C0C0C0 !important;
                    font-size: 0.95rem !important;
                }
                
                .logout-modal-footer {
                    padding: 10px 30px 30px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                
                .logout-modal-btn {
                    padding: 14px 28px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    min-width: 140px;
                }
                
                .logout-modal-btn-cancel {
                    background: linear-gradient(135deg, #444, #333);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .logout-modal-btn-cancel:hover {
                    background: linear-gradient(135deg, #555, #444);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .logout-modal-btn-confirm {
                    background: linear-gradient(135deg, #ff6b6b, #e55353);
                    color: #ffffff;
                    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
                }
                
                .logout-modal-btn-confirm:hover {
                    background: linear-gradient(135deg, #ff5252, #d64545);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
                }
                
                @media (max-width: 480px) {
                    .logout-modal-content {
                        border-radius: 15px;
                    }
                    
                    .logout-modal-header {
                        flex-direction: column;
                        gap: 10px;
                        padding: 25px 20px 15px;
                    }
                    
                    .logout-modal-header i {
                        font-size: 2rem;
                    }
                    
                    .logout-modal-header h3 {
                        font-size: 1.3rem;
                    }
                    
                    .logout-modal-footer {
                        flex-direction: column;
                        gap: 12px;
                        padding: 10px 20px 25px;
                    }
                    
                    .logout-modal-btn {
                        width: 100%;
                        padding: 16px 20px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Handle button clicks
        const confirmBtn = document.getElementById('logoutConfirmBtn');
        const cancelBtn = document.getElementById('logoutCancelBtn');
        
        const closeModal = (result) => {
            modal.style.animation = 'logoutModalFadeIn 0.2s ease-out reverse';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
                resolve(result);
            }, 200);
        };
        
        confirmBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(false);
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEscape);
                closeModal(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

/**
 * Show logout success modal (fallback when SweetAlert2 is not available)
 */
function showLogoutSuccessModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('logoutSuccessModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'logoutSuccessModal';
    modal.className = 'logout-modal-overlay';
    modal.innerHTML = `
        <div class="logout-modal-content" style="max-width: 350px;">
            <div class="logout-modal-header" style="padding-bottom: 10px;">
                <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                <h3 style="color: #4CAF50;">Logged Out</h3>
            </div>
            <div class="logout-modal-body">
                <p>You have been successfully logged out.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 1.5 seconds
    setTimeout(() => {
        modal.style.animation = 'logoutModalFadeIn 0.2s ease-out reverse';
        setTimeout(() => modal.remove(), 200);
    }, 1200);
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        const isExactMatch = currentPath === linkPath;
        const isRootMatch = currentPath === '/' && linkPath === '/';
        const isPrefixMatch = currentPath !== '/' && linkPath !== '/' && 
            currentPath.startsWith(linkPath) && 
            (currentPath.length === linkPath.length || currentPath.charAt(linkPath.length) === '/');
        
        if (isExactMatch || isRootMatch || isPrefixMatch) {
            link.classList.add('active');
        }
    });
}

/**
 * Refresh auth state - can be called externally
 */
function refreshAuthState() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    updateAuthUI(!!(token && userStr));
}

// Initialize on page load - refreshAuthState already calls handleMoreDropdown synchronously
window.addEventListener('load', function() {
    refreshAuthState();
});

// Export functions for external use
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.refreshAuthState = refreshAuthState;
window.updateAuthUI = updateAuthUI;
