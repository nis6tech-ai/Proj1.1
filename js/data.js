/**
 * Nutpa Data Bridge - PHP Version
 * Fetches live data from MySQL instead of Firebase/Hardcoded arrays.
 */

window.liveData = {
    settings: {},
    categories: [],
    products: []
};

async function loadLiveSiteData() {
    try {
        const response = await fetch('/api/sync.php?action=get_data');
        const data = await response.json();

        if (data.error) {
            console.error("Database Error:", data.error);
            return;
        }

        window.liveData = data;

        // Update global shortcuts
        window.products = data.products || [];
        window.categories = data.categories || [];
        window.settings = data.settings || {};

        // Custom event so components can start rendering
        window.dispatchEvent(new Event('dataLoaded'));
        console.log("PHP Data Load: Success");
    } catch (e) {
        console.error("PHP Data Load: Failed", e);
    }
}

// Start loading immediately
loadLiveSiteData();
