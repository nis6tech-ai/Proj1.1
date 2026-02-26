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

        // Initial fallback
        let data = stored ? JSON.parse(stored) : defaultData;

        if (stored && defaultData) {
            const parsed = JSON.parse(stored);
            const mergedProducts = defaultData.products.map(defaultProd => {
                const storedProd = (parsed.products || []).find(p => p.id === defaultProd.id);
                if (storedProd) return { ...defaultProd, ...storedProd };
                return defaultProd;
            });
            const userAddedProducts = (parsed.products || []).filter(
                sp => !defaultData.products.some(dp => dp.id === sp.id)
            );
            data = {
                settings: { ...defaultData.settings, ...parsed.settings },
                categories: parsed.categories || defaultData.categories,
                products: [...mergedProducts, ...userAddedProducts]
            };
        }

        // Trigger ghost sync (async)
        this.syncFromCloud(clientId, defaultData);
        return data;
    },

    // NEW: Sync from Firebase (Cloud -> Local)
    syncFromCloud: async function (clientId, defaultData) {
        if (typeof db === 'undefined') return;
        try {
            const doc = await db.collection('clients').doc(clientId).get();
            if (doc.exists) {
                const cloudData = doc.data();
                localStorage.setItem(`nexus_data_${clientId}`, JSON.stringify(cloudData));
                console.log("Cloud Sync: Local data updated from Firebase.");
                // Trigger a refresh event so the UI knows to update
                window.dispatchEvent(new Event('cloudSyncReady'));
            } else if (defaultData) {
                // First time setup on cloud
                await this.syncToCloud(clientId, defaultData);
            }
        } catch (e) {
            console.error("Cloud Sync Error:", e);
        }
    },

    // NEW: Sync to Firebase (Local -> Cloud)
    syncToCloud: async function (clientId, data) {
        if (typeof db === 'undefined') return;
        try {
            await db.collection('clients').doc(clientId).set(data);
            console.log("Cloud Save: Data pushed to Firebase.");
        } catch (e) {
            console.error("Cloud Save Error:", e);
        }
    },

    // Save data for a client
    save: function (clientId, data) {
        try {
            localStorage.setItem(`nexus_data_${clientId}`, JSON.stringify(data));
            // Push to cloud instantly
            this.syncToCloud(clientId, data);

            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Storage Error:", e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("CRITICAL: Storage Full locally! However, we will try to save to Firebase.");
                this.syncToCloud(clientId, data);
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
