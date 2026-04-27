const swalTheme = {
    background: 'rgba(26, 26, 46, 0.95)',
    color: '#ffffff',
    confirmButtonColor: '#FFD700',
    cancelButtonColor: '#e17055',
    backdrop: 'rgba(0, 0, 0, 0.8)'
};

// Handle referral code from URL parameter
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        const referralInput = document.getElementById('referralCode');
        if (referralInput) {
            referralInput.value = refCode.toUpperCase();
            
            const referralStatus = document.getElementById('referralStatus');
            if (referralStatus) {
                referralStatus.style.display = 'block';
                referralStatus.style.background = 'rgba(255, 215, 0, 0.1)';
                referralStatus.style.border = '1px solid rgba(255, 215, 0, 0.3)';
                referralStatus.style.color = '#FFD700';
                referralStatus.innerHTML = '<i class="fas fa-check-circle"></i> Referral code applied from link';
            }
        }
        
        trackReferralLinkView(refCode);
    }
});

async function trackReferralLinkView(refCode) {
    try {
        await fetch('/api/user/track-referral-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode: refCode })
        });
    } catch (error) {
    }
}

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

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const famousEmailProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'aol.com',
    'yandex.com', 'mail.ru', 'inbox.com', 'fastmail.com', 'gmx.com'
];

function showValidation(input, errorId, message) {
    input.classList.add('invalid');
    input.classList.remove('valid');
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearValidation(input, errorId) {
    input.classList.remove('invalid');
    input.classList.add('valid');
    const errorElement = document.getElementById(errorId);
    errorElement.classList.remove('show');
}

function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    updateRequirement('length-req', requirements.length);
    updateRequirement('capital-req', requirements.capital);
    updateRequirement('number-req', requirements.number);
    updateRequirement('symbol-req', requirements.symbol);

    const allValid = Object.values(requirements).every(req => req);

    if (!password) {
        clearValidation(passwordInput, 'password-error');
        return false;
    }

    if (!allValid) {
        showValidation(passwordInput, 'password-error', 'Password must meet all requirements above');
        return false;
    }

    clearValidation(passwordInput, 'password-error');
    return true;
}

function updateRequirement(id, isValid) {
    const element = document.getElementById(id);
    const icon = element.querySelector('i');
    if (isValid) {
        element.classList.add('valid');
        icon.className = 'fas fa-check';
    } else {
        element.classList.remove('valid');
        icon.className = 'fas fa-times';
    }
}

function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const indicator = document.getElementById('password-match-indicator');
    const matchIcon = document.getElementById('match-icon');
    const matchText = document.getElementById('match-text');

    if (!confirmPassword) {
        indicator.className = 'password-match-indicator';
        clearValidation(confirmPasswordInput, 'confirmPassword-error');
        return;
    }

    if (password === confirmPassword) {
        indicator.className = 'password-match-indicator match';
        matchIcon.className = 'fas fa-check';
        matchText.textContent = 'Passwords match';
        clearValidation(confirmPasswordInput, 'confirmPassword-error');
    } else {
        indicator.className = 'password-match-indicator no-match';
        matchIcon.className = 'fas fa-times';
        matchText.textContent = 'Passwords do not match';
        showValidation(confirmPasswordInput, 'confirmPassword-error', 'Passwords do not match');
    }
}

usernameInput.addEventListener('input', function() {
    const value = this.value;
    const usernameRegex = /^[a-z0-9_]+$/;

    if (!value) {
        clearValidation(this, 'username-error');
        return;
    }

    if (value.length < 5) {
        showValidation(this, 'username-error', 'Username must be at least 5 characters');
        return;
    }

    if (value.length > 20) {
        showValidation(this, 'username-error', 'Username cannot exceed 20 characters');
        return;
    }

    if (!usernameRegex.test(value)) {
        showValidation(this, 'username-error', 'Only lowercase letters, numbers, and underscores');
        return;
    }

    clearValidation(this, 'username-error');
});

emailInput.addEventListener('input', function() {
    const value = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
        clearValidation(this, 'email-error');
        return;
    }

    if (!emailRegex.test(value)) {
        showValidation(this, 'email-error', 'Please enter a valid email address (e.g., user@gmail.com)');
        return;
    }

    const domain = value.split('@')[1];
    if (!famousEmailProviders.includes(domain)) {
        showValidation(this, 'email-error', 'Please use Gmail, Yahoo, Outlook, Hotmail, iCloud, or ProtonMail');
        return;
    }

    clearValidation(this, 'email-error');
});

passwordInput.addEventListener('input', function() {
    validatePassword(this.value);
    if (confirmPasswordInput.value) {
        checkPasswordMatch();
    }
});

confirmPasswordInput.addEventListener('input', checkPasswordMatch);

document.querySelectorAll('.gender-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.gender-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        this.classList.add('selected');
        const genderValue = this.getAttribute('data-value');
        document.getElementById('gender').value = genderValue;
    });
});

function copyNewUserReferralCode() {
    const code = document.getElementById('newUserReferralCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Referral code copied to clipboard',
            timer: 1500,
            showConfirmButton: false,
            ...swalTheme
        });
    });
}

function copyVerificationUserReferralCode() {
    const code = document.getElementById('verificationUserReferralCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Referral code copied to clipboard',
            timer: 1500,
            showConfirmButton: false,
            ...swalTheme
        });
    });
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalHTML = submitBtn.innerHTML;

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const gender = document.getElementById('gender').value;

    if (!username || username.length < 5) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Username must be at least 5 characters.', ...swalTheme });
        return;
    }

    if (!email || !email.includes('@')) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please enter a valid email (e.g., user@gmail.com)', ...swalTheme });
        return;
    }

    if (!password || password.length < 8) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Password must be at least 8 characters.', ...swalTheme });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Passwords do not match.', ...swalTheme });
        return;
    }

    if (!gender) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please select your gender.', ...swalTheme });
        return;
    }

    const referralCode = document.getElementById('referralCode').value.trim();
    if (referralCode && referralCode.length !== 8) {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Referral code must be exactly 8 characters.', ...swalTheme });
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Creating Account...</span>';

    // Build only the required fields for the backend
    const data = {
        username: username,
        email: email,
        password: password,
        gender: gender
    };
    if (referralCode) data.referralCode = referralCode.toUpperCase();

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.status === 502 || response.status === 503) {
            Swal.fire({ icon: 'error', title: 'Server Unavailable', text: 'Please try again in a few minutes.', ...swalTheme });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            Swal.fire({ icon: 'error', title: 'Server Error', text: 'Unexpected response. Please try again.', ...swalTheme });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            return;
        }

        const result = await response.json();

        if (result.success) {
            const email = encodeURIComponent(result.email);
            const username = encodeURIComponent(result.username);
            let message = result.message || 'Account created successfully!';
            
            // Add email check note if exists
            if (result.emailCheckNote) {
                message += '\n\n' + result.emailCheckNote;
            }
            
            // Show success message with email check reminder
            Swal.fire({
                icon: 'success',
                title: '✅ Account Created!',
                html: `<p style="font-size: 16px; margin-bottom: 15px;">${message}</p>
                       <p style="color: #ff6b6b; font-size: 14px;">📧 <strong>Check BOTH inbox AND spam folder!</strong></p>`,
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#FFD700',
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                color: '#fff'
            }).then(() => {
                window.location.href = `/login?signup=success&email=${encodeURIComponent(result.email)}&username=${encodeURIComponent(result.username)}`;
            });
        } else {
            let title = 'Registration Failed';
            let text = result.error || 'An error occurred. Please try again.';

            if (result.code === 'IP_LIMIT_EXCEEDED') {
                title = 'Account Limit Reached';
                text = result.message;
            } else if (result.error && result.error.includes('already registered')) {
                title = 'Email Already Registered';
                text = 'This email is already in use. Please login or use a different email.';
            } else if (result.error && result.error.includes('already exists')) {
                title = 'Username Taken';
                text = 'This username is already taken. Please choose another.';
            }

            Swal.fire({ icon: 'error', title, text, ...swalTheme });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    } catch (error) {
        console.error('Signup error:', error);
        Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Please check your connection and try again.', ...swalTheme });
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

async function detectUserIP() {
    const ipInput = document.getElementById('ipAddress');
    try {
        const response = await fetch('/api/get-user-ip');
        if (response.ok) {
            const data = await response.json();
            ipInput.value = data.ip || 'Unknown';
        } else {
            const fallbackResponse = await fetch('https://api.ipify.org?format=json');
            const fallbackData = await fallbackResponse.json();
            ipInput.value = fallbackData.ip || 'Unknown';
        }
    } catch (error) {
        ipInput.value = 'Detection failed';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    detectUserIP();
});

// Auto-update copyright year
var yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
