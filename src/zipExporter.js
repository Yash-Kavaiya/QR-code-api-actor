/**
 * ZIP Export Module
 * Creates ZIP archives of generated QR codes with organized structure
 */

const archiver = require('archiver');
const Apify = require('apify');
const { Readable } = require('stream');

/**
 * Create ZIP archive from QR code results
 */
async function createZipArchive(results, options = {}) {
    const {
        includeMetadata = true,
        organizeByType = false,
        filenamePrefix = 'qr-codes'
    } = options;

    return new Promise((resolve, reject) => {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        const chunks = [];

        archive.on('data', chunk => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        // Add QR code files to archive
        results.forEach(result => {
            if (result.success && result.files) {
                const basePath = organizeByType ? `${result.type}/` : '';

                Object.entries(result.files).forEach(([format, fileInfo]) => {
                    if (fileInfo.buffer) {
                        const filename = `${basePath}${fileInfo.filename}`;
                        archive.append(fileInfo.buffer, { name: filename });
                    }
                });
            }
        });

        // Add metadata JSON if requested
        if (includeMetadata) {
            const metadata = {
                generated: new Date().toISOString(),
                totalQrCodes: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results: results.map(r => ({
                    id: r.id,
                    type: r.type,
                    content: r.content,
                    success: r.success,
                    error: r.error,
                    files: r.files ? Object.keys(r.files) : []
                }))
            };

            archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
        }

        // Add README
        const readme = generateReadme(results);
        archive.append(readme, { name: 'README.txt' });

        archive.finalize();
    });
}

/**
 * Generate README content for ZIP archive
 */
function generateReadme(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return `QR Code Archive
================

Generated: ${new Date().toISOString()}
Total QR Codes: ${results.length}
Successful: ${successful}
Failed: ${failed}

Contents:
---------
This archive contains generated QR codes organized by the following structure:

${results.filter(r => r.success).map(r => {
    const files = r.files ? Object.keys(r.files).join(', ') : 'none';
    return `- ${r.id} (${r.type}): ${files}`;
}).join('\n')}

metadata.json - Complete generation metadata and results

Usage:
------
Extract this archive and use the QR code images in your applications.
Scan the QR codes with any QR code reader to test functionality.

Generated with Apify QR Code API Actor
https://apify.com
`;
}

/**
 * Save ZIP to Key-Value Store
 */
async function saveZipToKVStore(zipBuffer, filename = 'qr-codes-archive.zip') {
    await Apify.setValue(filename, zipBuffer, { contentType: 'application/zip' });

    // Get public URL
    const store = await Apify.openKeyValueStore();
    const storeId = store.id || process.env.APIFY_DEFAULT_KEY_VALUE_STORE_ID;
    const publicUrl = `https://api.apify.com/v2/key-value-stores/${storeId}/records/${filename}`;

    return {
        filename,
        url: publicUrl,
        size: zipBuffer.length
    };
}

/**
 * Create separate ZIP archives by type
 */
async function createZipsByType(results, options = {}) {
    const zipsByType = {};

    // Group results by type
    const grouped = results.reduce((acc, result) => {
        if (result.success) {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
        }
        return acc;
    }, {});

    // Create ZIP for each type
    for (const [type, typeResults] of Object.entries(grouped)) {
        const zipBuffer = await createZipArchive(typeResults, {
            ...options,
            organizeByType: false
        });

        const filename = `qr-codes-${type}-${Date.now()}.zip`;
        const zipInfo = await saveZipToKVStore(zipBuffer, filename);
        zipsByType[type] = zipInfo;
    }

    return zipsByType;
}

/**
 * Add files to existing archive from Key-Value Store
 */
async function addFilesToArchive(results) {
    // Fetch file buffers from KV Store for each result
    for (const result of results) {
        if (result.files) {
            for (const [format, fileInfo] of Object.entries(result.files)) {
                try {
                    const buffer = await Apify.getValue(fileInfo.filename);
                    if (buffer) {
                        fileInfo.buffer = buffer;
                    }
                } catch (error) {
                    console.log(`Warning: Could not fetch file ${fileInfo.filename}: ${error.message}`);
                }
            }
        }
    }

    return results;
}

module.exports = {
    createZipArchive,
    saveZipToKVStore,
    createZipsByType,
    addFilesToArchive
};
