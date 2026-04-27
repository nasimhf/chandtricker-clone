let allTickets = [];
let currentTicket = null;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadTickets();
    setupEventListeners();
    
    // Auto-refresh tickets every 30 seconds for real-time unread updates
    setInterval(loadTickets, 30000);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Login Required',
                text: 'You need to be logged in to access support tickets.',
                icon: 'warning',
                confirmButtonColor: '#FFD700',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                window.location.href = '/login?returnTo=/support-tickets';
            });
        } else {
            window.location.href = '/login?returnTo=/support-tickets';
        }
        return false;
    }
    return true;
}

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    const messageTextarea = document.getElementById('ticketMessage');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', function() {
            const charCount = document.getElementById('charCount');
            if (charCount) charCount.textContent = this.value.length;
        });
    }

    const replyInput = document.getElementById('replyMessage');
    if (replyInput) {
        replyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendReply();
            }
        });
    }

    const createTicketModal = document.getElementById('createTicketModal');
    if (createTicketModal) {
        createTicketModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideCreateTicketModal();
            }
        });
    }
}

async function loadTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/chat/my-tickets', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if (data.success) {
            allTickets = data.tickets;
            updateStats();
            displayTickets();
        } else {
            showError('Failed to load tickets');
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        showError('Failed to load tickets. Please try again.');
    }
}

function updateStats() {
    const total = allTickets.length;
    const pending = allTickets.filter(t => t.status === 'pending').length;
    const open = allTickets.filter(t => t.status === 'open').length;
    const closed = allTickets.filter(t => t.status === 'closed').length;

    const totalEl = document.getElementById('totalTickets');
    const pendingEl = document.getElementById('pendingTickets');
    const openEl = document.getElementById('openTickets');
    const closedEl = document.getElementById('closedTickets');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (openEl) openEl.textContent = open;
    if (closedEl) closedEl.textContent = closed;
}

function displayTickets() {
    const ticketsList = document.getElementById('ticketsList');
    const emptyState = document.getElementById('emptyState');
    const ticketsContent = document.querySelector('.tickets-content');

    if (!ticketsList || !emptyState || !ticketsContent) return;

    let filteredTickets = allTickets;

    if (currentFilter !== 'all') {
        filteredTickets = allTickets.filter(t => t.status === currentFilter);
    }

    if (allTickets.length === 0) {
        ticketsContent.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    ticketsContent.style.display = 'block';
    emptyState.style.display = 'none';

    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-filter"></i>
                <p>No ${currentFilter} tickets found.</p>
            </div>
        `;
        return;
    }

    ticketsList.innerHTML = filteredTickets.map(ticket => {
        const hasUnread = ticket.unreadCount > 0;
        const avatarSrc = ticket.userAvatar || '';
        return `
            <div class="ticket-item ${hasUnread ? 'unread' : ''}" onclick="openTicketDetail('${ticket.id}')">
                <img class="ticket-avatar" src="${avatarSrc}" alt="${ticket.username || 'User'}">
                <div class="ticket-item-content">
                    <div class="ticket-item-header">
                        <div class="ticket-item-title">
                            <span class="ticket-number">#${ticket.ticketNumber || 'N/A'}</span>
                            <span class="ticket-subject">${escapeHtml(ticket.subject)}</span>
                            ${hasUnread ? `<span class="unread-badge">New</span>` : ''}
                            <span class="ticket-category ${ticket.category || 'other'}">${getCategoryLabel(ticket.category)}</span>
                        </div>
                        <span class="ticket-status ${ticket.status}">${getStatusLabel(ticket.status)}</span>
                    </div>
                    <div class="ticket-item-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(ticket.createdAt)}</span>
                        <span><i class="fas fa-clock"></i> Updated: ${formatRelativeTime(ticket.lastUpdated)}</span>
                        <span><i class="fas fa-comments"></i> ${ticket.messageCount || 0} messages</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterTickets(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    displayTickets();
}

async function openTicketDetail(ticketId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`/api/chat/ticket/${ticketId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        if (data.success) {
            currentTicket = data.ticket;
            displayTicketDetail(data.ticket, data.messages);
        } else {
            showError('Failed to load ticket details');
        }
    } catch (error) {
        console.error('Error loading ticket:', error);
        showError('Failed to load ticket details');
    }
}

function displayTicketDetail(ticket, messages) {
    const ticketsListEl = document.getElementById('ticketsList');
    const ticketsFilterEl = document.querySelector('.tickets-filter');
    const ticketDetailEl = document.getElementById('ticketDetail');
    const detailTicketNumber = document.getElementById('detailTicketNumber');
    const detailSubject = document.getElementById('detailSubject');
    const detailStatus = document.getElementById('detailStatus');
    const detailCreated = document.getElementById('detailCreated');
    const detailUpdated = document.getElementById('detailUpdated');
    const detailCategory = document.getElementById('detailCategory');

    if (ticketsListEl) ticketsListEl.style.display = 'none';
    if (ticketsFilterEl) ticketsFilterEl.style.display = 'none';
    if (ticketDetailEl) ticketDetailEl.style.display = 'flex';

    if (detailTicketNumber) detailTicketNumber.textContent = `#${ticket.ticketNumber || 'N/A'}`;
    if (detailSubject) detailSubject.textContent = ticket.subject;
    if (detailStatus) {
        detailStatus.textContent = getStatusLabel(ticket.status);
        detailStatus.className = `ticket-status ${ticket.status}`;
    }
    if (detailCreated) detailCreated.textContent = formatDate(ticket.createdAt);
    if (detailUpdated) detailUpdated.textContent = formatRelativeTime(ticket.lastUpdated);
    if (detailCategory) {
        detailCategory.textContent = getCategoryLabel(ticket.category);
        detailCategory.className = `ticket-category-text ${ticket.category || 'other'}`;
    }

    const closeBtn = document.getElementById('closeTicketBtn');
    const replySection = document.getElementById('replySection');

    if (ticket.status === 'closed') {
        closeBtn.style.display = 'none';
        replySection.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-muted); background: rgba(255, 107, 107, 0.05); border-radius: 14px; border: 1px dashed var(--status-closed);">
                <i class="fas fa-lock" style="font-size: 2rem; margin-bottom: 15px; color: var(--status-closed); display: block;"></i>
                <h3 style="color: var(--status-closed); margin-bottom: 10px; font-family: 'Orbitron', sans-serif;">Ticket Closed</h3>
                <p>This ticket has been resolved and closed. You cannot send new messages to this ticket.</p>
                <button class="btn-back" onclick="closeTicketDetail()" style="margin: 20px auto 0; justify-content: center; width: auto; padding: 10px 25px;">
                    <i class="fas fa-arrow-left"></i> Back to Tickets
                </button>
            </div>
        `;
    } else {
        closeBtn.style.display = 'flex';
        replySection.innerHTML = `
            <div class="reply-input-container">
                <textarea id="replyMessage" placeholder="Type your message here..." rows="3"></textarea>
                <button class="btn-send" onclick="sendReply()">
                    <i class="fas fa-paper-plane"></i> Send
                </button>
            </div>
        `;
    }

    displayMessages(messages);

    const replyInput = document.getElementById('replyMessage');
    if (replyInput) {
        replyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendReply();
            }
        });
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-comments"></i>
                <p>No messages yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isMe = !msg.isAdmin; // In user view, "user" is Me, "admin" is receiver
        const avatarHtml = msg.isAdmin 
            ? `<div class="message-avatar"><img src="https://cdn.jsdelivr.net/gh/chanddark/Image1/images/icon.png" alt="Support" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`
            : `<div class="message-avatar">${msg.avatar 
                ? `<img src="${msg.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                : `<i class="fas fa-user"></i>`}</div>`;
        
        return `
            <div class="message ${isMe ? 'admin' : 'user'}">
                ${avatarHtml}
                <div class="message-content">
                    <div class="message-sender">
                        ${msg.isAdmin ? '<i class="fas fa-shield-alt"></i> Support Team' : escapeHtml(msg.username)}
                    </div>
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <div class="message-time">${formatDateTime(msg.timestamp)}</div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function closeTicketDetail() {
    currentTicket = null;
    document.getElementById('ticketDetail').style.display = 'none';
    document.getElementById('ticketsList').style.display = 'flex';
    document.querySelector('.tickets-filter').style.display = 'flex';
    loadTickets();
}

async function sendReply() {
    if (!currentTicket) return;

    const replyInput = document.getElementById('replyMessage');
    const message = replyInput.value.trim();

    if (!message) {
        Swal.fire({
            title: 'Empty Message',
            text: 'Please enter a message.',
            icon: 'warning',
            confirmButtonColor: '#FFD700'
        });
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/chat/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                ticketId: currentTicket.id,
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            replyInput.value = '';
            openTicketDetail(currentTicket.id);

            Swal.fire({
                title: 'Message Sent!',
                text: 'Your message has been sent successfully.',
                icon: 'success',
                confirmButtonColor: '#FFD700',
                timer: 2000,
                timerProgressBar: true
            });
        } else {
            if (response.status === 403) {
                Swal.fire({
                    title: 'Action Restricted',
                    text: data.message || 'You cannot send more messages while the ticket is Pending.',
                    icon: 'warning',
                    confirmButtonColor: '#FFD700'
                });
            } else {
                showError(data.error || 'Failed to send message');
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message. Please try again.');
    }
}

async function closeCurrentTicket() {
    if (!currentTicket) return;

    const result = await Swal.fire({
        title: 'Close Ticket?',
        text: 'Are you sure you want to close this ticket?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#FFD700',
        cancelButtonColor: '#ff6b6b',
        confirmButtonText: 'Yes, close it',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/chat/close-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                ticketId: currentTicket.id
            })
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                title: 'Ticket Closed',
                text: 'Your ticket has been closed successfully.',
                icon: 'success',
                confirmButtonColor: '#FFD700'
            });
            closeTicketDetail();
        } else {
            showError(data.error || 'Failed to close ticket');
        }
    } catch (error) {
        console.error('Error closing ticket:', error);
        showError('Failed to close ticket. Please try again.');
    }
}

function showCreateTicketModal() {
    document.getElementById('createTicketModal').classList.add('active');
    document.getElementById('ticketSubject').focus();
    checkRemainingTickets();
}

function hideCreateTicketModal() {
    document.getElementById('createTicketModal').classList.remove('active');
    document.getElementById('createTicketForm').reset();
    document.getElementById('charCount').textContent = '0';
}

async function checkRemainingTickets() {
    const today = new Date().toDateString();
    const todayTickets = allTickets.filter(t => 
        new Date(t.createdAt).toDateString() === today
    );
    const remaining = Math.max(0, 3 - todayTickets.length);
    document.getElementById('remainingTickets').textContent = remaining;
}

async function createTicket(event) {
    event.preventDefault();

    const subject = document.getElementById('ticketSubject').value.trim();
    const category = document.getElementById('ticketCategory').value;
    const message = document.getElementById('ticketMessage').value.trim();

    if (!subject || !message || !category) {
        Swal.fire({
            title: 'Missing Information',
            text: 'Please fill in all required fields.',
            icon: 'warning',
            confirmButtonColor: '#FFD700'
        });
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/chat/create-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                subject: subject,
                category: category,
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            hideCreateTicketModal();

            Swal.fire({
                title: 'Ticket Created!',
                html: `Your ticket <strong>#${data.ticket.ticketNumber}</strong> has been submitted successfully.<br><br>Our support team will respond soon.`,
                icon: 'success',
                confirmButtonColor: '#FFD700'
            });

            loadTickets();
        } else {
            if (response.status === 429) {
                Swal.fire({
                    title: 'Daily Limit Reached',
                    text: data.message || 'You can only create 3 tickets per day.',
                    icon: 'warning',
                    confirmButtonColor: '#FFD700'
                });
            } else {
                showError(data.error || 'Failed to create ticket');
            }
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        showError('Failed to create ticket. Please try again.');
    }
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'open': 'Open',
        'closed': 'Closed'
    };
    return labels[status] || status;
}

function getCategoryLabel(category) {
    const labels = {
        'support': 'Support',
        'tools': 'Tools',
        'payments': 'Payments',
        'issue': 'Issue',
        'other': 'Other'
    };
    return labels[category] || 'Other';
}

function getCategoryIcon(category) {
    const icons = {
        'support': 'fa-headset',
        'tools': 'fa-tools',
        'payments': 'fa-credit-card',
        'issue': 'fa-bug',
        'other': 'fa-question-circle'
    };
    return icons[category] || 'fa-question-circle';
}

function capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonColor: '#FFD700'
    });
}