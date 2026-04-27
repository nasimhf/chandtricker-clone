// Auto-update copyright year
document.getElementById('copyright-year').textContent = new Date().getFullYear();

// Files Page
let allFiles = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    setupFilters();
});

async function loadFiles() {
    try {
        const response = await fetch('/api/downloads');
        allFiles = await response.json();
        renderCategories();
        renderFiles();
    } catch (error) {
        console.error('Error loading files:', error);
        showEmptyState();
    }
}

function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', () => renderFiles());
}

function renderCategories() {
    const categories = [...new Set(allFiles.map(f => f.category).filter(Boolean))];
    const filterContainer = document.getElementById('categoryFilter');
    
    let html = `<button class="filter-btn active" data-category="all"><i class="fas fa-th-large"></i> All</button>`;
    
    categories.forEach(cat => {
        html += `<button class="filter-btn" data-category="${cat}"><i class="fas fa-folder"></i> ${cat}</button>`;
    });

    filterContainer.innerHTML = html;

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderFiles();
        });
    });
}

function renderFiles() {
    const grid = document.getElementById('filesGrid');
    const empty = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filtered = allFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm) || 
                            (file.category && file.category.toLowerCase().includes(searchTerm));
        const matchesCategory = currentCategory === 'all' || file.category === currentCategory;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = filtered.map(file => `
        <div class="file-card">
            <div class="file-header">
                <div class="file-icon">
                    ${file.thumbnail ? `<img src="${file.thumbnail}" alt="${file.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\\'${getFileIcon(file.type)}\\'></i>'">` : `<i class="${getFileIcon(file.type)}"></i>`}
                </div>
                <div class="file-info">
                    <h3>${file.name}</h3>
                    <p>${file.description || 'Premium file ready for download'}</p>
                </div>
            </div>
            <div class="file-badges">
                <span class="badge"><i class="fas fa-tag"></i> ${file.type || 'FILE'}</span>
                <span class="badge"><i class="fas fa-hdd"></i> ${file.size || '0 MB'}</span>
                <span class="badge"><i class="fas fa-download"></i> ${(file.downloads || 0).toLocaleString()}</span>
            </div>
            <button class="download-btn" onclick="downloadFile('${file.id}', '${file.name.replace(/'/g, "\\'")}')">
                <i class="fas fa-download"></i> Download
            </button>
        </div>
    `).join('');

    updateStats();
}

function getFileIcon(type) {
    const icons = {
        'ZIP': 'fas fa-file-archive',
        'RAR': 'fas fa-file-archive',
        'PDF': 'fas fa-file-pdf',
        'EXE': 'fas fa-file-code',
        'APK': 'fas fa-mobile-alt',
        'JPG': 'fas fa-file-image',
        'PNG': 'fas fa-file-image',
        'TXT': 'fas fa-file-alt',
        'DOC': 'fas fa-file-word',
        'DOCX': 'fas fa-file-word',
        'XLS': 'fas fa-file-excel',
        'XLSX': 'fas fa-file-excel'
    };
    return icons[type?.toUpperCase()] || 'fas fa-file';
}

function updateStats() {
    document.getElementById('totalFiles').textContent = allFiles.length;
    const totalDls = allFiles.reduce((acc, f) => acc + (parseInt(f.downloads) || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDls >= 1000 ? (totalDls / 1000).toFixed(1) + 'K' : totalDls;
    const categories = [...new Set(allFiles.map(f => f.category).filter(Boolean))];
    document.getElementById('totalCategories').textContent = categories.length;
}

function showEmptyState() {
    document.getElementById('filesGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}

async function downloadFile(id, name) {
    const result = await ctAlert('info', 'Confirm Download', `Download "${name}"?`);

    if (result) {
        window.location.href = `/api/downloads/${id}/file`;
        setTimeout(loadFiles, 2000);
    }
}

// CT Alert function
const ctIcons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };

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
