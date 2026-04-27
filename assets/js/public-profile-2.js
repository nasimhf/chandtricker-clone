var copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

let currentUser = null;
let viewedUser = null;
let isFollowing = false;

function getUsernameFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/profile\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
}

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

async function loadCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            return currentUser;
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
    return null;
}

async function loadUserProfile(username) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');

    try {
        const response = await fetch(`/api/public-profile/${username}`);
        
        if (!response.ok) {
            loadingState.style.display = 'none';
            errorState.style.display = 'flex';
            return;
        }

        const data = await response.json();
        if (!data.success) {
            loadingState.style.display = 'none';
            errorState.style.display = 'flex';
            return;
        }

        const user = data.user;
        const stats = data.stats || {};
        viewedUser = user;
        
        const avatarEl = document.getElementById('profileAvatar');
        if (user.avatar) {
            avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            avatarEl.innerHTML = '<i class="fas fa-user"></i>';
        }

        const usernameEl = document.getElementById('profileUsername');
        usernameEl.textContent = user.username || 'Unknown';
        usernameEl.style.display = 'inline';

        const heroFollowers = document.getElementById('heroFollowers');
        const heroFollowing = document.getElementById('heroFollowing');
        const heroMemberDays = document.getElementById('heroMemberDays');
        
        if (heroFollowers) heroFollowers.textContent = data.followers?.length || user.followersCount || 0;
        if (heroFollowing) heroFollowing.textContent = data.following?.length || user.followingCount || 0;
        if (heroMemberDays) heroMemberDays.textContent = stats.memberDays || 0;

        const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();

        document.getElementById('memberSince').textContent = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        document.getElementById('currentCoins').textContent = user.coins || 0;
        document.getElementById('currentLevel').textContent = user.level || 1;
        document.getElementById('totalEarned').textContent = user.totalEarned || 0;
        document.getElementById('coinsSpent').textContent = user.coinsSpent || 0;
        document.getElementById('pkrSpent').textContent = 'Rs ' + (user.totalSpent || 0);
        document.getElementById('toolsUsed').textContent = stats.toolsUsed || 0;
        document.getElementById('pkrBalance').textContent = 'Rs ' + (user.pkrBalance || 0);
        document.getElementById('profileFollowers').textContent = data.followers?.length || user.followersCount || 0;
        document.getElementById('profileFollowing').textContent = data.following?.length || user.followingCount || 0;
        document.getElementById('memberDays').textContent = stats.memberDays || 0;
        document.getElementById('totalActivities').textContent = stats.totalActivities || 0;
        document.getElementById('accountType').textContent = user.isPremium ? 'Premium' : 'Free';

        const followersCountTab = document.getElementById('followersCountTab');
        const followingCountTab = document.getElementById('followingCountTab');
        
        if (followersCountTab) followersCountTab.textContent = data.followers?.length || user.followersCount || 0;
        if (followingCountTab) followingCountTab.textContent = data.following?.length || user.followingCount || 0;

        await loadCurrentUser();

        const followBtn = document.getElementById('followBtn');
        if (currentUser && viewedUser && currentUser.username !== viewedUser.username) {
            followBtn.style.display = 'inline-flex';
            isFollowing = viewedUser.followers?.includes(currentUser.id);
            updateFollowButton();
        }

        await loadFollowersList(viewedUser.username);
        await loadFollowingList(viewedUser.username);

        loadingState.style.display = 'none';
        profileContent.style.display = 'block';

    } catch (error) {
        console.error('Error loading profile:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
    }
}

async function loadFollowersList(username) {
    const followersList = document.getElementById('followersList');
    
    try {
        const response = await fetch(`/api/user/followers/${username}`);
        
        if (response.ok) {
            const data = await response.json();
            const followers = data.followers || [];
            
            if (followers.length === 0) {
                followersList.innerHTML = '<p class="empty-list">No followers yet.</p>';
            } else {
                followersList.innerHTML = followers.map(user => `
                    <a href="/profile/${encodeURIComponent(user.username)}" class="user-item">
                        ${user.avatar 
                            ? `<img src="${user.avatar}" alt="${user.username}">`
                            : `<i class="fas fa-user"></i>`
                        }
                        <span class="user-name-mini">${user.username}</span>
                        <span class="user-level-mini">Level ${user.level || 1}</span>
                    </a>
                `).join('');
            }
        } else {
            followersList.innerHTML = '<p class="empty-list">Could not load followers.</p>';
        }
    } catch (error) {
        followersList.innerHTML = '<p class="empty-list">Error loading followers.</p>';
    }
}

async function loadFollowingList(username) {
    const followingList = document.getElementById('followingList');
    
    try {
        const response = await fetch(`/api/user/following/${username}`);
        
        if (response.ok) {
            const data = await response.json();
            const following = data.following || [];
            
            if (following.length === 0) {
                followingList.innerHTML = '<p class="empty-list">Not following anyone yet.</p>';
            } else {
                followingList.innerHTML = following.map(user => `
                    <a href="/profile/${encodeURIComponent(user.username)}" class="user-item">
                        ${user.avatar 
                            ? `<img src="${user.avatar}" alt="${user.username}">`
                            : `<i class="fas fa-user"></i>`
                        }
                        <span class="user-name-mini">${user.username}</span>
                        <span class="user-level-mini">Level ${user.level || 1}</span>
                    </a>
                `).join('');
            }
        } else {
            followingList.innerHTML = '<p class="empty-list">Could not load following.</p>';
        }
    } catch (error) {
        followingList.innerHTML = '<p class="empty-list">Error loading following.</p>';
    }
}

function switchNetworkTab(tab) {
    const followersTab = document.querySelector('.network-tab:first-child');
    const followingTab = document.querySelector('.network-tab:last-child');
    const followersList = document.getElementById('followersList');
    const followingList = document.getElementById('followingList');

    if (tab === 'followers') {
        followersTab.classList.add('active');
        followingTab.classList.remove('active');
        followersList.style.display = 'grid';
        followingList.style.display = 'none';
    } else {
        followingTab.classList.add('active');
        followersTab.classList.remove('active');
        followingList.style.display = 'grid';
        followersList.style.display = 'none';
    }
}

function updateFollowButton() {
    const followBtn = document.getElementById('followBtn');
    
    if (isFollowing) {
        followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
        followBtn.classList.remove('btn-follow');
        followBtn.classList.add('btn-following');
    } else {
        followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
        followBtn.classList.remove('btn-following');
        followBtn.classList.add('btn-follow');
    }
}

async function toggleFollow() {
    if (!currentUser) {
        showNotification('Please login to follow users', 'error');
        window.location.href = '/login';
        return;
    }

    if (!viewedUser || currentUser.username === viewedUser.username) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`/api/user/follow/${viewedUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            isFollowing = !isFollowing;
            updateFollowButton();

            const followersCount = parseInt(document.getElementById('profileFollowers').textContent);
            document.getElementById('profileFollowers').textContent = isFollowing ? followersCount + 1 : followersCount - 1;
            document.getElementById('followersCountTab').textContent = isFollowing ? followersCount + 1 : followersCount - 1;

            showNotification(data.message || (isFollowing ? 'Now following!' : 'Unfollowed'), 'success');
            
            await loadFollowersList(viewedUser.username);
        } else {
            showNotification(data.error || 'Action failed', 'error');
        }
    } catch (error) {
        console.error('Follow error:', error);
        showNotification('An error occurred', 'error');
    }
}

function shareProfile() {
    const username = viewedUser?.username;
    if (!username) return;

    const shareUrl = `${window.location.origin}/profile/${encodeURIComponent(username)}`;

    if (navigator.share) {
        navigator.share({
            title: `${username}'s Profile - CHAND TRICKER`,
            text: `Check out ${username}'s profile on CHAND TRICKER!`,
            url: shareUrl
        }).catch(err => {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareUrl);
            }
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Profile link copied!', 'success');
    }).catch(() => {
        showNotification('Could not copy link', 'error');
    });
}

function reportUser() {
    if (!currentUser) {
        showNotification('Please login to report', 'error');
        window.location.href = '/login';
        return;
    }

    if (!viewedUser || currentUser.username === viewedUser.username) {
        return;
    }

    const reason = prompt('Please enter the reason for reporting this user:');
    
    if (!reason || reason.trim() === '') {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/user/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            reportedUsername: viewedUser.username,
            reason: reason.trim()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Report submitted. Thank you!', 'success');
        } else {
            showNotification(data.error || 'Could not submit report', 'error');
        }
    })
    .catch(error => {
        console.error('Report error:', error);
        showNotification('An error occurred', 'error');
    });
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} notification-icon"></i>
        <span class="notification-message">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const ctIcons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle', question: 'fa-question-circle' };

function ctAlert(type, title, text) {
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'ct-overlay';
        var dialog = document.createElement('div');
        dialog.className = 'ct-dialog';
        var iconEl = document.createElement('div');
        iconEl.className = 'ct-icon ' + type;
        iconEl.innerHTML = '<i class="fas ' + (ctIcons[type] || ctIcons.info) + '"></i>';
        var h3 = document.createElement('h3');
        h3.textContent = title;
        var p = document.createElement('p');
        p.textContent = text;
        var btn = document.createElement('button');
        btn.className = 'ct-btn ct-btn-ok';
        btn.textContent = 'OK';
        btn.onclick = function() { overlay.remove(); resolve(); };
        dialog.append(iconEl, h3, p, btn);
        overlay.appendChild(dialog);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) { overlay.remove(); resolve(); } });
        document.body.appendChild(overlay);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    const username = getUsernameFromPath();
    console.log('Loading profile for:', username);
    
    if (username) {
        loadUserProfile(username).catch(err => {
            console.error('Profile load error:', err);
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('errorState').style.display = 'flex';
        });
    } else {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'flex';
    }
});
