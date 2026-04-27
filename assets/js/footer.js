document.addEventListener('DOMContentLoaded', function() {
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
