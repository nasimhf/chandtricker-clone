// Custom Alert System - CHAND TRICKER Design
// Replaces SweetAlert with website-style alerts

// Add overlay and alert-box styles
const alertStyles = document.createElement('style');
alertStyles.id = 'alert-overlay-styles';
alertStyles.textContent = `
    /* Overlay — poori screen cover karta hai */
    .overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }
    /* Alert box — 90% width taake mobile pe fit rahe */
    .alert-box {
        max-width: 380px;
        width: 90%;
        border-radius: 20px;
        overflow: hidden;
        margin: auto;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
if (!document.getElementById('alert-overlay-styles')) {
    document.head.appendChild(alertStyles);
}

const CustomAlert = {
    // Default configuration
    config: {
        background: 'linear-gradient(145deg, #1a1a2e, #0f0f23)',
        color: '#ffffff',
        borderColor: '#ffd700',
        iconColor: '#ffd700',
        buttonColor: '#ffd700',
        buttonTextColor: '#0f0f23',
        duration: 3000
    },

    // Show alert - auto close - CENTER SCREEN with OVERLAY
    show: function(options) {
        return new Promise((resolve) => {
            const settings = { ...this.config, ...options };
            
            // Remove existing alerts first
            this.removeAll();

            // Create overlay first
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            // Get icon and colors based on type
            const typeColors = {
                success: { border: '#10b981', icon: '#10b981', bg: 'linear-gradient(145deg, #064e3b, #065f46)' },
                error: { border: '#ef4444', icon: '#ef4444', bg: 'linear-gradient(145deg, #7f1d1d, #991b1b)' },
                warning: { border: '#f59e0b', icon: '#f59e0b', bg: 'linear-gradient(145deg, #78350f, #92400e)' },
                info: { border: '#3b82f6', icon: '#3b82f6', bg: 'linear-gradient(145deg, #1e3a5f, #1e40af)' },
                question: { border: '#ffd700', icon: '#ffd700', bg: 'linear-gradient(145deg, #1a1a2e, #0f0f23)' }
            };
            
            const colors = typeColors[settings.type] || typeColors.info;
            
            // Create alert-box inside overlay
            const alertBox = document.createElement('div');
            alertBox.className = 'alert-box';
            alertBox.style.cssText = `
                background: ${colors.bg};
                border: 2px solid ${colors.border};
                color: ${settings.color};
                font-family: 'Poppins', Arial, sans-serif;
                box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 50px ${colors.border}30;
                animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                margin: auto;
            `;
            
            alertBox.innerHTML = `
                <div class="alert-content" style="padding: 30px 25px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div class="alert-icon" style="font-size: 60px; display: flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%; margin-bottom: 20px; box-shadow: 0 0 30px ${colors.border}40; color: ${colors.icon};">
                        ${this.getIcon(settings.type)}
                    </div>
                    <div class="alert-text" style="width: 100%; text-align: center;">
                        ${settings.title ? `<h3 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px;">${settings.title}</h3>` : ''}
                        ${settings.text ? `<p style="margin: 0; font-size: 15px; opacity: 0.9; line-height: 1.6; color: #ddd;">${settings.text}</p>` : ''}
                    </div>
                </div>
                <div class="alert-progress" style="height: 4px; background: ${colors.border}; width: 100%;">
                    <div class="progress-bar" style="height: 100%; background: ${colors.border}; animation: progressShrink ${settings.duration || 3000}ms linear forwards;"></div>
                </div>
            `;

            // Add click outside to close
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    CustomAlert.remove(overlay);
                    resolve({ isClosed: true });
                }
            });

            // Add keyframes
            if (!document.getElementById('custom-alert-styles')) {
                const style = document.createElement('style');
                style.id = 'custom-alert-styles';
                style.textContent = `
                    @keyframes scaleIn {
                        from { transform: scale(0.5); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes progressShrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    @keyframes scaleOut {
                        from { transform: scale(1); opacity: 1; }
                        to { transform: scale(0.5); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            overlay.appendChild(alertBox);
            document.body.appendChild(overlay);

            // Auto close with 3 second default
            const autoCloseDuration = settings.duration !== 0 ? (settings.duration || 3000) : 0;
            if (autoCloseDuration > 0) {
                setTimeout(() => {
                    this.remove(overlay);
                    resolve({ isClosed: false });
                }, autoCloseDuration);
            }
        });
    },

    // Get icon based on type
    getIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            question: '?'
        };
        return icons[type] || icons.info;
    },

    // Remove single alert
    remove: function(overlay) {
        if (overlay && overlay.parentNode) {
            const alertBox = overlay.querySelector('.alert-box');
            if (alertBox) {
                alertBox.style.animation = 'scaleOut 0.3s ease-out forwards';
            }
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    },

    // Remove all alerts
    removeAll: function() {
        document.querySelectorAll('.overlay').forEach(overlay => this.remove(overlay));
    },

    // Get icon based on type - using text emojis
    getIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            question: '?'
        };
        return icons[type] || icons.info;
    },

    // Remove single alert
    remove: function(alert) {
        if (alert && alert.parentNode) {
            alert.style.animation = 'fadeOutScale 0.3s ease-out forwards';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    },

    // Remove all alerts
    removeAll: function() {
        document.querySelectorAll('.custom-alert').forEach(alert => this.remove(alert));
        // Also remove any remaining overlays
        document.querySelectorAll('.custom-alert-overlay').forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    },

    // Remove overlay properly with animation
    removeOverlay: function(overlayEl) {
        if (overlayEl && overlayEl.parentNode) {
            overlayEl.style.opacity = '0';
            overlayEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (overlayEl.parentNode) {
                    overlayEl.parentNode.removeChild(overlayEl);
                }
            }, 300);
        }
    },

    // Success alert
    success: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        options.type = 'success';
        return this.show(options);
    },

    // Error alert
    error: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        options.type = 'error';
        return this.show(options);
    },

    // Warning alert
    warning: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        options.type = 'warning';
        return this.show(options);
    },

    // Info alert
    info: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        options.type = 'info';
        return this.show(options);
    },

    // Confirm dialog - returns Promise with result
    confirm: function(options) {
        return new Promise((resolve) => {
            const settings = { 
                ...this.config, 
                ...options,
                type: 'question',
                duration: 0 
            };

            // Remove existing alerts
            this.removeAll();

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            // Create alert-box
            const alertBox = document.createElement('div');
            alertBox.className = 'alert-box';
            alertBox.style.cssText += `
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 2px solid #ffd700;
                box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.15);
                animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                margin: auto;
            `;

            alertBox.innerHTML = `
                <div class="alert-content" style="padding: 35px 30px; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div class="alert-icon-circle" style="width: 90px; height: 90px; background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.1)); border: 3px solid #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(255,215,0,0.3);">
                        <span style="font-size: 42px; color: #ffd700; font-weight: bold;">?</span>
                    </div>
                    <div class="alert-text" style="margin-bottom: 30px; width: 100%; text-align: center;">
                        ${settings.title ? `<h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #ffd700; text-transform: uppercase; letter-spacing: 1px;">${settings.title}</h3>` : ''}
                        ${settings.text ? `<p style="margin: 0; font-size: 15px; opacity: 0.9; line-height: 1.6; color: #e0e0e0;">${settings.text}</p>` : ''}
                    </div>
                    <div class="alert-buttons" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button class="alert-btn-cancel" style="padding: 14px 35px; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; background: transparent; color: #aaa; border: 2px solid #444; font-family: 'Poppins', Arial, sans-serif;">Cancel</button>
                        <button class="alert-btn-confirm" style="padding: 14px 35px; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #ffd700, #ffaa00); color: #1a1a1a; box-shadow: 0 8px 25px rgba(255,215,0,0.4); font-family: 'Poppins', Arial, sans-serif;">Confirm</button>
                    </div>
                </div>
            `;

            // Click outside to close
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    CustomAlert.remove(overlay);
                    resolve({ isConfirmed: false, isClosed: true });
                }
            });

            // Button event handlers
            setTimeout(() => {
                const cancelBtn = alertBox.querySelector('.alert-btn-cancel');
                const confirmBtn = alertBox.querySelector('.alert-btn-confirm');
                
                if (cancelBtn) {
                    cancelBtn.onmouseover = () => { cancelBtn.style.background = 'rgba(255,255,255,0.1)'; cancelBtn.style.borderColor = '#666'; cancelBtn.style.color = '#fff'; };
                    cancelBtn.onmouseout = () => { cancelBtn.style.background = 'transparent'; cancelBtn.style.borderColor = '#444'; cancelBtn.style.color = '#aaa'; };
                    cancelBtn.onclick = () => { CustomAlert.remove(overlay); resolve({ isConfirmed: false, isClosed: true }); };
                }
                
                if (confirmBtn) {
                    confirmBtn.onmouseover = () => { confirmBtn.style.transform = 'translateY(-3px) scale(1.05)'; confirmBtn.style.boxShadow = '0 15px 35px rgba(255,215,0,0.5)'; };
                    confirmBtn.onmouseout = () => { confirmBtn.style.transform = 'translateY(0) scale(1)'; confirmBtn.style.boxShadow = '0 8px 25px rgba(255,215,0,0.4)'; };
                    confirmBtn.onclick = () => { CustomAlert.remove(overlay); resolve({ isConfirmed: true, isClosed: false }); };
                }
            }, 0);

            overlay.appendChild(alertBox);
            document.body.appendChild(overlay);
        });
    },

    // Loading/Processing dialog
    loading: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        options.type = 'info';
        options.duration = 0;

        this.removeAll();

        const settings = { ...this.config, ...options };
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        // Create alert-box
        const alertBox = document.createElement('div');
        alertBox.className = 'alert-box';
        alertBox.style.cssText += `
            background: ${settings.background};
            border: 2px solid ${settings.borderColor};
            box-shadow: 0 20px 60px rgba(0,0,0,0.7);
            padding: 30px 40px;
            text-align: center;
            min-width: 250px;
            animation: scaleIn 0.3s ease-out;
            margin: auto;
        `;
        
        alertBox.innerHTML = `
            <div class="alert-spinner" style="width: 50px; height: 50px; border: 4px solid rgba(255, 215, 0, 0.2); border-top-color: #ffd700; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
            <div class="alert-text">
                ${settings.title ? `<h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: ${settings.iconColor};">${settings.title}</h3>` : ''}
                ${settings.text ? `<p style="margin: 0; font-size: 14px; opacity: 0.9;">${settings.text}</p>` : ''}
            </div>
        `;

        // Add spin animation
        if (!document.getElementById('custom-alert-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-alert-styles';
            style.textContent = `
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes scaleIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);

        return {
            close: () => this.remove(overlay),
            overlay: overlay
        };
    },

    // Close loading
    closeLoading: function() {
        document.querySelectorAll('.overlay').forEach(overlay => this.remove(overlay));
    }
};

// Global function for backward compatibility with SweetAlert
window.Swal = {
    fire: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        
        // Map SweetAlert options to CustomAlert
        const settings = {
            title: options.title || '',
            text: options.text || '',
            icon: options.icon || 'info',
            duration: options.timer ? options.timer : (options.showConfirmButton === false ? 2000 : 3000),
            type: options.icon || 'info'
        };

        // Handle confirm-only dialogs (no cancel button)
        if (options.showConfirmButton !== false && options.showCancelButton === false && !options.buttons) {
            return CustomAlert.show(settings);
        }

        // Handle confirmation dialogs
        if (options.showCancelButton || options.buttons) {
            return CustomAlert.confirm({
                title: settings.title,
                text: settings.text,
                type: settings.type,
                confirmText: options.confirmButtonText || 'OK',
                cancelText: options.cancelButtonText || 'Cancel'
            });
        }

        // Default: show toast/alert
        return CustomAlert.show(settings);
    },
    
    // Alert (no icon)
    alert: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        return CustomAlert.show({
            title: options.title || '',
            text: options.text || '',
            type: options.type || 'info'
        });
    },
    
    // Success
    success: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        return CustomAlert.success(options);
    },
    
    // Error
    error: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        return CustomAlert.error(options);
    },
    
    // Warning
    warning: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        return CustomAlert.warning(options);
    },
    
    // Info
    info: function(options) {
        if (typeof options === 'string') {
            options = { text: options };
        }
        return CustomAlert.info(options);
    },
    
    // Confirm
    confirm: function(options) {
        return CustomAlert.confirm(options);
    },
    
    // Show loading
    showLoading: function() {
        return CustomAlert.loading({ text: 'Loading...' });
    },
    
    // Close
    close: function() {
        CustomAlert.removeAll();
    },

    // Clean up SweetAlert backdrops - call this after any Swal.fire
    cleanupBackdrop: function() {
        setTimeout(() => {
            document.querySelectorAll('.swal2-container').forEach(el => el.remove());
            document.querySelectorAll('.swal2-backdrop').forEach(el => el.remove());
            document.body.style.overflow = '';
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('width');
        }, 100);
    }
};

window.CustomAlert = CustomAlert;


