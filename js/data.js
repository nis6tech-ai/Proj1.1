/**
 * Nutpa Data Bridge - PHP Version
 * Fetches live data from MySQL instead of Firebase/Hardcoded arrays.
 */

window.liveData = {
    settings: {},
    categories: [],
    products: []
};

// Global WhatsApp Formatter - Ensures 91 prefix for India
window.formatWhatsappNumber = function (num) {
    if (!num) return '919940428882';
    let clean = String(num).replace(/[^0-9]/g, '');
    // If it's 10 digits, it's definitely India, prepend 91
    if (clean.length === 10) return '91' + clean;
    // If it starts with 994 and is 10 digits, it's definitely India (not Azerbaijan country code +994)
    // Azerbaijan numbers are usually 9 digits after +994. 
    // India mobile numbers starting with 99 are very common.
    return clean;
};

// Determine Project ID based on domain or fallback
window.currentProjectId = window.location.hostname.includes('oschennai') || window.location.hostname.includes('os-chennai') ? 'os-chennai' : 'nutpa';

async function loadLiveSiteData() {
    try {
        const response = await fetch(`/api/sync.php?action=get_data&project=${window.currentProjectId}`);
        const data = await response.json();

        if (data.error) {
            console.error("Database Error:", data.error);
            return;
        }

        window.liveData = data;

        window.products = data.products || [];
        window.categories = data.categories || [];
        window.settings = data.settings || {};
        window.blogs = data.blogs || [];

        // Safety check
        if (!window.settings) window.settings = {};
        if (!window.products) window.products = [];

        // Custom event so components can start rendering
        window.dispatchEvent(new Event('dataLoaded'));
        console.log("PHP Data Load: Success");
        // Wait for all specific page dataLoaded listeners to finish setting innerHTML
        setTimeout(() => {
            applyDynamicSettings(data.settings);
        }, 100);

    } catch (e) {
        console.error("PHP Data Load: Failed", e);
    }
}

function applyDynamicSettings(settings) {
    if (!settings) return;

    function updateTextNodes(node, search, replaceStr) {
        if (replaceStr === undefined || replaceStr === null) return;
        const replaceVal = String(replaceStr);
        if (replaceVal.trim() === '') return;
        if (node.nodeType === 3) {
            if (node.nodeValue.includes(search)) {
                node.nodeValue = node.nodeValue.split(search).join(replaceStr);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            node.childNodes.forEach(child => updateTextNodes(child, search, replaceStr));
        }
    }

    // 0. Update Site Branding (Name & Tagline)
    const siteName = settings.siteName || settings.site_name;
    const siteTagline = settings.siteTagline || settings.site_tagline;

    if (siteName) {
        // Replace hardcoded "Nutpa Electronics", "Nutpa", "OS Chennai" etc.
        updateTextNodes(document.body, 'Nutpa Electronics', siteName);
        updateTextNodes(document.body, 'Nutpa', siteName);
        updateTextNodes(document.body, 'OS Chennai', siteName);
        document.title = siteName + (siteTagline ? ' | ' + siteTagline : '');
    }

    if (siteTagline) {
        updateTextNodes(document.body, 'Enterprise Software & Hardware Solutions', siteTagline);
        updateTextNodes(document.body, 'Authorized Enterprise Partner for Tamil Nadu', siteTagline);
    }

    const defaultPhone = '9940428882';
    const defaultEmail = 'sales@nutpa.com';
    const defaultWa = '919940428882';
    const defaultInsta = 'https://instagram.com';
    const defaultLinkedin = 'https://linkedin.com';

    // Address defaults
    const addressDefault1 = 'No 1/2, Janakiraman St, West Jafferkhanpet, Chennai — 600083, Tamil Nadu';
    const addressDefault2 = 'West Jafferkhanpet, Chennai';
    const addressDefault3 = 'No 1/2, Janakiraman St, West Jafferkhanpet';

    // 1. Update Phone Numbers
    const phone = settings.contactPhone || settings.contact_phone;
    if (phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = 'tel:' + phone.replace(/[^0-9+]/g, ''));
        updateTextNodes(document.body, defaultPhone, phone);
        updateTextNodes(document.body, '+91 9940428882', '+91 ' + phone);
        updateTextNodes(document.body, '99404 28882', phone);
    }

    // 2. Update WhatsApp Numbers
    const wa = settings.whatsappNumber || settings.whatsapp_number;
    const cleanWaArr = window.formatWhatsappNumber(wa);

    if (wa) {
        const siteName = settings.siteName || settings.site_name || (window.currentProjectId === 'os-chennai' ? "OS Chennai" : "Nutpa");
        const defaultMsg = encodeURIComponent(`Hi ${siteName}, I have a general enquiry about your IT hardware solutions for my business.`);

        // Target all WhatsApp links including floating buttons
        document.querySelectorAll('a[href^="https://wa.me/"], a[href*="wa.me/"], #floatWa').forEach(a => {
            // Respect existing query params like ?text=
            try {
                const urlStr = a.href;
                const textMatch = urlStr.match(/[?&]text=([^&]*)/);
                const text = textMatch ? textMatch[1] : defaultMsg;
                a.href = `https://wa.me/${cleanWaArr}?text=${text}`;
            } catch (e) {
                a.href = `https://wa.me/${cleanWaArr}?text=${defaultMsg}`;
            }
        });
        // Update any text mention of the default number to include +91 for mobile sanity
        updateTextNodes(document.body, defaultWa, cleanWaArr);
        updateTextNodes(document.body, '9940428882', '919940428882');
    }

    // 3. Update Email
    const email = settings.contactEmail || settings.contact_email;
    if (email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.href = 'mailto:' + email);
        updateTextNodes(document.body, defaultEmail, email);
    }

    // 4. Update Address
    const address = settings.contactAddress || settings.contact_address;
    if (address) {
        updateTextNodes(document.body, addressDefault1, address);
        updateTextNodes(document.body, addressDefault2, address);
        updateTextNodes(document.body, addressDefault3, address);
    }

    // 5. Update Social Links
    const social = settings.socialLinks || settings.social_links;
    if (social) {
        let s = social;
        if (typeof social === 'string') {
            try { s = JSON.parse(social); } catch (e) { s = {}; }
        }

        if (s.instagram) {
            document.querySelectorAll(`a[href^="${defaultInsta}"]`).forEach(a => a.href = s.instagram);
        }
        if (s.linkedin) {
            document.querySelectorAll(`a[href^="${defaultLinkedin}"]`).forEach(a => a.href = s.linkedin);
        }
    }

    // 6. Update Hero Image
    const hero = settings.heroImage || settings.hero_image;
    if (hero) {
        // Try to find common hero image locations
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) heroSection.style.backgroundImage = `url(${hero})`;
        const heroImg = document.querySelector('#heroImage, .hero-img');
        if (heroImg) heroImg.src = hero;
    }

    // 7. Update Logo
    const logo = settings.siteLogo || settings.site_logo;
    if (logo) {
        document.querySelectorAll('#navLogo, #footerLogo, .logo-img').forEach(img => {
            img.src = logo;
        });
    }

    // 8. Update SEO Meta & Title
    const sTitle = settings.siteTitle || settings.site_title;
    const sKeywords = settings.siteKeywords || settings.site_keywords;
    const sDesc = settings.siteDescription || settings.site_description;
    const sFavicon = settings.siteFavicon || settings.site_favicon;

    if (sTitle) {
        document.title = sTitle;
    } else if (siteName) {
        document.title = siteName + (siteTagline ? ' | ' + siteTagline : '');
    }

    if (sKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = "keywords";
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = sKeywords;
    }

    if (sDesc) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = sDesc;
    }

    if (sFavicon) {
        // Nutpa doesn't have resolveAsset in this file, but it seems to use direct URLs or relative
        const resolvedFav = sFavicon.startsWith('http') || sFavicon.startsWith('assets/') ? sFavicon : 'https://www.nutpa.in/' + sFavicon.replace(/^\//, '');
        let linkFav = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (!linkFav) {
            linkFav = document.createElement('link');
            linkFav.rel = "icon";
            document.head.appendChild(linkFav);
        }
        linkFav.href = resolvedFav;
    }
}

// Start loading immediately
loadLiveSiteData();
