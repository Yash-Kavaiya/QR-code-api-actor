/**
 * Utility Functions
 * Common helper functions used across the Actor
 */

const ical = require('ical-generator');

/**
 * Format content based on QR code type with advanced handling
 */
function formatQRContent(type, content) {
    switch (type.toLowerCase()) {
        case 'url':
            return content;

        case 'text':
            return content;

        case 'email':
            return `mailto:${content}`;

        case 'phone':
            return `tel:${content}`;

        case 'sms':
            // SMS format: sms:phone?body=message
            try {
                const sms = typeof content === 'string' && content.startsWith('{') ? JSON.parse(content) : { phone: content };
                return sms.message
                    ? `sms:${sms.phone}?body=${encodeURIComponent(sms.message)}`
                    : `sms:${sms.phone}`;
            } catch (e) {
                return `sms:${content}`;
            }

        case 'wifi':
            // WIFI format: WIFI:T:WPA;S:ssid;P:password;H:hidden;;
            try {
                const wifi = typeof content === 'string' ? JSON.parse(content) : content;
                const hidden = wifi.hidden ? 'true' : 'false';
                return `WIFI:T:${wifi.encryption || 'WPA'};S:${wifi.ssid};P:${wifi.password};H:${hidden};;`;
            } catch (e) {
                return content;
            }

        case 'vcard':
            // vCard format
            try {
                const vcard = typeof content === 'string' ? JSON.parse(content) : content;
                let vcardString = 'BEGIN:VCARD\nVERSION:3.0\n';
                vcardString += `FN:${vcard.name}\n`;
                if (vcard.phone) vcardString += `TEL:${vcard.phone}\n`;
                if (vcard.email) vcardString += `EMAIL:${vcard.email}\n`;
                if (vcard.organization) vcardString += `ORG:${vcard.organization}\n`;
                if (vcard.title) vcardString += `TITLE:${vcard.title}\n`;
                if (vcard.url) vcardString += `URL:${vcard.url}\n`;
                if (vcard.address) vcardString += `ADR:;;${vcard.address};;;;\n`;
                vcardString += 'END:VCARD';
                return vcardString;
            } catch (e) {
                return content;
            }

        case 'social':
            // Social media links
            try {
                const social = typeof content === 'string' ? JSON.parse(content) : content;
                const platforms = {
                    twitter: `https://twitter.com/${social.username}`,
                    instagram: `https://instagram.com/${social.username}`,
                    facebook: `https://facebook.com/${social.username}`,
                    linkedin: `https://linkedin.com/in/${social.username}`,
                    youtube: `https://youtube.com/@${social.username}`,
                    tiktok: `https://tiktok.com/@${social.username}`,
                    github: `https://github.com/${social.username}`,
                    discord: social.username // Discord invite or user tag
                };
                return platforms[social.platform.toLowerCase()] || content;
            } catch (e) {
                return content;
            }

        case 'geo':
        case 'location':
            // Geographic location: geo:latitude,longitude
            try {
                const geo = typeof content === 'string' ? JSON.parse(content) : content;
                return `geo:${geo.latitude},${geo.longitude}`;
            } catch (e) {
                return content;
            }

        case 'calendar':
        case 'event':
            // iCalendar event
            try {
                const event = typeof content === 'string' ? JSON.parse(content) : content;
                const calendar = ical({ name: event.title || 'Event' });
                calendar.createEvent({
                    start: new Date(event.start),
                    end: new Date(event.end || event.start),
                    summary: event.title,
                    description: event.description || '',
                    location: event.location || ''
                });
                return calendar.toString();
            } catch (e) {
                return content;
            }

        case 'app':
        case 'app_store':
            // Smart app store link
            try {
                const app = typeof content === 'string' ? JSON.parse(content) : content;
                // Returns a URL that detects platform and redirects to appropriate store
                if (app.universal) {
                    return app.universal;
                }
                // Fallback to creating a simple redirect page info
                return `App: iOS=${app.ios || ''}, Android=${app.android || ''}`;
            } catch (e) {
                return content;
            }

        case 'payment':
            // Payment QR codes (varies by region/standard)
            try {
                const payment = typeof content === 'string' ? JSON.parse(content) : content;
                // Example: UPI format (India)
                if (payment.upi) {
                    return `upi://pay?pa=${payment.upi}&pn=${payment.name || ''}&am=${payment.amount || ''}`;
                }
                // Bitcoin
                if (payment.bitcoin) {
                    return `bitcoin:${payment.bitcoin}${payment.amount ? `?amount=${payment.amount}` : ''}`;
                }
                return content;
            } catch (e) {
                return content;
            }

        default:
            return content;
    }
}

/**
 * Generate unique filename
 */
function generateFilename(prefix, id, format, timestamp = false) {
    const ts = timestamp ? `-${Date.now()}` : '';
    return `${prefix}-${id}${ts}.${format}`;
}

/**
 * Parse color string to RGB
 */
function parseColor(colorString) {
    const hex = colorString.replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? parseColor(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? parseColor(color2) : color2;

    const luminance = (rgb) => {
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = luminance(rgb1);
    const lum2 = luminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate color contrast for accessibility
 */
function validateColorContrast(foreground, background) {
    const ratio = calculateContrastRatio(foreground, background);
    return {
        ratio,
        passAA: ratio >= 4.5, // WCAG AA standard
        passAAA: ratio >= 7.0, // WCAG AAA standard
        recommendation: ratio < 4.5 ? 'Colors have poor contrast. Consider using darker foreground or lighter background.' : 'Color contrast is good'
    };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9.-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

/**
 * Generate summary statistics
 */
function generateSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const byType = results.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {});

    const totalSize = successful.reduce((sum, r) => {
        if (r.files) {
            return sum + Object.values(r.files).reduce((s, f) => s + (f.size || 0), 0);
        }
        return sum;
    }, 0);

    return {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: results.length > 0 ? ((successful.length / results.length) * 100).toFixed(2) + '%' : '0%',
        byType,
        totalSize: formatBytes(totalSize),
        averageSize: formatBytes(totalSize / (successful.length || 1))
    };
}

/**
 * Sleep/delay utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await sleep(delayMs * Math.pow(2, attempt - 1));
        }
    }
}

/**
 * Chunk array into smaller arrays
 */
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Generate tracking URL
 */
function generateTrackingUrl(baseUrl, qrId, originalUrl) {
    const params = new URLSearchParams({
        id: qrId,
        redirect: originalUrl,
        timestamp: Date.now()
    });
    return `${baseUrl}?${params.toString()}`;
}

module.exports = {
    formatQRContent,
    generateFilename,
    parseColor,
    calculateContrastRatio,
    validateColorContrast,
    formatBytes,
    sanitizeFilename,
    generateSummary,
    sleep,
    retry,
    chunkArray,
    generateTrackingUrl
};
