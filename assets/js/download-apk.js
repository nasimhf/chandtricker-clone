// Auto-update copyright year
var copyrightYear = document.getElementById('copyright-year');
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

// APK Page Specific
let allApks = [];
let currentCategory = 'all';

async function loadApks() {
    try {
        const response = await fetch('/api/apk-downloads');
        const data = await response.json();
        allApks = data;
        renderCategories();
        renderApks();
    } catch (error) {
        console.error('Error loading APKs:', error);
    }
}

function renderCategories() {
    const categories = [...new Set(allApks.map(f => f.category).filter(Boolean))];
    const filterContainer = document.getElementById('categoryFilter');
    
    let html = `<button class="category-btn active" data-category="all"><i class="fas fa-th-large"></i> All</button>`;
    
    categories.forEach(cat => {
        const icon = cat === 'premium' ? 'fa-crown' : cat === 'tools' ? 'fa-tools' : cat === 'social' ? 'fa-users' : cat === 'games' ? 'fa-gamepad' : cat === 'utilities' ? 'fa-cog' : 'fa-folder';
        html += `<button class="category-btn" data-category="${cat}"><i class="fas ${icon}"></i> ${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`;
    });

    filterContainer.innerHTML = html;

    setupCategoryFilter();
}

function setupCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderApks();
        });
    });
}

function renderApks() {
    const grid = document.getElementById('apkGrid');
    const empty = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filtered = allApks.filter(apk => {
        const matchesCategory = currentCategory === 'all' || 
            (apk.category && apk.category.toLowerCase() === currentCategory);
        const matchesSearch = apk.name.toLowerCase().includes(searchTerm) || 
                            (apk.description && apk.description.toLowerCase().includes(searchTerm));
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        empty.style.display = 'none';
        grid.innerHTML = filtered.map((apk, index) => {
            let iconClass = 'fab fa-android';
            const catLower = apk.category?.toLowerCase();
            if (catLower === 'vb') iconClass = 'fas fa-code';
            else if (catLower === 'python') iconClass = 'fab fa-python';
            else if (catLower === 'cpp') iconClass = 'fas fa-microchip';
            else if (catLower === 'tools') iconClass = 'fas fa-tools';
            else if (catLower === 'premium') iconClass = 'fas fa-crown';
            else if (catLower === 'social') iconClass = 'fas fa-users';
            else if (catLower === 'games') iconClass = 'fas fa-gamepad';

            return `
            <div class="apk-card" style="animation-delay: ${index * 0.05}s">
                ${apk.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                <div class="apk-header">
                    <div class="apk-icon">
                        ${apk.thumbnail ? `<img src="${apk.thumbnail}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : `<i class="${iconClass}"></i>`}
                    </div>
                    <div class="apk-info">
                        <h3>${apk.name}</h3>
                        <p><i class="fas fa-user"></i> ${apk.developer || 'CHAND TRICKER'}</p>
                    </div>
                </div>
                <div class="apk-body">
                    <div class="apk-badges">
                        <span class="badge"><i class="fas fa-tag"></i> v${apk.version || '1.0.0'}</span>
                        <span class="badge"><i class="fas fa-hdd"></i> ${apk.size}</span>
                        <span class="badge"><i class="fas fa-download"></i> ${apk.downloads}</span>
                    </div>
                    <p class="apk-description">${apk.description || 'No description available.'}</p>
                </div>
                <div class="apk-footer">
                    <button class="download-btn" onclick="downloadApk('${apk.id}')">
                        <i class="fas fa-download"></i> Download APK
                    </button>
                </div>
            </div>`;
        }).join('');
    }
    updateStats(filtered);
}

function updateStats(apks) {
    document.getElementById('totalApks').textContent = allApks.length;
    const totalDls = allApks.reduce((acc, apk) => acc + (parseInt(apk.downloads) || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDls >= 1000 ? (totalDls / 1000).toFixed(1) + 'K' : totalDls;
    const totalSize = allApks.reduce((acc, apk) => acc + (parseFloat(apk.size) || 0), 0).toFixed(1);
    document.getElementById('totalSize').textContent = totalSize + ' MB';
}

function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', (e) => renderApks());

    const popBtn = document.getElementById('sortPopular');
    const recBtn = document.getElementById('sortRecent');

    popBtn.onclick = () => {
        popBtn.classList.add('active');
        recBtn.classList.remove('active');
        allApks.sort((a, b) => (parseInt(b.downloads) || 0) - (parseInt(a.downloads) || 0));
        renderApks();
    };

    recBtn.onclick = () => {
        recBtn.classList.add('active');
        popBtn.classList.remove('active');
        allApks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderApks();
    };
}

function downloadApk(id) {
    window.location.href = `/api/apk-downloads/${id}/file`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadApks();
    setupFilters();
});
