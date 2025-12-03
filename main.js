/**
 * QR Code API Actor - Advanced Version 2.0
 *
 * Advanced features include:
 * - Custom styling (dots, rounded, gradients, frames)
 * - URL shortening integration
 * - Batch CSV/JSON import
 * - ZIP export
 * - QR code validation
 * - Template system
 * - Webhook notifications
 * - And much more!
 */

const { Actor } = require('apify');
const QRCode = require('qrcode');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Import custom modules
const { generateStyledQR } = require('./src/stylingEngine');
const { shortenUrl, createTrackingUrl } = require('./src/urlShortener');
const { loadBatchData, exportToCSV } = require('./src/batchProcessor');
const { createZipArchive, saveZipToKVStore, addFilesToArchive } = require('./src/zipExporter');
const { validateQRCode, batchValidate } = require('./src/validator');
const { getTemplate, applyTemplate, listTemplates } = require('./src/templates');
const { WebhookManager, notifyGenerationStarted } = require('./src/webhooks');
const { formatQRContent, generateSummary, chunkArray, formatBytes } = require('./src/utils');

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
    // If advanced styling is enabled, use styled generator
    if (customization.style || customization.gradientType || customization.frame) {
        return await generateStyledQR(content, customization);
    }

    // Otherwise use standard generation
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

    const qrBuffer = await QRCode.toBuffer(content, options);

    // Add logo if provided
    if (customization.logoUrl) {
        try {
            const logoBuffer = await downloadLogo(customization.logoUrl);
            if (logoBuffer) {
                const qrSize = customization.size || 300;
                const logoSizePercent = customization.logoSize || 20;
                const logoSize = Math.floor((qrSize * logoSizePercent) / 100);

                const resizedLogo = await sharp(logoBuffer)
                    .resize(logoSize, logoSize, { fit: 'contain' })
                    .toBuffer();

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
            const pngBuffer = await generatePNG(content, customization, id);
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text(`QR Code: ${id || filenamePrefix}`, { align: 'center' });
            doc.moveDown();

            const qrSize = Math.min(customization.size || 300, 400);
            doc.image(pngBuffer, { fit: [qrSize, qrSize], align: 'center' });
            doc.moveDown();

            doc.fontSize(10).text(`Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`, { align: 'center' });
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

    const store = await Actor.openKeyValueStore();
    const storeId = store.id || process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID;
    const publicUrl = `https://api.apify.com/v2/key-value-stores/${storeId}/records/${filename}`;

    return publicUrl;
}

/**
 * Process a single QR code with advanced features
 */
async function processQRCode(qrConfig, globalCustomization, input, index, webhookManager) {
    const id = qrConfig.id || `qr-${index + 1}`;
    let customization = { ...globalCustomization, ...(qrConfig.customization || {}) };

    // Apply template if specified
    if (qrConfig.template || input.template) {
        try {
            const templateName = qrConfig.template || input.template;
            const template = getTemplate(templateName);
            customization = { ...template.customization, ...customization };
            console.log(`Applied template: ${template.name} to QR code ${id}`);
        } catch (error) {
            console.log(`Warning: Template not found: ${error.message}`);
        }
    }

    let content = qrConfig.content;

    // Apply URL shortening if enabled
    if (input.urlShortening?.enabled && qrConfig.type === 'url') {
        try {
            content = await shortenUrl(
                content,
                input.urlShortening.service,
                input.urlShortening.apiKey
            );
            console.log(`Shortened URL for ${id}: ${content}`);
        } catch (error) {
            console.log(`URL shortening failed for ${id}: ${error.message}`);
        }
    }

    // Create tracking URL if enabled
    if (input.trackingUrl) {
        content = createTrackingUrl(input.trackingUrl, id, content);
    }

    const formattedContent = formatQRContent(qrConfig.type, content);

    console.log(`Processing QR code ${id} (type: ${qrConfig.type})`);

    const result = {
        id,
        type: qrConfig.type,
        content: qrConfig.content,
        formattedContent,
        format: input.outputFormat,
        size: customization.size,
        timestamp: new Date().toISOString(),
        customization: {
            errorCorrectionLevel: customization.errorCorrectionLevel,
            foregroundColor: customization.foregroundColor,
            backgroundColor: customization.backgroundColor,
            hasLogo: !!customization.logoUrl,
            style: customization.style,
            hasGradient: !!customization.gradientType,
            hasFrame: !!customization.frame
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
                    fileData = await generatePNG(formattedContent, customization, id);
                    contentType = 'image/png';
                    break;

                case 'svg':
                    fileData = await generateSVG(formattedContent, customization);
                    contentType = 'image/svg+xml';
                    break;

                case 'pdf':
                    fileData = await generatePDF(formattedContent, customization, id, input.filenamePrefix || 'qr-code');
                    contentType = 'application/pdf';
                    break;
            }

            if (fileData) {
                const fileSize = Buffer.byteLength(fileData);
                files[format] = {
                    filename,
                    buffer: fileData,
                    size: fileSize
                };

                // Save to KV Store if enabled
                if (input.saveToKeyValueStore !== false) {
                    const url = await saveToKVStore(fileData, filename, contentType);
                    files[format].url = url;
                }
            }
        }

        result.files = files;
        result.fileUrl = files[formats[0]]?.url;
        result.success = true;

        // Analytics tracking data
        if (input.enableAnalytics) {
            result.analytics = {
                trackingId: id,
                createdAt: result.timestamp,
                scanCount: 0,
                lastScanned: null,
                url: content !== qrConfig.content ? content : undefined
            };
        }

        // Send webhook notification for individual QR code
        if (webhookManager) {
            await webhookManager.send('qrcode.created', {
                id: result.id,
                type: result.type,
                fileUrl: result.fileUrl
            });
        }

        console.log(`✓ Successfully generated QR code ${id}`);

    } catch (error) {
        console.error(`✗ Failed to generate QR code ${id}: ${error.message}`);
        result.success = false;
        result.error = error.message;

        // Send failure webhook
        if (webhookManager) {
            await webhookManager.send('qrcode.failed', {
                id,
                type: qrConfig.type,
                error: error.message
            });
        }
    }

    return result;
}

/**
 * Main Actor function
 */
Actor.main(async () => {
    console.log('🚀 QR Code API Actor v2.0 - Advanced Edition');
    console.log('=====================================\n');

    const input = await Actor.getInput();
    const runId = process.env.APIFY_ACTOR_RUN_ID;

    // Initialize webhook manager
    const webhookManager = input.webhookUrl ? new WebhookManager(input.webhookUrl) : null;

    // Validate input
    if (!input || (!input.qrCodes && !input.batchImport)) {
        throw new Error('Invalid input: either qrCodes array or batchImport configuration is required');
    }

    // Load QR codes from various sources
    let qrCodes = input.qrCodes || [];

    // Load from batch import if configured
    if (input.batchImport) {
        console.log('📥 Loading batch import data...');
        const batchQrCodes = await loadBatchData(input);
        qrCodes = [...qrCodes, ...batchQrCodes];
        console.log(`Loaded ${batchQrCodes.length} QR codes from batch import\n`);
    }

    if (qrCodes.length === 0) {
        throw new Error('No QR codes to generate');
    }

    // Display configuration
    console.log(`⚙️  Configuration:`);
    console.log(`   QR codes to generate: ${qrCodes.length}`);
    console.log(`   Output format: ${input.outputFormat || 'png'}`);
    console.log(`   Max concurrency: ${input.maxConcurrency || 10}`);
    console.log(`   Analytics enabled: ${input.enableAnalytics !== false}`);
    console.log(`   Save to KV Store: ${input.saveToKeyValueStore !== false}`);
    console.log(`   URL shortening: ${input.urlShortening?.enabled ? 'enabled' : 'disabled'}`);
    console.log(`   Template: ${input.template || 'none'}`);
    console.log(`   Validation: ${input.validateQRCodes ? 'enabled' : 'disabled'}`);
    console.log(`   ZIP export: ${input.exportZip ? 'enabled' : 'disabled'}`);
    console.log(`   Webhooks: ${webhookManager ? 'enabled' : 'disabled'}\n`);

    // Display available templates
    if (input.listTemplates) {
        console.log('📋 Available Templates:');
        const templates = listTemplates();
        templates.forEach(t => {
            console.log(`   - ${t.id}: ${t.name} - ${t.description}`);
        });
        console.log('');
    }

    // Send start webhook
    if (webhookManager) {
        await notifyGenerationStarted(input.webhookUrl, qrCodes.length, runId);
    }

    const globalCustomization = input.customization || {};
    const results = [];

    // Process QR codes with concurrency control
    const maxConcurrency = input.maxConcurrency || 10;
    const chunks = chunkArray(qrCodes, maxConcurrency);

    let processedCount = 0;
    const startTime = Date.now();

    for (const [chunkIndex, chunk] of chunks.entries()) {
        const promises = chunk.map((qrConfig, idx) =>
            processQRCode(qrConfig, globalCustomization, input, processedCount + idx, webhookManager)
        );

        const chunkResults = await Promise.all(promises);
        results.push(...chunkResults);
        processedCount += chunk.length;

        const progress = Math.round((processedCount / qrCodes.length) * 100);
        console.log(`📊 Progress: ${processedCount}/${qrCodes.length} (${progress}%)`);

        // Send progress webhook
        if (webhookManager && (chunkIndex % 5 === 0 || processedCount === qrCodes.length)) {
            await webhookManager.notifyProgress(processedCount, qrCodes.length, runId);
        }
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Save results to dataset
    await Actor.pushData(results);

    // Validate QR codes if enabled
    let validationResults = null;
    if (input.validateQRCodes) {
        console.log('\n🔍 Validating QR codes...');
        validationResults = await batchValidate(results, true);

        const validCount = validationResults.filter(v => v.valid && v.readable).length;
        console.log(`Validation complete: ${validCount}/${validationResults.length} QR codes are readable`);

        await Actor.setValue('VALIDATION_RESULTS', validationResults);

        // Send validation webhook
        if (webhookManager) {
            await webhookManager.send('validation.completed', {
                total: validationResults.length,
                valid: validCount,
                invalid: validationResults.length - validCount
            });
        }
    }

    // Create ZIP export if enabled
    let zipInfo = null;
    if (input.exportZip) {
        console.log('\n📦 Creating ZIP archive...');
        const resultsWithBuffers = await addFilesToArchive(results);
        const zipBuffer = await createZipArchive(resultsWithBuffers, {
            includeMetadata: true,
            organizeByType: input.exportZip.organizeByType || false
        });

        zipInfo = await saveZipToKVStore(zipBuffer, `qr-codes-${Date.now()}.zip`);
        console.log(`ZIP archive created: ${zipInfo.url} (${formatBytes(zipInfo.size)})`);

        // Send export webhook
        if (webhookManager) {
            await webhookManager.send('export.ready', zipInfo);
        }
    }

    // Export to CSV if enabled
    if (input.exportCSV) {
        console.log('\n📄 Exporting results to CSV...');
        const csv = exportToCSV(results);
        await Actor.setValue('results.csv', csv, { contentType: 'text/csv' });
        console.log('CSV export saved to Key-Value Store');
    }

    // Generate summary
    const summary = generateSummary(results);

    // Display final summary
    console.log('\n========================================');
    console.log('✅ QR Code Generation Complete');
    console.log('========================================');
    console.log(`Total QR codes: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success rate: ${summary.successRate}`);
    console.log(`Output format: ${input.outputFormat || 'png'}`);
    console.log(`Total size: ${summary.totalSize}`);
    console.log(`Average size: ${summary.averageSize}`);
    console.log(`Processing time: ${processingTime}s`);
    console.log(`Average per QR: ${(parseFloat(processingTime) / qrCodes.length).toFixed(2)}s`);

    if (Object.keys(summary.byType).length > 0) {
        console.log('\nBy Type:');
        Object.entries(summary.byType).forEach(([type, count]) => {
            console.log(`  - ${type}: ${count}`);
        });
    }

    if (zipInfo) {
        console.log(`\n📦 ZIP Archive: ${zipInfo.url}`);
    }

    console.log('========================================\n');

    // Save comprehensive output summary
    const outputData = {
        summary: {
            ...summary,
            processingTime: `${processingTime}s`,
            averagePerQr: `${(parseFloat(processingTime) / qrCodes.length).toFixed(2)}s`,
            format: input.outputFormat || 'png',
            timestamp: new Date().toISOString(),
            runId
        },
        results: results.map(r => ({
            id: r.id,
            type: r.type,
            success: r.success,
            fileUrl: r.fileUrl,
            error: r.error,
            size: r.files ? Object.values(r.files)[0]?.size : undefined
        })),
        validation: validationResults ? {
            total: validationResults.length,
            valid: validationResults.filter(v => v.valid && v.readable).length,
            results: validationResults
        } : undefined,
        export: zipInfo ? {
            zipUrl: zipInfo.url,
            zipSize: formatBytes(zipInfo.size)
        } : undefined
    };

    await Actor.setValue('OUTPUT', outputData);

    // Send completion webhook
    if (webhookManager) {
        await webhookManager.notifyComplete(outputData.summary, runId);
    }

    console.log('✨ Actor finished successfully!');
});
