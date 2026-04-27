const ctalert = function(type, title, message) {
    if (typeof type === 'string' && title) {
        return ctalert.show({type: type, title: title, message: message || ''});
    }
    return ctalert.show(type);
};

ctalert.show = function(options) {
    const defaults = {
        title: 'Notification',
        message: '',
        type: 'info',
        position: 'top-end',
        duration: 3000,
        dismissible: true,
        callback: null
    };
    const settings = { ...defaults, ...options };
    
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-times-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    const toast = document.createElement('div');
    toast.className = `ctalert-toast ctalert-${settings.type} ctalert-${settings.position}`;
    toast.innerHTML = `
        <div class="ctalert-icon">${icons[settings.type] || icons.info}</div>
        <div class="ctalert-content">
            <div class="ctalert-title">${settings.title}</div>
            <div class="ctalert-message">${settings.message}</div>
        </div>
        ${settings.dismissible ? '<button class="ctalert-close">&times;</button>' : ''}
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .ctalert-toast {
            position: fixed;
            z-index: 99999;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.1);
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-width: 300px;
            max-width: 400px;
            animation: ctalertSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-left: 4px solid #FFD700;
        }
        .ctalert-toast.ctalert-success { border-left-color: #00ff88; }
        .ctalert-toast.ctalert-error { border-left-color: #ff4757; }
        .ctalert-toast.ctalert-warning { border-left-color: #ffc107; }
        .ctalert-toast.ctalert-info { border-left-color: #74b9ff; }
        .ctalert-toast.ctalert-top-end { top: 100px; right: 20px; }
        .ctalert-toast.ctalert-top-start { top: 100px; left: 20px; }
        .ctalert-toast.ctalert-top-center { top: 100px; left: 50%; transform: translateX(-50%) scale(0.9); }
        .ctalert-toast.ctalert-bottom-end { bottom: 20px; right: 20px; }
        .ctalert-toast.ctalert-bottom-start { bottom: 20px; left: 20px; }
        .ctalert-toast.ctalert-bottom-center { bottom: 20px; left: 50%; transform: translateX(-50%) scale(0.9); }
        .ctalert-toast.ctalert-center { top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); }
        .ctalert-icon {
            font-size: 1.4rem;
            line-height: 1;
        }
        .ctalert-success .ctalert-icon { color: #00ff88; }
        .ctalert-error .ctalert-icon { color: #ff4757; }
        .ctalert-warning .ctalert-icon { color: #ffc107; }
        .ctalert-info .ctalert-icon { color: #74b9ff; }
        .ctalert-content { flex: 1; }
        .ctalert-title {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 4px;
        }
        .ctalert-message {
            font-size: 0.9rem;
            color: #ccc;
            line-height: 1.4;
        }
        .ctalert-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .ctalert-close:hover { color: #fff; }
        @keyframes ctalertSlideIn {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ctalertFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .ctalert-toast.ctalert-hide {
            animation: ctalertFadeOut 0.3s ease forwards;
        }
        .ctalert-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        .ctalert-btn:hover { transform: translateY(-2px); }
        .ctalert-btn-secondary {
            background: #444;
            color: #fff;
        }
        .ctalert-btn-secondary:hover { background: #555; }
    `;
    
    if (!document.getElementById('ctalert-styles')) {
        style.id = 'ctalert-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    if (settings.dismissible) {
        const closeBtn = toast.querySelector('.ctalert-close');
        closeBtn.onclick = () => ctalert.hide(toast);
    }
    
    if (settings.duration > 0) {
        setTimeout(() => {
            if (toast.parentNode) ctalert.hide(toast);
        }, settings.duration);
    }
    
    return toast;
};

ctalert.hide = function(toast) {
    if (toast && toast.parentNode) {
        toast.classList.add('ctalert-hide');
        setTimeout(() => toast.remove(), 300);
    }
};

ctalert.success = function(message, title = 'Success') {
    return ctalert.show({ title, message, type: 'success' });
};

ctalert.error = function(message, title = 'Error') {
    return ctalert.show({ title, message, type: 'error', duration: 4000 });
};

ctalert.warning = function(message, title = 'Warning') {
    return ctalert.show({ title, message, type: 'warning', duration: 3500 });
};

ctalert.info = function(message, title = 'Info') {
    return ctalert.show({ title, message, type: 'info' });
};

ctalert.modal = function(options) {
    const defaults = {
        title: 'Confirm',
        message: '',
        type: 'info',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onCancel: null
    };
    const settings = { ...defaults, ...options };
    
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-times-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    const overlay = document.createElement('div');
    overlay.className = 'ctalert-modal-overlay';
    overlay.innerHTML = `
        <div class="ctalert-modal">
            <div class="ctalert-modal-icon ctalert-modal-${settings.type}">
                ${icons[settings.type] || icons.info}
            </div>
            <h3 class="ctalert-modal-title">${settings.title}</h3>
            <p class="ctalert-modal-message">${settings.message}</p>
            <div class="ctalert-modal-buttons">
                <button class="ctalert-btn ctalert-btn-secondary" id="ctalert-cancel">${settings.cancelText}</button>
                <button class="ctalert-btn" id="ctalert-confirm">${settings.confirmText}</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .ctalert-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: ctalertFadeIn 0.3s ease;
        }
        .ctalert-modal {
            background: linear-gradient(145deg, #1e1e3f, #252550);
            border: 2px solid #FFD700;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: ctalertModalSlide 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .ctalert-modal-icon {
            font-size: 4rem;
            margin-bottom: 15px;
        }
        .ctalert-modal-success .ctalert-modal-icon { color: #00ff88; }
        .ctalert-modal-error .ctalert-modal-icon { color: #ff4757; }
        .ctalert-modal-warning .ctalert-modal-icon { color: #ffc107; }
        .ctalert-modal-info .ctalert-modal-icon { color: #74b9ff; }
        .ctalert-modal-title {
            font-size: 1.5rem;
            color: #FFD700;
            margin: 0 0 10px 0;
        }
        .ctalert-modal-message {
            color: #ccc;
            margin: 0 0 25px 0;
            line-height: 1.5;
        }
        .ctalert-modal-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        .ctalert-modal-buttons .ctalert-btn {
            min-width: 120px;
        }
        @keyframes ctalertFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes ctalertModalSlide {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    
    if (!document.getElementById('ctalert-modal-styles')) {
        style.id = 'ctalert-modal-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    
    document.getElementById('ctalert-cancel').onclick = () => {
        if (settings.onCancel) settings.onCancel();
        overlay.remove();
    };
    
    document.getElementById('ctalert-confirm').onclick = () => {
        if (settings.onConfirm) settings.onConfirm();
        overlay.remove();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            if (settings.onCancel) settings.onCancel();
            overlay.remove();
        }
    };
    
    return overlay;
};

ctalert.confirm = function(message, title = 'Confirm', onConfirm = null, onCancel = null) {
    return ctalert.modal({
        title: title,
        message: message,
        type: 'warning',
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm: onConfirm,
        onCancel: onCancel
    });
};

ctalert.html = function(options) {
    const defaults = {
        title: 'Notice',
        html: '',
        confirmText: 'OK',
        onConfirm: null
    };
    const settings = { ...defaults, ...options };
    
    const overlay = document.createElement('div');
    overlay.className = 'ctalert-modal-overlay';
    overlay.innerHTML = `
        <div class="ctalert-modal">
            <h3 class="ctalert-modal-title">${settings.title}</h3>
            <div class="ctalert-modal-html">${settings.html}</div>
            <div class="ctalert-modal-buttons">
                ${settings.showCancel ? `<button class="ctalert-btn ctalert-btn-secondary" id="ctalert-cancel">${settings.cancelText}</button>` : ''}
                <button class="ctalert-btn" id="ctalert-confirm">${settings.confirmText}</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .ctalert-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: ctalertFadeIn 0.3s ease;
        }
        .ctalert-modal {
            background: linear-gradient(145deg, #1e1e3f, #252550);
            border: 2px solid #FFD700;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: ctalertModalSlide 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .ctalert-modal-title {
            font-size: 1.5rem;
            color: #FFD700;
            margin: 0 0 20px 0;
        }
        .ctalert-modal-html {
            color: #ccc;
            margin: 0 0 25px 0;
            line-height: 1.5;
            text-align: left;
        }
        .ctalert-modal-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        .ctalert-modal-buttons .ctalert-btn {
            min-width: 120px;
        }
        @keyframes ctalertFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes ctalertModalSlide {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    
    if (!document.getElementById('ctalert-html-styles')) {
        style.id = 'ctalert-html-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    
    document.getElementById('ctalert-confirm').onclick = () => {
        if (settings.onConfirm) settings.onConfirm();
        overlay.remove();
    };
    
    return overlay;
};

ctalert.loading = function(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'ctalert-modal-overlay';
    overlay.innerHTML = `
        <div class="ctalert-loading">
            <div class="ctalert-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .ctalert-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ctalert-loading {
            text-align: center;
            color: #FFD700;
        }
        .ctalert-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 215, 0, 0.3);
            border-top-color: #FFD700;
            border-radius: 50%;
            animation: ctalertSpin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes ctalertSpin {
            to { transform: rotate(360deg); }
        }
    `;
    
    if (!document.getElementById('ctalert-loading-styles')) {
        style.id = 'ctalert-loading-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    return overlay;
};

window.ctalert = ctalert;
