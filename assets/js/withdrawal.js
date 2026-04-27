let selectedMethod = 'jazzcash';
let currentUser = null;
let withdrawalHistoryData = [];
let withdrawalHistoryPage = 1;
const withdrawalHistoryPerPage = 10;
let filteredHistoryData = [];

function ctAlert(icon, title, message, callback) {
    const iconColor = icon === 'success' ? '#22c55e' : icon === 'error' ? '#ef4444' : icon === 'warning' ? '#f59e0b' : '#3b82f6';
    return Swal.fire({
        icon: icon,
        title: title,
        html: message.replace(/\n/g, '<br>'),
        confirmButtonColor: iconColor,
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        color: '#fff'
    }).then(() => {
        if (callback) callback();
    });
}

function getTypeLabel(type) {
    if (type === 'withdraw') return { label: 'Withdraw', color: '#ef4444', icon: 'fa-arrow-up' };
    if (type === 'convert_coins_to_pkr') return { label: 'Coin→PKR', color: '#22c55e', icon: 'fa-coins' };
    if (type === 'convert_pkr_to_coins') return { label: 'PKR→Coin', color: '#3b82f6', icon: 'fa-buy' };
    if (type === 'buy_coins') return { label: 'Buy Coins', color: '#3b82f6', icon: 'fa-shopping-cart' };
    return { label: type, color: '#888', icon: 'fa-exchange-alt' };
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadHistory();
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    
    const allowedDays = [28, 29];
    const today = new Date().getDate();
    const submitBtn = document.getElementById('submitBtn');
    const withdrawalNotice = document.getElementById('withdrawalNotice');
    
    if (!allowedDays.includes(today)) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Withdrawal Closed';
        }
        if (withdrawalNotice) {
            withdrawalNotice.style.background = 'rgba(255, 68, 68, 0.1)';
            withdrawalNotice.style.borderColor = 'var(--danger)';
            withdrawalNotice.style.color = 'var(--danger)';
            withdrawalNotice.innerHTML = '<i class="fas fa-lock"></i> <b>Withdrawal Closed:</b> Withdrawals are only allowed on 28th and 29th of each month.';
        }
    }
});

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.getElementById('pkrBalance').textContent = currentUser.pkrBalance || 0;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/login';
    }
}

function selectMethod(method) {
    selectedMethod = method;
    const label = document.getElementById('accountNumberLabel');
    const input = document.getElementById('accountNumber');
    
    if (method === 'bank') {
        if (label) label.textContent = 'Bank Number';
        if (input) input.placeholder = 'Enter full bank account number';
    } else {
        if (label) label.textContent = 'Account Number';
        if (input) input.placeholder = 'Enter account number';
    }
}

document.getElementById('withdrawalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const now = new Date();
    const day = now.getDate();
    const allowedDays = [28, 29];
    
    if (!allowedDays.includes(day)) {
        await Swal.fire({
            icon: 'error',
            title: 'Withdrawal Closed',
            text: 'Withdrawals are only allowed on 28th and 29th of each month.',
            confirmButtonColor: '#ef4444'
        });
        return;
    }
    
    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const formData = {
        amount: parseInt(document.getElementById('amount').value),
        accountNumber: document.getElementById('accountNumber').value,
        accountName: document.getElementById('accountName').value,
        method: selectedMethod
    };

    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/withdrawal/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            await ctAlert('success', 'Withdrawal Submitted!', `Your withdrawal request for ${formData.amount} PKR has been submitted.`);
            document.getElementById('withdrawalForm').reset();
            await loadHistory();
        } else {
            await ctAlert('error', 'Submission Failed', result.message || 'Failed to submit request');
        }
    } catch (error) {
        await ctAlert('error', 'Network Error', 'A connection error occurred. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

async function loadHistory() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            displayWithdrawalHistory();
            return;
        }
        const response = await fetch('/api/withdrawal/withdraw-history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            withdrawalHistoryData = data.history || [];
            filteredHistoryData = [...withdrawalHistoryData];
            withdrawalHistoryPage = 1;
            displayWithdrawalHistory();
        } else {
            withdrawalHistoryData = [];
            filteredHistoryData = [];
            displayWithdrawalHistory();
        }
    } catch (error) {
        console.error('History error:', error);
        withdrawalHistoryData = [];
        filteredHistoryData = [];
        displayWithdrawalHistory();
    }
}

function displayWithdrawalHistory() {
    filteredHistoryData = [...withdrawalHistoryData];
    displayFilteredHistory();
}

function displayFilteredHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (!filteredHistoryData || filteredHistoryData.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color: #888; padding: 20px;">No transactions found.</p>';
        return;
    }
    
    const totalPages = Math.ceil(filteredHistoryData.length / withdrawalHistoryPerPage);
    const startIndex = (withdrawalHistoryPage - 1) * withdrawalHistoryPerPage;
    const endIndex = startIndex + withdrawalHistoryPerPage;
    const pageItems = filteredHistoryData.slice(startIndex, endIndex);

    let html = pageItems.map(h => {
        const typeInfo = getTypeLabel(h.type);
        const isWithdraw = h.type === 'withdraw';
        return `
        <div class="history-item">
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:45px; height:45px; border-radius:50%; background:${typeInfo.color}20; display:flex; align-items:center; justify-content:center; color:${typeInfo.color};">
                    <i class="fas ${typeInfo.icon}"></i>
                </div>
                <div>
                    <div style="font-weight:700; color:${typeInfo.color}; margin-bottom:3px;">${typeInfo.label}</div>
                    ${isWithdraw 
                        ? `<div style="font-size:0.85rem; color:#C0C0C0;">${h.method?.toUpperCase()} - ${h.pkrAmount} PKR</div>` 
                        : `<div style="font-size:0.85rem; color:#C0C0C0;">${h.amount} coins = ${h.pkrAmount} PKR</div>`
                    }
                    <div style="font-size:0.7rem; color:#666; margin-top:3px;">${new Date(h.date).toLocaleString()}</div>
                </div>
            </div>
            <div class="status-badge status-${h.status?.toLowerCase() || 'completed'}">${h.status || 'completed'}</div>
        </div>
    `}).join('');

    if (totalPages > 1) {
        html += `
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                <button onclick="changePage(${withdrawalHistoryPage - 1})" ${withdrawalHistoryPage === 1 ? 'disabled' : ''} style="padding: 8px 16px; background: rgba(255,215,0,0.2); border: 1px solid rgba(255,215,0,0.4); border-radius: 8px; color: ${withdrawalHistoryPage === 1 ? '#666' : '#ffd700'}; cursor: ${withdrawalHistoryPage === 1 ? 'not-allowed' : 'pointer'};">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <span style="color: #aaa;">Page ${withdrawalHistoryPage} of ${totalPages}</span>
                <button onclick="changePage(${withdrawalHistoryPage + 1})" ${withdrawalHistoryPage >= totalPages ? 'disabled' : ''} style="padding: 8px 16px; background: rgba(255,215,0,0.2); border: 1px solid rgba(255,215,0,0.4); border-radius: 8px; color: ${withdrawalHistoryPage >= totalPages ? '#666' : '#ffd700'}; cursor: ${withdrawalHistoryPage >= totalPages ? 'not-allowed' : 'pointer'};">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    historyList.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredHistoryData.length / withdrawalHistoryPerPage);
    if (page >= 1 && page <= totalPages) {
        withdrawalHistoryPage = page;
        displayFilteredHistory();
    }
}

function filterHistory() {
    const search = document.getElementById('historySearch')?.value?.toLowerCase() || '';
    const typeFilter = document.getElementById('historyFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    filteredHistoryData = withdrawalHistoryData.filter(h => {
        const matchesSearch = !search || 
            (h.type && h.type.toLowerCase().includes(search)) ||
            (h.amount && h.amount.toString().includes(search)) ||
            (h.pkrAmount && h.pkrAmount.toString().includes(search)) ||
            (h.method && h.method.toLowerCase().includes(search));
        
        const matchesType = typeFilter === 'all' || h.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || (h.status || 'completed') === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    withdrawalHistoryPage = 1;
    displayFilteredHistory();
}