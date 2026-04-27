// VIDEO GALLERY (video.js)
let allVideos = [];
let currentVideo = null;
let currentFilter = 'all';
let currentLikes = {};
let currentComments = {};

document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    setupSearch();
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('videoModal');
            if (modal.classList.contains('active')) {
                closeVideoModal();
            }
        }
    });
});

// checkAuth function removed - videos are now public

async function loadVideos() {
    try {
        const response = await fetch('/api/videos/list');
        const data = await response.json();

        if (data.success && data.videos) {
            allVideos = data.videos;
            loadLikesAndComments();
            displayVideos(allVideos);
            
            // Update stats
            const totalVideos = allVideos.length;
            const totalViews = allVideos.reduce((sum, v) => sum + (v.views || 0), 0);
            const todayViews = allVideos.reduce((sum, v) => sum + (v.todayViews || 0), 0);
            const totalLikes = allVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
            
            document.getElementById('totalVideos').textContent = totalVideos;
            document.getElementById('todayViews').textContent = formatNumber(todayViews);
            document.getElementById('totalViews').textContent = formatNumber(totalViews);
            document.getElementById('totalLikes').textContent = formatNumber(totalLikes);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showEmptyState();
    }
}

function loadLikesAndComments() {
    allVideos.forEach(video => {
        currentLikes[video.id] = video.likes || 0;
        currentComments[video.id] = video.comments || [];
    });
}

function displayVideos(videos) {
    const grid = document.getElementById('videoGrid');
    const emptyState = document.getElementById('emptyState');

    if (videos.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = videos.map(video => `
        <div class="video-card" onclick="openVideoModal('${video.id}')">
            <div class="video-thumbnail">
                <img src="${video.thumbnail || 'https://via.placeholder.com/280x157?text=No+Thumbnail'}" alt="${escapeHtml(video.title)}">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
                <div class="duration">${formatDuration(video.duration || 0)}</div>
            </div>
            <div class="video-info">
                <div class="video-title">${escapeHtml(video.title)}</div>
                <div class="video-description">${escapeHtml((video.description || '').substring(0, 80))}...</div>
                <div class="video-meta">
                    <div class="meta-item">
                        <i class="fas fa-eye"></i>
                        <span>${formatNumber(video.views || 0)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-heart"></i>
                        <span>${formatNumber(currentLikes[video.id] || 0)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(video.uploadedAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showEmptyState() {
    document.getElementById('videoGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allVideos.filter(v => 
            v.title.toLowerCase().includes(query) || 
            (v.description || '').toLowerCase().includes(query)
        );
        displayVideos(filtered);
    });
}

function filterVideos(category) {
    currentFilter = category;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    let filtered = allVideos;
    if (category !== 'all') {
        filtered = allVideos.filter(v => v.category === category);
    }

    displayVideos(filtered);
}

async function openVideoModal(videoId) {
    currentVideo = allVideos.find(v => v.id === videoId);
    if (!currentVideo) return;

    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalPlayer');
    const iframe = document.getElementById('modalIframe');

    // Update video source
    if (currentVideo.videoUrl.includes('youtube.com') || currentVideo.videoUrl.includes('youtu.be')) {
        let ytId = '';
        if (currentVideo.videoUrl.includes('v=')) {
            ytId = currentVideo.videoUrl.split('v=')[1].split('&')[0];
        } else {
            ytId = currentVideo.videoUrl.split('/').pop();
        }
        iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        iframe.classList.add('active');
        player.classList.add('hidden');
        player.pause();
    } else {
        player.src = currentVideo.videoUrl;
        player.classList.remove('hidden');
        iframe.classList.remove('active');
        iframe.src = '';
    }

    // Update details
    document.getElementById('modalTitle').textContent = currentVideo.title;
    document.getElementById('modalViews').textContent = formatNumber(currentVideo.views || 0);
    document.getElementById('modalDate').textContent = formatDate(currentVideo.uploadedAt);
    document.getElementById('modalCategory').textContent = capitalizeFirst(currentVideo.category || 'Other');
    document.getElementById('modalDescription').textContent = currentVideo.description || 'No description';

    // Load likes
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    likeCount.textContent = formatNumber(currentLikes[videoId] || 0);

    if (isVideoLiked(videoId)) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }

    // Increment view count
    incrementViewCount(videoId);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('modalPlayer');
    const iframe = document.getElementById('modalIframe');
    
    modal.classList.remove('active');
    player.pause();
    player.src = '';
    player.classList.remove('hidden');
    iframe.classList.remove('active');
    iframe.src = '';
    currentVideo = null;
    document.body.style.overflow = '';
}

function incrementViewCount(videoId) {
    fetch(`/api/videos/${videoId}/increment-views`, { method: 'POST' })
        .catch(err => console.error('Error incrementing views:', err));
}

function toggleLike(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    
    if (!likeBtn || !likeCount) return;

    // Toggle visual state even without video
    if (likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
    } else {
        likeBtn.classList.add('liked');
    }
    
    // If no video is playing, just show visual feedback
    if (!currentVideo) {
        // Show a quick animation feedback
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = '';
        }, 200);
        return;
    }

    const videoId = currentVideo.id;

    if (isVideoLiked(videoId)) {
        currentLikes[videoId]--;
    } else {
        currentLikes[videoId]++;
    }

    likeCount.textContent = formatNumber(currentLikes[videoId]);

    // Send to backend
    fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: likeBtn.classList.contains('liked') })
    }).catch(err => console.error('Error updating likes:', err));
}

function shareVideo(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // If no video is selected, show a message
    if (!currentVideo) {
        const shareBtn = document.getElementById('likeBtn')?.parentElement?.querySelector('.share-btn') || document.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                shareBtn.style.transform = '';
            }, 200);
        }
        return;
    }
    
    const videoUrl = window.location.origin + '/video?id=' + currentVideo.id;
    const shareData = {
        title: currentVideo.title,
        text: currentVideo.description || 'Check out this video!',
        url: videoUrl
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(err => {
            if (err.name !== 'AbortError') {
                copyToClipboard(videoUrl);
            }
        });
    } else {
        copyToClipboard(videoUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Link copied to clipboard',
            timer: 2000,
            showConfirmButton: false
        });
    }).catch(() => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to copy link'
        });
    });
}

function isVideoLiked(videoId) {
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    return likedVideos.includes(videoId);
}

function loadComments(videoId) {
    const commentsList = document.getElementById('commentsList');
    const comments = currentComments[videoId] || [];

    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No comments yet</p>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-author">${escapeHtml(comment.author || 'Anonymous')}</div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-time">${formatDate(comment.createdAt)}</div>
        </div>
    `).join('');
}

function addComment() {
    if (!currentVideo) return;

    const input = document.getElementById('commentInput');
    const text = input.value.trim();

    if (!text) {
        Swal.fire('Error', 'Please enter a comment', 'error');
        return;
    }

    const comment = {
        id: Date.now(),
        author: 'You',
        text: text,
        createdAt: new Date().toISOString()
    };

    if (!currentComments[currentVideo.id]) {
        currentComments[currentVideo.id] = [];
    }
    currentComments[currentVideo.id].unshift(comment);

    // Send to backend
    fetch(`/api/videos/${currentVideo.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    }).catch(err => console.error('Error posting comment:', err));

    input.value = '';
    loadComments(currentVideo.id);
    Swal.fire('Success', 'Comment posted!', 'success');
}

// ADMIN UPLOAD (video-admin.js)
let selectedFile = null;
let uploadStartTime = null;
let currentEditVideoId = null;
let uploadMode = 'file';

function switchUploadMode(mode) {
    uploadMode = mode;
    document.getElementById('fileUploadMode').style.display = mode === 'file' ? 'block' : 'none';
    document.getElementById('linkUploadMode').style.display = mode === 'link' ? 'block' : 'none';

    // Update tab styles
    const buttons = document.querySelectorAll('#uploadTab .tabs .tab-btn');
    buttons[0].classList.toggle('active', mode === 'file');
    buttons[1].classList.toggle('active', mode === 'link');

    // Reset previews
    if (mode === 'link') {
        selectedFile = null;
        document.getElementById('videoFile').value = '';
    } else {
        document.getElementById('videoUrl').value = '';
    }
    document.getElementById('previewSection').classList.remove('active');
}

function handleLinkChange(event) {
    const url = event.target.value.trim();
    if (!url) return;

    const preview = document.getElementById('previewSection');
    const video = document.getElementById('previewVideo');

    video.src = url;
    preview.classList.add('active');
    document.getElementById('fileInfo').textContent = `External Link: ${url}`;

    video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        if (!isNaN(duration)) {
            document.getElementById('videoDuration').value = duration;
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('uploadForm')) {
        setupAdminPanel();
    }
});

function setupAdminPanel() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('videoFile');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFileSelect({ target: { files } });
        }
    });

    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
    loadAdminVideos();
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (!files.length) return;

    const file = files[0];
    const maxSize = 500 * 1024 * 1024; // 500 MB

    if (!file.type.startsWith('video/')) {
        Swal.fire('Error', 'Please select a video file', 'error');
        return;
    }

    if (file.size > maxSize) {
        Swal.fire('Error', `File size must be less than 500 MB (Current: ${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const video = document.getElementById('previewVideo');
        video.src = e.target.result;

        video.onloadedmetadata = () => {
            const duration = Math.floor(video.duration);
            document.getElementById('videoDuration').value = duration;
        };
    };
    reader.readAsArrayBuffer(file);

    // Show file info
    const preview = document.getElementById('previewSection');
    preview.classList.add('active');
    document.getElementById('fileInfo').textContent = 
        `File: ${file.name} | Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
}

async function handleUpload(e) {
    e.preventDefault();

    const title = document.getElementById('videoTitle').value.trim();
    const description = document.getElementById('videoDescription').value.trim();
    const duration = parseInt(document.getElementById('videoDuration').value) || 0;
    const category = document.getElementById('videoCategory').value;
    const privacy = document.getElementById('videoPrivacy').value;

    if (!title || !category) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
    }

    if (uploadMode === 'file') {
        if (!selectedFile) {
            Swal.fire('Error', 'Please select a video file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('duration', duration);
        formData.append('category', category);
        formData.append('privacy', privacy);

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;

        const progressWrapper = document.getElementById('progressWrapper');
        progressWrapper.classList.add('active');

        uploadStartTime = Date.now();

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    document.getElementById('progressFill').style.width = percentComplete + '%';
                    document.getElementById('progressText').textContent = Math.round(percentComplete) + '%';

                    const elapsed = (Date.now() - uploadStartTime) / 1000;
                    const speed = e.loaded / elapsed;
                    const speedMB = (speed / 1024 / 1024).toFixed(2);
                    document.getElementById('uploadSpeed').textContent = speedMB + ' MB/s';
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        Swal.fire('Success', 'Video uploaded successfully!', 'success');
                        document.getElementById('uploadForm').reset();
                        selectedFile = null;
                        document.getElementById('previewSection').classList.remove('active');
                        progressWrapper.classList.remove('active');
                        loadAdminVideos();
                    } else {
                        Swal.fire('Error', response.message || 'Upload failed', 'error');
                    }
                } else {
                    Swal.fire('Error', 'Upload failed', 'error');
                }
                uploadBtn.disabled = false;
            });

            xhr.open('POST', '/api/videos/upload');
            const token = localStorage.getItem('token');
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading video:', error);
            Swal.fire('Error', 'Upload failed', 'error');
            uploadBtn.disabled = false;
        }
    } else {
        const videoUrl = document.getElementById('videoUrl').value.trim();
        if (!videoUrl) {
            Swal.fire('Error', 'Please enter a video URL', 'error');
            return;
        }

        try {
            const response = await fetch('/api/videos/add-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    duration,
                    category,
                    privacy,
                    videoUrl
                })
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('Success', 'Video link added successfully!', 'success');
                document.getElementById('uploadForm').reset();
                document.getElementById('previewSection').classList.remove('active');
                loadAdminVideos();
            } else {
                Swal.fire('Error', data.message || 'Failed to add link', 'error');
            }
        } catch (error) {
            console.error('Error adding video link:', error);
            Swal.fire('Error', 'Failed to add link', 'error');
        }
    }
}

async function loadAdminVideos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/videos/admin/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.videos) {
            const videos = data.videos;

            // Update stats
            document.getElementById('totalVideos').textContent = videos.length;
            document.getElementById('totalViews').textContent = formatNumber(
                videos.reduce((sum, v) => sum + (v.views || 0), 0)
            );
            document.getElementById('totalLikes').textContent = formatNumber(
                videos.reduce((sum, v) => sum + (v.likes || 0), 0)
            );

            // Update table
            const tbody = document.getElementById('videosTableBody');
            if (videos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No videos uploaded yet</td></tr>';
                return;
            }

            tbody.innerHTML = videos.map(video => `
                <tr>
                    <td>
                        <img src="${video.thumbnail || 'https://via.placeholder.com/60x45'}" class="video-thumbnail-small">
                    </td>
                    <td>${escapeHtml(video.title)}</td>
                    <td>${capitalizeFirst(video.category)}</td>
                    <td>${formatNumber(video.views || 0)}</td>
                    <td>
                        <span class="status-badge status-${video.privacy}">
                            ${capitalizeFirst(video.privacy)}
                        </span>
                    </td>
                    <td>${formatDate(video.uploadedAt)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="openEditModal('${video.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-action btn-delete" onclick="deleteVideo('${video.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');

    if (tab === 'manage') {
        loadAdminVideos();
    }
}

async function openEditModal(videoId) {
    currentEditVideoId = videoId;
    const video = (await fetch(`/api/videos/${videoId}`).then(r => r.json())).video;

    document.getElementById('editTitle').value = video.title;
    document.getElementById('editDescription').value = video.description;
    document.getElementById('editCategory').value = video.category;
    document.getElementById('editPrivacy').value = video.privacy;

    document.getElementById('editForm').onsubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: document.getElementById('editTitle').value,
                    description: document.getElementById('editDescription').value,
                    category: document.getElementById('editCategory').value,
                    privacy: document.getElementById('editPrivacy').value
                })
            });

            const data = await response.json();
            if (data.success) {
                Swal.fire('Success', 'Video updated!', 'success');
                closeEditModal();
                loadAdminVideos();
            }
        } catch (error) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

async function deleteVideo(videoId) {
    const result = await Swal.fire({
        title: 'Delete Video?',
        text: 'This action cannot be undone',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            Swal.fire('Deleted', 'Video deleted successfully', 'success');
            loadAdminVideos();
        }
    } catch (error) {
        Swal.fire('Error', 'Delete failed', 'error');
    }
}

// UTILITY FUNCTIONS
function formatDuration(dur) {
    if (!dur) return '0:00';
    
    // If it's already a string with colon (like "05:30" or "00:05:30"), return as is
    if (typeof dur === 'string' && dur.includes(':')) {
        return dur;
    }
    
    // Convert to number if it's a string
    let seconds = parseInt(dur);
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
}