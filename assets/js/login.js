const swalTheme = {
    background: 'rgba(26, 26, 46, 0.95)',
    color: '#ffffff',
    confirmButtonColor: '#FFD700',
    cancelButtonColor: '#e17055',
    backdrop: 'rgba(0, 0, 0, 0.8)'
};

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + '-toggle-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function showValidation(input, errorId, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearValidation(input, errorId) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('password');

if (loginInput) {
    loginInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (!value) {
            clearValidation(this, 'loginInput-error');
            return;
        }
        clearValidation(this, 'loginInput-error');
    });
}

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const value = this.value;
        if (!value) {
            clearValidation(this, 'password-error');
            return;
        }
        clearValidation(this, 'password-error');
    });
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalHTML = submitBtn.innerHTML;

    const loginInputValue = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('password').value;

    if (!loginInputValue) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Validation Error', 
            text: 'Please enter your username or email.', 
            ...swalTheme 
        });
        return;
    }

    if (!password) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Validation Error', 
            text: 'Please enter your password.', 
            ...swalTheme 
        });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing In...</span>';

    const data = {
        username: loginInputValue,
        password: password
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            sessionStorage.setItem('token', result.token);
            sessionStorage.setItem('user', JSON.stringify(result.user));

            const username = result.user?.username || 'User';
            
            // Show success alert and redirect after 5 seconds
            if (result.isAdmin) {
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back, ' + username + '!',
                    text: 'Login successful! Redirecting to admin panel...',
                    timer: 5000,
                    showConfirmButton: false,
                    ...swalTheme
                });
                setTimeout(() => {
                    window.location.href = '/admin/dashboard.html';
                }, 5000);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back, ' + username + '!',
                    text: 'Login successful! Redirecting to tools...',
                    timer: 5000,
                    showConfirmButton: false,
                    ...swalTheme
                });
                setTimeout(() => {
                    window.location.href = '/tools';
                }, 5000);
            }
        } else {
            let title = 'Login Failed';
            let text = result.error || 'An error occurred. Please try again.';

            if (result.requiresVerification) {
                title = 'Email Verification Required';
                text = result.message || 'Please verify your email before logging in.';
                Swal.fire({ 
                    icon: 'warning', 
                    title: title, 
                    html: `<p style="margin-bottom: 10px;">${text}</p>
                           <p style="color: #ff6b6b; font-size: 13px;">📧 Check your <strong>inbox AND spam folder</strong> for verification email!</p>
                           <p style="color: #888; font-size: 12px; margin-top: 10px;">Didn't receive email?</p>`,
                    confirmButtonText: '<i class="fas fa-paper-plane"></i> Resend Verification Email',
                    confirmButtonColor: '#1976d2',
                    background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                    color: '#fff',
                    timer: 15000,
                    showConfirmButton: true
                }).then((swalResult) => {
                    if (swalResult.isConfirmed || swalResult.dismiss === Swal.DismissReason.timer) {
                        const redirectUrl = result.resendUrl || '/resend-verification';
                        window.location.href = redirectUrl;
                    }
                });
            } else if (result.banned) {
                title = 'Account Suspended';
                text = result.message || 'Your account has been suspended.';
            }

            Swal.fire({ 
                icon: 'error', 
                title, 
                text, 
                ...swalTheme 
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    } catch (error) {
        console.error('Login error:', error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Connection Error', 
            text: 'Please check your connection and try again.', 
            ...swalTheme 
        });
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

// Login method toggle
const methodButtons = document.querySelectorAll('.method-toggle .method-btn');
methodButtons.forEach(button => {
    button.addEventListener('click', function() {
        methodButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const method = this.dataset.method;
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
        document.querySelector(`.auth-form[data-method="${method}"]`).style.display = 'flex';
    });
});

// Token validation
async function validateToken(token) {
    try {
        const response = await fetch('/api/login/validate-token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            },
            body: JSON.stringify({ refreshToken: token })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        return { valid: false, error: 'Connection error' };
    }
}

function showTokenPreview(result) {
    const formGroup = document.getElementById('tokenInput').closest('.form-group');
    let existingPreview = formGroup.querySelector('.token-preview');
    if (existingPreview) {
        existingPreview.remove();
    }

    const preview = document.createElement('div');
    preview.className = 'token-preview';
    
    if (!result.valid) {
        preview.classList.add('token-invalid');
        preview.innerHTML = `
            <div class="token-preview-header token-invalid-header">
                <i class="fas fa-times-circle"></i>
                <span>${result.error || 'Invalid Token'}</span>
            </div>
            <p class="token-error-desc">Please check your token or login with credentials.</p>
        `;
    } else {
        const expiresDate = result.expires ? new Date(result.expires) : null;
        const isExpired = result.isExpired;
        
        preview.innerHTML = `
            <div class="token-preview-header ${isExpired ? 'token-expired-header' : 'token-valid-header'}">
                <i class="fas fa-${isExpired ? 'times-circle' : 'check-circle'}"></i>
                <span>${isExpired ? 'Token Expired' : 'Token Valid'}</span>
            </div>
            <div class="token-info-item">
                <span class="token-info-label"><i class="fas fa-user"></i> Username:</span>
                <span class="token-info-value">${result.username || 'Unknown'}</span>
            </div>
            ${expiresDate ? `
            <div class="token-info-item">
                <span class="token-info-label"><i class="fas fa-clock"></i> Expires:</span>
                <span class="token-info-value ${isExpired ? 'token-status-expired' : 'token-status-valid'}">
                    ${expiresDate.toLocaleDateString()} ${expiresDate.toLocaleTimeString()}
                </span>
            </div>
            ` : ''}
        `;
    }
    formGroup.appendChild(preview);
}

const tokenInput = document.getElementById('tokenInput');
if (tokenInput) {
    let tokenValidationTimeout;
    tokenInput.addEventListener('input', function() {
        clearTimeout(tokenValidationTimeout);
        const token = this.value.trim();
        
        if (!token) {
            const preview = document.querySelector('.token-preview');
            if (preview) preview.remove();
            return;
        }
        
        tokenValidationTimeout = setTimeout(async () => {
            const result = await validateToken(token);
            showTokenPreview(result);
        }, 800);
    });
}

// Token login form
document.getElementById('tokenLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('tokenSubmitBtn');
    const originalHTML = submitBtn.innerHTML;
    const tokenInputValue = document.getElementById('tokenInput').value.trim();

    if (!tokenInputValue) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Validation Error', 
            text: 'Please enter your token.', 
            ...swalTheme 
        });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Verifying Token...</span>';

    try {
        const response = await fetch('/api/login/token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            },
            body: JSON.stringify({ refreshToken: tokenInputValue })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            sessionStorage.setItem('token', result.token);
            sessionStorage.setItem('user', JSON.stringify(result.user));

            const username = result.user?.username || 'User';
            
            // Show success alert and redirect after 5 seconds
            if (result.isAdmin) {
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back, ' + username + '!',
                    text: 'Login successful! Redirecting to admin panel...',
                    timer: 5000,
                    showConfirmButton: false,
                    ...swalTheme
                });
                setTimeout(() => {
                    window.location.href = '/admin/dashboard.html';
                }, 5000);
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back, ' + username + '!',
                    text: 'Login successful! Redirecting to tools...',
                    timer: 5000,
                    showConfirmButton: false,
                    ...swalTheme
                });
                setTimeout(() => {
                    window.location.href = '/tools';
                }, 5000);
            }
        } else {
            let title = 'Token Login Failed';
            let text = result.error || 'Invalid or expired token. Please login with credentials.';

            if (result.sessionExpired) {
                title = 'Session Expired';
                text = result.message || 'Your session has expired. Please login again.';
            }

            Swal.fire({ 
                icon: 'error', 
                title, 
                text, 
                ...swalTheme 
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    } catch (error) {
        console.error('Token login error:', error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Connection Error', 
            text: 'Please check your connection and try again.', 
            ...swalTheme 
        });
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

// Handle signup success redirect
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('signup') === 'success') {
        const message = urlParams.get('message');
        
        Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: decodeURIComponent(message || 'Your account has been created successfully. Please login to continue.'),
            ...swalTheme
        });
        
        window.history.replaceState({}, document.title, '/login');
    }
    
    // Update copyright year
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
