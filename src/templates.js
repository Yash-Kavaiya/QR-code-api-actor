/**
 * QR Code Templates System
 * Provides pre-designed templates for common use cases
 */

const { STYLE_TYPES, FRAME_STYLES } = require('./stylingEngine');

/**
 * Pre-defined templates for common scenarios
 */
const TEMPLATES = {
    // Business & Professional
    BUSINESS_CARD: {
        name: 'Business Card',
        description: 'Professional QR code for business cards',
        customization: {
            size: 300,
            margin: 4,
            errorCorrectionLevel: 'H',
            foregroundColor: '#1a1a1a',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.CLASSY_ROUNDED,
            frame: FRAME_STYLES.BASIC
        }
    },

    CORPORATE: {
        name: 'Corporate',
        description: 'Clean corporate style with subtle branding',
        customization: {
            size: 400,
            margin: 5,
            errorCorrectionLevel: 'M',
            foregroundColor: '#003366',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.EDGE
        }
    },

    // Marketing & Creative
    VIBRANT: {
        name: 'Vibrant',
        description: 'Eye-catching design for marketing materials',
        customization: {
            size: 400,
            margin: 4,
            errorCorrectionLevel: 'M',
            foregroundColor: '#FF6B35',
            backgroundColor: '#FFF5E6',
            style: STYLE_TYPES.DOTS,
            frame: FRAME_STYLES.BANNER,
            gradientType: 'linear-vertical',
            gradientColors: ['#FF6B35', '#FF0080']
        }
    },

    GRADIENT_MODERN: {
        name: 'Gradient Modern',
        description: 'Modern gradient design for tech brands',
        customization: {
            size: 400,
            margin: 3,
            errorCorrectionLevel: 'M',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.NONE,
            gradientType: 'radial',
            gradientColors: ['#667eea', '#764ba2']
        }
    },

    // Social Media
    SOCIAL_MEDIA: {
        name: 'Social Media',
        description: 'Optimized for social media profiles',
        customization: {
            size: 500,
            margin: 3,
            errorCorrectionLevel: 'H',
            foregroundColor: '#1DA1F2',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.CIRCULAR
        }
    },

    INSTAGRAM: {
        name: 'Instagram Style',
        description: 'Instagram-inspired gradient design',
        customization: {
            size: 500,
            margin: 3,
            errorCorrectionLevel: 'M',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.CIRCULAR,
            gradientType: 'radial',
            gradientColors: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']
        }
    },

    // Retail & E-commerce
    PRODUCT_TAG: {
        name: 'Product Tag',
        description: 'Compact design for product labels',
        customization: {
            size: 200,
            margin: 2,
            errorCorrectionLevel: 'Q',
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.BASIC
        }
    },

    PROMOTIONAL: {
        name: 'Promotional',
        description: 'Bold design for promotional campaigns',
        customization: {
            size: 400,
            margin: 4,
            errorCorrectionLevel: 'H',
            foregroundColor: '#FF0000',
            backgroundColor: '#FFFF00',
            style: STYLE_TYPES.DOTS,
            frame: FRAME_STYLES.BANNER
        }
    },

    // Event & Hospitality
    EVENT_TICKET: {
        name: 'Event Ticket',
        description: 'High reliability for event tickets',
        customization: {
            size: 400,
            margin: 5,
            errorCorrectionLevel: 'H',
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.EDGE
        }
    },

    RESTAURANT_MENU: {
        name: 'Restaurant Menu',
        description: 'Easy-to-scan design for table menus',
        customization: {
            size: 500,
            margin: 4,
            errorCorrectionLevel: 'M',
            foregroundColor: '#2C3E50',
            backgroundColor: '#ECF0F1',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.BASIC
        }
    },

    // Print & Packaging
    PRINT_HIGH_QUALITY: {
        name: 'Print High Quality',
        description: 'High resolution for professional printing',
        customization: {
            size: 1000,
            margin: 6,
            errorCorrectionLevel: 'H',
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.NONE
        }
    },

    MINIMALIST: {
        name: 'Minimalist',
        description: 'Clean and simple design',
        customization: {
            size: 300,
            margin: 3,
            errorCorrectionLevel: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.NONE
        }
    },

    // Specialized
    WIFI_SHARING: {
        name: 'WiFi Sharing',
        description: 'Optimized for WiFi credential sharing',
        customization: {
            size: 400,
            margin: 4,
            errorCorrectionLevel: 'Q',
            foregroundColor: '#4A90E2',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.BASIC,
            frameText: 'Scan to Connect'
        }
    },

    PAYMENT: {
        name: 'Payment',
        description: 'Secure design for payment QR codes',
        customization: {
            size: 400,
            margin: 5,
            errorCorrectionLevel: 'H',
            foregroundColor: '#27AE60',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.SQUARE,
            frame: FRAME_STYLES.EDGE
        }
    },

    APP_DOWNLOAD: {
        name: 'App Download',
        description: 'Designed for app store links',
        customization: {
            size: 400,
            margin: 4,
            errorCorrectionLevel: 'M',
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            style: STYLE_TYPES.ROUNDED,
            frame: FRAME_STYLES.BANNER,
            frameText: 'Download App'
        }
    }
};

/**
 * Get template by name
 */
function getTemplate(templateName) {
    const template = TEMPLATES[templateName.toUpperCase().replace(/[- ]/g, '_')];
    if (!template) {
        throw new Error(`Template not found: ${templateName}`);
    }
    return template;
}

/**
 * List all available templates
 */
function listTemplates() {
    return Object.entries(TEMPLATES).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description
    }));
}

/**
 * Apply template to QR code configuration
 */
function applyTemplate(qrConfig, templateName, overrides = {}) {
    const template = getTemplate(templateName);

    return {
        ...qrConfig,
        customization: {
            ...template.customization,
            ...qrConfig.customization,
            ...overrides
        }
    };
}

/**
 * Batch apply template to multiple QR codes
 */
function batchApplyTemplate(qrCodes, templateName, overrides = {}) {
    return qrCodes.map(qr => applyTemplate(qr, templateName, overrides));
}

/**
 * Create custom template
 */
function createCustomTemplate(name, description, customization) {
    return {
        name,
        description,
        customization,
        isCustom: true
    };
}

/**
 * Get template recommendations based on use case
 */
function getTemplateRecommendations(type, useCase) {
    const recommendations = {
        url: {
            marketing: ['VIBRANT', 'GRADIENT_MODERN', 'PROMOTIONAL'],
            business: ['CORPORATE', 'BUSINESS_CARD', 'MINIMALIST'],
            social: ['SOCIAL_MEDIA', 'INSTAGRAM'],
            print: ['PRINT_HIGH_QUALITY', 'MINIMALIST']
        },
        vcard: ['BUSINESS_CARD', 'CORPORATE', 'MINIMALIST'],
        wifi: ['WIFI_SHARING', 'MINIMALIST'],
        email: ['BUSINESS_CARD', 'CORPORATE'],
        phone: ['BUSINESS_CARD', 'CORPORATE'],
        social: ['SOCIAL_MEDIA', 'INSTAGRAM', 'VIBRANT']
    };

    if (recommendations[type]) {
        if (typeof recommendations[type] === 'object' && useCase) {
            return recommendations[type][useCase] || [];
        }
        return Array.isArray(recommendations[type]) ? recommendations[type] : [];
    }

    return ['MINIMALIST', 'CORPORATE'];
}

/**
 * Generate template preview metadata
 */
function getTemplatePreview(templateName) {
    const template = getTemplate(templateName);

    return {
        name: template.name,
        description: template.description,
        settings: {
            size: template.customization.size,
            style: template.customization.style,
            colors: {
                foreground: template.customization.foregroundColor,
                background: template.customization.backgroundColor
            },
            hasGradient: !!template.customization.gradientType,
            hasFrame: template.customization.frame !== FRAME_STYLES.NONE,
            errorCorrection: template.customization.errorCorrectionLevel
        }
    };
}

module.exports = {
    TEMPLATES,
    getTemplate,
    listTemplates,
    applyTemplate,
    batchApplyTemplate,
    createCustomTemplate,
    getTemplateRecommendations,
    getTemplatePreview
};
