/**
 * Batch Processing Module
 * Handles CSV and JSON file imports for bulk QR code generation
 */

const { parse } = require('csv-parse/sync');
const Apify = require('apify');
const axios = require('axios');

/**
 * Import QR codes from CSV content
 * Expected CSV format: type,content,id,customization
 */
function parseCSV(csvContent, options = {}) {
    try {
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            ...options
        });

        return records.map(record => {
            const qrConfig = {
                type: record.type || 'url',
                content: record.content,
                id: record.id || undefined
            };

            // Parse customization if provided as JSON string
            if (record.customization) {
                try {
                    qrConfig.customization = JSON.parse(record.customization);
                } catch (e) {
                    console.log(`Warning: Failed to parse customization for ${record.id}: ${e.message}`);
                }
            }

            return qrConfig;
        });
    } catch (error) {
        throw new Error(`Failed to parse CSV: ${error.message}`);
    }
}

/**
 * Import QR codes from JSON array
 */
function parseJSON(jsonContent) {
    try {
        const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

        if (!Array.isArray(data)) {
            throw new Error('JSON must be an array of QR code configurations');
        }

        return data.map((item, index) => {
            if (!item.content) {
                throw new Error(`Missing content field in item ${index}`);
            }

            return {
                type: item.type || 'url',
                content: item.content,
                id: item.id || `import-${index + 1}`,
                customization: item.customization || undefined
            };
        });
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
    }
}

/**
 * Load batch data from various sources
 */
async function loadBatchData(input) {
    const qrCodes = [];

    // Load from CSV file URL
    if (input.batchImport?.csvUrl) {
        console.log(`Loading CSV from: ${input.batchImport.csvUrl}`);
        const response = await axios.get(input.batchImport.csvUrl, { timeout: 30000 });
        const csvQrCodes = parseCSV(response.data);
        qrCodes.push(...csvQrCodes);
        console.log(`Loaded ${csvQrCodes.length} QR codes from CSV`);
    }

    // Load from CSV content
    if (input.batchImport?.csvContent) {
        console.log('Parsing CSV content');
        const csvQrCodes = parseCSV(input.batchImport.csvContent);
        qrCodes.push(...csvQrCodes);
        console.log(`Parsed ${csvQrCodes.length} QR codes from CSV content`);
    }

    // Load from JSON file URL
    if (input.batchImport?.jsonUrl) {
        console.log(`Loading JSON from: ${input.batchImport.jsonUrl}`);
        const response = await axios.get(input.batchImport.jsonUrl, { timeout: 30000 });
        const jsonQrCodes = parseJSON(response.data);
        qrCodes.push(...jsonQrCodes);
        console.log(`Loaded ${jsonQrCodes.length} QR codes from JSON`);
    }

    // Load from JSON content
    if (input.batchImport?.jsonContent) {
        console.log('Parsing JSON content');
        const jsonQrCodes = parseJSON(input.batchImport.jsonContent);
        qrCodes.push(...jsonQrCodes);
        console.log(`Parsed ${jsonQrCodes.length} QR codes from JSON content`);
    }

    // Load from Apify dataset
    if (input.batchImport?.datasetId) {
        console.log(`Loading from Apify dataset: ${input.batchImport.datasetId}`);
        const dataset = await Apify.openDataset(input.batchImport.datasetId);
        const { items } = await dataset.getData();
        const datasetQrCodes = parseJSON(items);
        qrCodes.push(...datasetQrCodes);
        console.log(`Loaded ${datasetQrCodes.length} QR codes from dataset`);
    }

    // Load from Apify key-value store
    if (input.batchImport?.kvStoreKey) {
        console.log(`Loading from KV Store: ${input.batchImport.kvStoreKey}`);
        const content = await Apify.getValue(input.batchImport.kvStoreKey);
        if (content) {
            const kvQrCodes = parseJSON(content);
            qrCodes.push(...kvQrCodes);
            console.log(`Loaded ${kvQrCodes.length} QR codes from KV Store`);
        }
    }

    return qrCodes;
}

/**
 * Generate example CSV template
 */
function generateCSVTemplate() {
    return `type,content,id,customization
url,https://example.com,example-1,
url,https://example.com/page,example-2,"{""size"":400}"
email,contact@example.com,email-1,
vcard,"{""name"":""John Doe"",""phone"":""+1234567890""}",contact-john,
wifi,"{""ssid"":""MyNetwork"",""password"":""secret123""}",wifi-office,`;
}

/**
 * Generate example JSON template
 */
function generateJSONTemplate() {
    return [
        {
            type: 'url',
            content: 'https://example.com',
            id: 'example-1'
        },
        {
            type: 'url',
            content: 'https://example.com/page',
            id: 'example-2',
            customization: {
                size: 400,
                foregroundColor: '#FF0000'
            }
        },
        {
            type: 'email',
            content: 'contact@example.com',
            id: 'email-1'
        },
        {
            type: 'vcard',
            content: JSON.stringify({
                name: 'John Doe',
                phone: '+1234567890',
                email: 'john@example.com'
            }),
            id: 'contact-john'
        }
    ];
}

/**
 * Validate batch import data
 */
function validateBatchData(qrCodes) {
    const errors = [];

    qrCodes.forEach((qr, index) => {
        if (!qr.type) {
            errors.push(`Row ${index + 1}: Missing type`);
        }
        if (!qr.content) {
            errors.push(`Row ${index + 1}: Missing content`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        count: qrCodes.length
    };
}

/**
 * Export results to CSV format
 */
function exportToCSV(results) {
    const headers = ['id', 'type', 'content', 'success', 'fileUrl', 'error'];
    const rows = results.map(r => [
        r.id || '',
        r.type || '',
        r.content || '',
        r.success ? 'true' : 'false',
        r.fileUrl || '',
        r.error || ''
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csv;
}

module.exports = {
    parseCSV,
    parseJSON,
    loadBatchData,
    generateCSVTemplate,
    generateJSONTemplate,
    validateBatchData,
    exportToCSV
};
