/**
 * Nexus Core - Universal Data Management for Multi-tenant Static Sites
 * This script handles localStorage persistence and multi-client switching.
 */

const NexusCore = {
    // Current active client ID (defaults to nutpa)
    activeClientId: 'nutpa',

    // Initialize data for a client
    init: function (clientId, defaultData) {
        const stored = localStorage.getItem(`nexus_data_${clientId}`);
        if (!stored && defaultData) {
            localStorage.setItem(`nexus_data_${clientId}`, JSON.stringify(defaultData));
            return defaultData;
        }

        if (stored && defaultData) {
            const parsed = JSON.parse(stored);

            // For products, we want to keep stored data but ensure new properties 
            // from the updated code (like isTopSelling) are merged in if they don't exist in storage.
            const mergedProducts = defaultData.products.map(defaultProd => {
                const storedProd = (parsed.products || []).find(p => p.id === defaultProd.id);
                if (storedProd) {
                    // Merge: Keep stored values but fill in missing keys from defaultProd
                    return { ...defaultProd, ...storedProd };
                }
                return defaultProd;
            });

            // Add any products that are in storage but NOT in defaults (user added via CMS)
            const userAddedProducts = (parsed.products || []).filter(
                sp => !defaultData.products.some(dp => dp.id === sp.id)
            );

            return {
                settings: { ...defaultData.settings, ...parsed.settings },
                categories: parsed.categories || defaultData.categories,
                products: [...mergedProducts, ...userAddedProducts]
            };
        }

        return stored ? JSON.parse(stored) : defaultData;
    },

    // Save data for a client
    save: function (clientId, data) {
        try {
            localStorage.setItem(`nexus_data_${clientId}`, JSON.stringify(data));
            // Also trigger a storage event for cross-tab updates
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Storage Error:", e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("CRITICAL: Storage Full! You have uploaded too many high-resolution images. Please use smaller photos or delete old products to free up space.");
            } else {
                alert("Error saving data: " + e.message);
            }
        }
    },

    // Get all clients registered in the system
    getClients: function () {
        const clients = localStorage.getItem('nexus_clients');
        return clients ? JSON.parse(clients) : [
            { id: 'nutpa', name: 'Nutpa Electronics', domain: 'nutpa.com', status: 'active' }
        ];
    },

    // Add a new client
    addClient: function (name, domain) {
        const clients = this.getClients();
        const id = name.toLowerCase().replace(/\s+/g, '_');
        const newClient = { id, name, domain, status: 'active' };
        clients.push(newClient);
        localStorage.setItem('nexus_clients', JSON.stringify(clients));

        // Initialize with empty product list
        this.save(id, { categories: [], products: [] });
        return newClient;
    }
};

// Auto-export for vanilla environment
window.NexusCore = NexusCore;
