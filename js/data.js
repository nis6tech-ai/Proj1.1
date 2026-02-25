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
        contactPhone: '+1 (234) 567-890',
        contactAddress: '123 Tech Avenue, Silicon Valley',
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
    products: [
        {
            id: 1,
            name: 'MacBook Pro M3 Max',
            category: 'laptops',
            price: '$3,499',
            image: 'https://images.unsplash.com/photo-1517336712461-eddc241ad13e?auto=format&fit=crop&q=80&w=800',
            description: 'The most powerful MacBook ever. Featuring the M3 Max chip for extreme performance.',
            features: ['16-Core CPU', '40-Core GPU', '128GB Unified Memory', '8TB SSD Storage']
        },
        {
            id: 2,
            name: 'HP LaserJet Enterprise',
            category: 'printers',
            price: '$899',
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
            description: 'Fastest printing in its class with industry-leading security features.',
            features: ['50 ppm', 'Auto Duplex', 'Ethernet & Wi-Fi', 'Smart Security']
        },
        {
            id: 3,
            name: 'Epson 4K Laser Projector',
            category: 'projectors',
            price: '$2,999',
            image: 'https://images.unsplash.com/photo-1535016120720-40c646be996a?auto=format&fit=crop&q=80&w=800',
            description: 'Immense 4K cinematic experience with ultra-bright laser technology.',
            features: ['4K UHD Resolution', '2500 Lumens', 'HDR10 Support', 'Laser Light Source']
        }
    ]
};

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
