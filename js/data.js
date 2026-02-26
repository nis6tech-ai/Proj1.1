/**
 * Seed data for the Nutpa client.
 * In a multi-tenant environment, this serves as the default fallback.
 */

const initialData = {
    settings: {
        siteName: 'Nutpa',
        siteTagline: 'Next-Gen Tech Solutions',
        siteLogo: 'assets/logo.png',
        contactEmail: 'sales@nutpa.com',
        contactPhone: '9940428882',
        contactAddress: 'No 1/2, Janakiraman st, 83rd St, Muthurangam Block, West Jafferkhanpet, Chennai,Tamil Nadu 600083',
        whatsappNumber: '919940428882',
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        heroImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200'
    },
    categories: [
        { id: 'laptops', name: 'Laptops', image: 'https://images.unsplash.com/photo-1517336712461-752110247711?auto=format&fit=crop&q=80&w=800' },
        { id: 'printers', name: 'Printers', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800' },
        { id: 'projectors', name: 'Projectors', image: 'https://images.unsplash.com/photo-1535016120720-40c646be996a?auto=format&fit=crop&q=80&w=800' },
        { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?auto=format&fit=crop&q=80&w=800' }
    ],
    products: []
};

// Global exports for both public site and CMS
window.initialData = initialData;

// Logic to pull from LocalStorage (NexusCore) or use initial fallback
let liveData;
if (typeof NexusCore !== 'undefined') {
    liveData = NexusCore.init('nutpa', initialData);
} else {
    const stored = localStorage.getItem('nexus_data_nutpa');
    liveData = stored ? JSON.parse(stored) : initialData;
}

const categories = liveData.categories;
const products = liveData.products;
const settings = liveData.settings;
