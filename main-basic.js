const { Actor } = require('apify');
const QRCode = require('qrcode');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * QR Code API Actor - Main Entry Point
 * Generates customized QR codes with support for multiple formats and bulk processing
 */

/**
 * Format content based on QR code type
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
            return `sms:${content}`;

        case 'wifi':
            // Expected format: { ssid, password, encryption }
            try {
                const wifi = typeof content === 'string' ? JSON.parse(content) : content;
                return `WIFI:T:${wifi.encryption || 'WPA'};S:${wifi.ssid};P:${wifi.password};;`;
            } catch (e) {
                return content;
            }

        case 'vcard':
            // Expected format: { name, phone, email, organization }
            try {
                const vcard = typeof content === 'string' ? JSON.parse(content) : content;
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}\nTEL:${vcard.phone || ''}\nEMAIL:${vcard.email || ''}\nORG:${vcard.organization || ''}\nEND:VCARD`;
            } catch (e) {
                return content;
            }

        case 'social':
            // Expected format: { platform, username }
            try {
                const social = typeof content === 'string' ? JSON.parse(content) : content;
                const platforms = {
                    twitter: `https://twitter.com/${social.username}`,
                    instagram: `https://instagram.com/${social.username}`,
                    facebook: `https://facebook.com/${social.username}`,
                    linkedin: `https://linkedin.com/in/${social.username}`,
                    youtube: `https://youtube.com/@${social.username}`
                };
                return platforms[social.platform.toLowerCase()] || content;
            } catch (e) {
                return content;
            }

        default:
            return content;
    }
}

/**
 * Download and process logo image
 */
async function downloadLogo(logoUrl) {
    try {
        const response = await axios.get(logoUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.log(`Warning: Failed to download logo from ${logoUrl}: ${error.message}`);
        return null;
    }
}

/**
 * Generate QR code as PNG with optional logo overlay
 */
async function generatePNG(content, customization, id) {
    const options = {
        errorCorrectionLevel: customization.errorCorrectionLevel || 'M',
        type: 'png',
        width: customization.size || 300,
        margin: customization.margin || 4,
        color: {
            dark: customization.foregroundColor || '#000000',
            light: customization.backgroundColor || '#FFFFFF'
        }
    };

    // Generate base QR code
    const qrBuffer = await QRCode.toBuffer(content, options);

    // If logo is provided, overlay it on the QR code
    if (customization.logoUrl) {
        try {
            const logoBuffer = await downloadLogo(customization.logoUrl);
            if (logoBuffer) {
                const qrSize = customization.size || 300;
                const logoSizePercent = customization.logoSize || 20;
                const logoSize = Math.floor((qrSize * logoSizePercent) / 100);

                // Resize logo
                const resizedLogo = await sharp(logoBuffer)
                    .resize(logoSize, logoSize, { fit: 'contain' })
                    .toBuffer();

                // Overlay logo on QR code
                const finalImage = await sharp(qrBuffer)
                    .composite([{
                        input: resizedLogo,
                        gravity: 'center'
                    }])
                    .toBuffer();

                return finalImage;
            }
        } catch (error) {
            console.log(`Warning: Failed to add logo to QR code ${id}: ${error.message}`);
        }
    }

    return qrBuffer;
}

/**
 * Generate QR code as SVG
 */
async function generateSVG(content, customization) {
    const options = {
        errorCorrectionLevel: customization.errorCorrectionLevel || 'M',
        type: 'svg',
        width: customization.size || 300,
        margin: customization.margin || 4,
        color: {
            dark: customization.foregroundColor || '#000000',
            light: customization.backgroundColor || '#FFFFFF'
        }
    };

    return await QRCode.toString(content, options);
}

/**
 * Generate QR code as PDF
 */
async function generatePDF(content, customization, id, filenamePrefix) {
    return new Promise(async (resolve, reject) => {
        try {
            // First generate PNG
            const pngBuffer = await generatePNG(content, customization, id);

            // Create PDF
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Add title
            doc.fontSize(20).text(`QR Code: ${id || filenamePrefix}`, {
                align: 'center'
            });

            doc.moveDown();

            // Add QR code image
            const qrSize = Math.min(customization.size || 300, 400);
            doc.image(pngBuffer, {
                fit: [qrSize, qrSize],
                align: 'center'
            });

            doc.moveDown();

            // Add content text
            doc.fontSize(10).text(`Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`, {
                align: 'center'
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Save file to Key-Value Store and get public URL
 */
async function saveToKVStore(buffer, filename, contentType) {
    await Actor.setValue(filename, buffer, { contentType });

    // Get the public URL
    const store = await Actor.openKeyValueStore();
    const storeId = store.id || process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID;
    const publicUrl = `https://api.apify.com/v2/key-value-stores/${storeId}/records/${filename}`;

    return publicUrl;
}

/**
 * Process a single QR code
 */
async function processQRCode(qrConfig, globalCustomization, input, index) {
    const id = qrConfig.id || `qr-${index + 1}`;
    const customization = { ...globalCustomization, ...(qrConfig.customization || {}) };
    const content = formatQRContent(qrConfig.type, qrConfig.content);

    console.log(`Processing QR code ${id} (type: ${qrConfig.type})`);

    const result = {
        id,
        type: qrConfig.type,
        content: qrConfig.content,
        formattedContent: content,
        format: input.outputFormat,
        size: customization.size,
        timestamp: new Date().toISOString(),
        customization: {
            errorCorrectionLevel: customization.errorCorrectionLevel,
            foregroundColor: customization.foregroundColor,
            backgroundColor: customization.backgroundColor,
            hasLogo: !!customization.logoUrl
        }
    };

    try {
        const formats = input.outputFormat === 'all' ? ['png', 'svg', 'pdf'] : [input.outputFormat];
        const files = {};

        for (const format of formats) {
            const filename = `${input.filenamePrefix || 'qr-code'}-${id}.${format}`;
            let fileData;
            let contentType;

            switch (format) {
                case 'png':
                    fileData = await generatePNG(content, customization, id);
                    contentType = 'image/png';
                    break;

                case 'svg':
                    fileData = await generateSVG(content, customization);
                    contentType = 'image/svg+xml';
                    break;

                case 'pdf':
                    fileData = await generatePDF(content, customization, id, input.filenamePrefix || 'qr-code');
                    contentType = 'application/pdf';
                    break;
            }

            if (input.saveToKeyValueStore && fileData) {
                const url = await saveToKVStore(fileData, filename, contentType);
                files[format] = {
                    filename,
                    url,
                    size: Buffer.byteLength(fileData)
                };
            }
        }

        result.files = files;
        result.fileUrl = files[formats[0]]?.url; // Primary file URL
        result.success = true;

        // Analytics tracking data
        if (input.enableAnalytics) {
            result.analytics = {
                trackingId: id,
                createdAt: result.timestamp,
                scanCount: 0, // Would be updated by external tracking service
                lastScanned: null
            };
        }

        console.log(`✓ Successfully generated QR code ${id}`);

    } catch (error) {
        console.error(`✗ Failed to generate QR code ${id}: ${error.message}`);
        result.success = false;
        result.error = error.message;
    }

    return result;
}

/**
 * Main Actor function
 */
Actor.main(async () => {
    console.log('QR Code API Actor started');

    // Get input
    const input = await Actor.getInput();

    // Validate input
    if (!input || !input.qrCodes || !Array.isArray(input.qrCodes) || input.qrCodes.length === 0) {
        throw new Error('Invalid input: qrCodes array is required and must contain at least one QR code configuration');
    }

    console.log(`Configuration:
- QR codes to generate: ${input.qrCodes.length}
- Output format: ${input.outputFormat || 'png'}
- Max concurrency: ${input.maxConcurrency || 10}
- Analytics enabled: ${input.enableAnalytics !== false}
- Save to KV Store: ${input.saveToKeyValueStore !== false}
`);

    const globalCustomization = input.customization || {};
    const results = [];

    // Process QR codes with concurrency control
    const maxConcurrency = input.maxConcurrency || 10;
    const chunks = [];

    for (let i = 0; i < input.qrCodes.length; i += maxConcurrency) {
        chunks.push(input.qrCodes.slice(i, i + maxConcurrency));
    }

    let processedCount = 0;
    for (const chunk of chunks) {
        const promises = chunk.map((qrConfig, idx) =>
            processQRCode(qrConfig, globalCustomization, input, processedCount + idx)
        );

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
        processedCount += chunk.length;

        console.log(`Progress: ${processedCount}/${input.qrCodes.length} QR codes processed`);
    }

    // Save results to dataset
    await Actor.pushData(results);

    // Summary statistics
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`
========================================
QR Code Generation Complete
========================================
Total QR codes: ${results.length}
Successful: ${successCount}
Failed: ${failureCount}
Output format: ${input.outputFormat || 'png'}
========================================
    `);

    // Save summary to output
    await Actor.setValue('OUTPUT', {
        summary: {
            total: results.length,
            successful: successCount,
            failed: failureCount,
            format: input.outputFormat || 'png'
        },
        results: results.map(r => ({
            id: r.id,
            type: r.type,
            success: r.success,
            fileUrl: r.fileUrl,
            error: r.error
        }))
    });

    console.log('Actor finished successfully');
});
