/**
 * Unified Logout Handler - Direct logout without confirmation
 */

class UnifiedLogoutHandler {
    constructor() {
        this.logoutInProgress = false;
    }

    bindLogoutEvents() {
        // Disabled
    }
    
    showLogoutConfirmation() {
        return Promise.resolve(true);
    }

    setupStorageListener() {}
    isCurrentlyLoggedIn() { return false; }

    async performLogout() {
        if (this.logoutInProgress) return;
        this.logoutInProgress = true;

        const token = localStorage.getItem('token');
        if (token) {
            await fetch('/api/logout', { method: 'POST' }).catch(() => {});
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');

        window.location.href = '/login';
    }

    showSuccessMessage() {}
    showErrorMessage() {}
    closeOpenMenus() {}
    handleLogoutFromOtherTab() {}
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedLogoutHandler = new UnifiedLogoutHandler();
    });
} else {
    window.unifiedLogoutHandler = new UnifiedLogoutHandler();
}

// Global functions
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function directLogout() {
    logout();
}