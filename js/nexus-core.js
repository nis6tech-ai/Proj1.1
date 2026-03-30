/**
 * Nexus Core PHP Transition
 * Redirects all data operations to your Hostinger server.
 * Supports multiple clients: Nutpa Electronics & OS Chennai
 */

const NexusCore = {
    apiUrl: '/api/sync.php',

    // Load data for a specific project (nutpa or os-chennai)
    init: async function (clientId) {
        const projectId = clientId || 'nutpa';
        try {
            const resp = await fetch(`${this.apiUrl}?action=get_data&project=${encodeURIComponent(projectId)}`);
            const data = await resp.json();
            return data;
        } catch (e) {
            console.error("Initialization Failed:", e);
            return null;
        }
    },

    saveProduct: async function (product) {
        try {
            const resp = await fetch(`${this.apiUrl}?action=save_product`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            return await resp.json();
        } catch (e) {
            console.error("Save Failed:", e);
            return { error: e.message };
        }
    },

    deleteProduct: async function (id) {
        await fetch(`${this.apiUrl}?action=delete_product&id=${id}`);
        return { success: true };
    },

    // Save settings for a specific project (nutpa or os-chennai)
    save: async function (clientId, data) {
        const projectId = clientId || 'nutpa';
        try {
            const resp = await fetch(`${this.apiUrl}?action=save_settings&project=${encodeURIComponent(projectId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await resp.json();
        } catch (e) {
            console.error("Settings Save Failed:", e);
            return { error: e.message };
        }
    },

    uploadFile: async function (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch(`${this.apiUrl}?action=upload`, {
                method: 'POST',
                body: formData
            });
            return await resp.json();
        } catch (e) {
            return { error: "Upload connection failed" };
        }
    },

    // Both clients share the same product database
    getClients: function () {
        return [
            { id: 'nutpa',      name: 'Nutpa Electronics', domain: 'nutpa.in',       status: 'active' },
            { id: 'os-chennai', name: 'OS Chennai',         domain: 'oschennai.in',  status: 'active' }
        ];
    }
};

window.NexusCore = NexusCore;
