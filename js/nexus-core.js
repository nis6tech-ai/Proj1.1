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
            // Deep merge/ensure keys exist
            return {
                settings: parsed.settings || defaultData.settings,
                categories: parsed.categories || defaultData.categories,
                products: parsed.products || defaultData.products
            };
        }

        return stored ? JSON.parse(stored) : defaultData;
    },

    // Save data for a client
    save: function (clientId, data) {
        localStorage.setItem(`nexus_data_${clientId}`, JSON.stringify(data));
        // Also trigger a storage event for cross-tab updates
        window.dispatchEvent(new Event('storage'));
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
