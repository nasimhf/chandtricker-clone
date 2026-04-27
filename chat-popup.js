// Universal Chat Popup for VIP Premium Platform
class ChatPopup {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.unreadCount = 0;
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.createChatButton();
        this.startUnreadMessagesCheck();
    }

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.isLoggedIn = false;
                this.currentUser = null;
                return;
            }

            const response = await fetch('/api/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    this.isLoggedIn = true;
                    this.currentUser = data.user;
                } catch (e) {
                    console.error('Invalid JSON response');
                    this.isLoggedIn = false;
                    this.currentUser = null;
                }
            } else {
                // Clear invalid token and set logged out state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.isLoggedIn = false;
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.isLoggedIn = false;
            this.currentUser = null;
        }
    }

    createChatButton() {
        // Only show for logged-in users
        if (!this.isLoggedIn) return;

        // Don't show on the support-tickets page itself
        if (window.location.pathname === '/support-tickets' || window.location.pathname === '/support-tickets.html') return;

        // Remove existing chat button if any
        const existingButton = document.querySelector('.vip-chat-popup');
        if (existingButton) {
            existingButton.remove();
        }

        const chatButton = document.createElement('div');
        chatButton.className = 'vip-chat-popup';
        chatButton.innerHTML = `
            <div class="chat-popup-button" onclick="window.chatPopup.openChat()">
                <i class="fas fa-comments"></i>
                <span class="unread-badge" id="chatUnreadBadge" style="display: none;">0</span>
            </div>
            <div class="chat-popup-tooltip">
                <span>Open Support Tickets</span>
            </div>
        `;

        document.body.appendChild(chatButton);
        this.addChatStyles();
    }

    addChatStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .vip-chat-popup {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 99999;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
            }

            .chat-popup-button {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 
                    0 8px 25px rgba(255, 215, 0, 0.4),
                    0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                animation: chatPulse 3s ease-in-out infinite;
            }

            .chat-popup-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.2), 
                    transparent
                );
                border-radius: 50%;
                pointer-events: none;
            }

            .chat-popup-button:hover {
                transform: translateY(-5px) scale(1.1);
                box-shadow: 
                    0 15px 35px rgba(255, 215, 0, 0.6),
                    0 8px 25px rgba(0, 0, 0, 0.4);
                background: linear-gradient(135deg, #FFED4A, #FFD700);
            }

            .chat-popup-button i {
                font-size: 1.5rem;
                color: #1a1a1a;
                z-index: 1;
                position: relative;
                filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
            }

            .unread-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                font-weight: bold;
                border: 2px solid #1a1a1a;
                animation: badgePulse 2s ease-in-out infinite;
            }

            .chat-popup-tooltip {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: rgba(26, 26, 26, 0.95);
                color: #FFD700;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.8rem;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
                border: 1px solid rgba(255, 215, 0, 0.3);
                backdrop-filter: blur(10px);
            }

            .chat-popup-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                right: 20px;
                border: 5px solid transparent;
                border-top-color: rgba(26, 26, 26, 0.95);
            }

            .vip-chat-popup:hover .chat-popup-tooltip {
                opacity: 1;
                transform: translateY(0);
            }

            @keyframes chatPulse {
                0%, 100% {
                    box-shadow: 
                        0 8px 25px rgba(255, 215, 0, 0.4),
                        0 4px 15px rgba(0, 0, 0, 0.3),
                        0 0 0 0 rgba(255, 215, 0, 0.4);
                }
                50% {
                    box-shadow: 
                        0 8px 25px rgba(255, 215, 0, 0.4),
                        0 4px 15px rgba(0, 0, 0, 0.3),
                        0 0 0 15px rgba(255, 215, 0, 0);
                }
            }

            @keyframes badgePulse {
                0%, 100% {
                    transform: scale(1);
                    background: #ff4444;
                }
                50% {
                    transform: scale(1.2);
                    background: #ff6666;
                }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .vip-chat-popup {
                    bottom: 20px;
                    right: 20px;
                }

                .chat-popup-button {
                    width: 55px;
                    height: 55px;
                }

                .chat-popup-button i {
                    font-size: 1.3rem;
                }

                .unread-badge {
                    width: 20px;
                    height: 20px;
                    font-size: 0.65rem;
                }

                .chat-popup-tooltip {
                    bottom: 65px;
                    font-size: 0.75rem;
                }
            }

            @media (max-width: 480px) {
                .vip-chat-popup {
                    bottom: 15px;
                    right: 15px;
                }

                .chat-popup-button {
                    width: 50px;
                    height: 50px;
                }

                .chat-popup-button i {
                    font-size: 1.2rem;
                }

                .unread-badge {
                    width: 18px;
                    height: 18px;
                    font-size: 0.6rem;
                }
            }

            /* Hide on pages where not needed */
            body.hide-chat-popup .vip-chat-popup {
                display: none;
            }
        `;
        document.head.appendChild(styles);
    }

    async checkUnreadMessages() {
        if (!this.isLoggedIn) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/chat/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                console.warn('Chat authentication failed or forbidden');
                return;
            }

            if (response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    this.updateUnreadBadge(data.unreadCount || 0);
                } catch (e) {
                    console.error('Invalid JSON for unread count');
                }
            }
        } catch (error) {
            console.error('Failed to check unread messages:', error);
        }
    }

    updateUnreadBadge(count) {
        const badge = document.getElementById('chatUnreadBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    startUnreadMessagesCheck() {
        if (!this.isLoggedIn) return;

        // Check immediately
        this.checkUnreadMessages();

        // Check every 30 seconds
        setInterval(() => {
            this.checkUnreadMessages();
        }, 30000);
    }

    openChat() {
        // Add smooth transition effect
        const button = document.querySelector('.chat-popup-button');
        if (button) {
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }

        // Navigate to support tickets
        window.location.href = '/support-tickets';
    }

    // Method to manually update unread count (can be called from other scripts)
    setUnreadCount(count) {
        this.unreadCount = count;
        this.updateUnreadBadge(count);
    }

    // Method to hide/show chat popup
    toggleVisibility(show = true) {
        const popup = document.querySelector('.vip-chat-popup');
        if (popup) {
            popup.style.display = show ? 'block' : 'none';
        }
    }
}

// Initialize chat popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatPopup = new ChatPopup();
});

// Make it globally accessible
window.ChatPopup = ChatPopup;

// Display messages in the chat
function displayMessages(messages) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
        return;
    }

    chatMessages.innerHTML = messages.map(msg => {
        const currentUserId = getCurrentUserId();
        const isCurrentUser = msg.userId === currentUserId || msg.senderId === currentUserId;
        const messageTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="message ${isCurrentUser ? 'sent' : 'received'} ${msg.isAdmin ? 'admin-message' : ''}">
                <div class="message-content">
                    <div class="message-text">${escapeHtml(msg.message)}</div>
                    <div class="message-time">${messageTime}</div>
                </div>
                ${msg.isAdmin ? '<i class="fas fa-crown admin-crown"></i>' : ''}
            </div>
        `;
    }).join('');

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-refresh messages every 3 seconds when chat is open
let messageRefreshInterval;

function startMessageRefresh() {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }

    messageRefreshInterval = setInterval(() => {
        if (isChatOpen && currentChatUserId) {
            loadChatMessages();
        }
    }, 3000);
}

function stopMessageRefresh() {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
        messageRefreshInterval = null;
    }
}

// Utility function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Get current user ID
function getCurrentUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.id : null;
    } catch (error) {
        return null;
    }
}

// Load chat messages for a specific conversation
function loadChatMessages() {
    if (!currentChatUserId) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '<div class="no-messages">Select a conversation to start chatting</div>';
        }
        return;
    }

    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`/api/chat/messages?conversationWith=${currentChatUserId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized');
        }
        return response.json();
    })
    .then(data => {
        if (data.messages) {
            displayMessages(data.messages);
        } else {
            chatMessages.innerHTML = '<div class="no-messages">No messages yet</div>';
        }
    })
    .catch(error => {
        if (error.message !== 'Unauthorized') {
            console.error('Error loading messages:', error);
            chatMessages.innerHTML = '<div class="error-messages">Failed to load messages</div>';
        }
    });
}

// Initialize global variables safely
if (typeof window.currentChatUserId === 'undefined') {
    window.currentChatUserId = null;
}
if (typeof window.isChatOpen === 'undefined') {
    window.isChatOpen = false;
}
if (typeof window.autoRefreshInterval === 'undefined') {
    window.autoRefreshInterval = null;
}

// Auto-refresh messages - optimized for mobile
            if (typeof window.autoRefreshInterval !== 'undefined' && window.autoRefreshInterval) {
                clearInterval(window.autoRefreshInterval);
            }

            // Longer interval on mobile to save battery and performance
            const refreshInterval = window.innerWidth <= 768 ? 15000 : 10000;

            window.autoRefreshInterval = setInterval(() => {
                const chatPopupElement = document.querySelector('.vip-chat-popup');
                if (chatPopupElement && chatPopupElement.style.display !== 'none') {
                    loadChatMessages();
                }
            }, refreshInterval);