// Auto-load unified navigation for all pages
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Load navigation.js if not already loaded
        if (!window.navigation) {
            const script = document.createElement('script');
            script.src = '/assets/js/navigation.js';
            document.head.appendChild(script);
        }
    });
} else {
    // Load navigation.js if not already loaded
    if (!window.navigation) {
        const script = document.createElement('script');
        script.src = '/assets/js/navigation.js';
        document.head.appendChild(script);
    }
}
