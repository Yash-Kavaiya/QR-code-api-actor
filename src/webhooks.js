/**
 * Webhook Notification System
 * Sends real-time notifications about QR code generation progress and completion
 */

const axios = require('axios');

/**
 * Webhook event types
 */
const EVENT_TYPES = {
    GENERATION_STARTED: 'generation.started',
    GENERATION_PROGRESS: 'generation.progress',
    GENERATION_COMPLETED: 'generation.completed',
    GENERATION_FAILED: 'generation.failed',
    QR_CODE_CREATED: 'qrcode.created',
    QR_CODE_FAILED: 'qrcode.failed',
    BATCH_COMPLETED: 'batch.completed',
    VALIDATION_COMPLETED: 'validation.completed',
    EXPORT_READY: 'export.ready'
};

/**
 * Send webhook notification
 */
async function sendWebhook(webhookUrl, event, data, retries = 3) {
    if (!webhookUrl) {
        return { sent: false, reason: 'No webhook URL provided' };
    }

    const payload = {
        event,
        timestamp: new Date().toISOString(),
        data
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(webhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Apify-QR-Code-Actor/2.0'
                },
                timeout: 10000
            });

            console.log(`Webhook sent successfully: ${event} (attempt ${attempt})`);
            return {
                sent: true,
                statusCode: response.status,
                attempt
            };
        } catch (error) {
            console.log(`Webhook failed (attempt ${attempt}/${retries}): ${error.message}`);

            if (attempt === retries) {
                return {
                    sent: false,
                    error: error.message,
                    attempts: retries
                };
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
    }
}

/**
 * Send generation started event
 */
async function notifyGenerationStarted(webhookUrl, totalCount, runId) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.GENERATION_STARTED, {
        totalQrCodes: totalCount,
        runId,
        startTime: new Date().toISOString()
    });
}

/**
 * Send progress update
 */
async function notifyProgress(webhookUrl, processed, total, runId) {
    const progress = Math.round((processed / total) * 100);

    return await sendWebhook(webhookUrl, EVENT_TYPES.GENERATION_PROGRESS, {
        processed,
        total,
        progress,
        runId
    });
}

/**
 * Send generation completed event
 */
async function notifyGenerationCompleted(webhookUrl, summary, runId) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.GENERATION_COMPLETED, {
        ...summary,
        runId,
        completedTime: new Date().toISOString()
    });
}

/**
 * Send individual QR code created event
 */
async function notifyQRCodeCreated(webhookUrl, qrResult) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.QR_CODE_CREATED, {
        id: qrResult.id,
        type: qrResult.type,
        fileUrl: qrResult.fileUrl,
        success: true
    });
}

/**
 * Send QR code failed event
 */
async function notifyQRCodeFailed(webhookUrl, qrConfig, error) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.QR_CODE_FAILED, {
        id: qrConfig.id,
        type: qrConfig.type,
        error: error.message,
        success: false
    });
}

/**
 * Send batch completed event
 */
async function notifyBatchCompleted(webhookUrl, batchSummary) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.BATCH_COMPLETED, batchSummary);
}

/**
 * Send validation completed event
 */
async function notifyValidationCompleted(webhookUrl, validationResults) {
    const summary = {
        total: validationResults.length,
        valid: validationResults.filter(r => r.valid).length,
        invalid: validationResults.filter(r => !r.valid).length,
        results: validationResults
    };

    return await sendWebhook(webhookUrl, EVENT_TYPES.VALIDATION_COMPLETED, summary);
}

/**
 * Send export ready event
 */
async function notifyExportReady(webhookUrl, exportInfo) {
    return await sendWebhook(webhookUrl, EVENT_TYPES.EXPORT_READY, exportInfo);
}

/**
 * Batch send multiple webhook notifications
 */
async function batchSendWebhooks(webhookUrl, events, delayMs = 100) {
    const results = [];

    for (const event of events) {
        const result = await sendWebhook(webhookUrl, event.type, event.data);
        results.push(result);

        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}

/**
 * Test webhook endpoint
 */
async function testWebhook(webhookUrl) {
    const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
            message: 'This is a test webhook from QR Code API Actor',
            status: 'active'
        }
    };

    try {
        const response = await axios.post(webhookUrl, testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Apify-QR-Code-Actor/2.0'
            },
            timeout: 10000
        });

        return {
            success: true,
            statusCode: response.status,
            message: 'Webhook endpoint is working correctly'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Webhook endpoint test failed'
        };
    }
}

/**
 * Create webhook manager for handling multiple webhooks
 */
class WebhookManager {
    constructor(webhookUrls = []) {
        this.webhookUrls = Array.isArray(webhookUrls) ? webhookUrls : [webhookUrls].filter(Boolean);
    }

    async send(event, data) {
        if (this.webhookUrls.length === 0) {
            return [];
        }

        const promises = this.webhookUrls.map(url => sendWebhook(url, event, data));
        return await Promise.all(promises);
    }

    async notifyProgress(processed, total, runId) {
        return await this.send(EVENT_TYPES.GENERATION_PROGRESS, {
            processed,
            total,
            progress: Math.round((processed / total) * 100),
            runId
        });
    }

    async notifyComplete(summary, runId) {
        return await this.send(EVENT_TYPES.GENERATION_COMPLETED, {
            ...summary,
            runId,
            completedTime: new Date().toISOString()
        });
    }

    addWebhook(url) {
        if (url && !this.webhookUrls.includes(url)) {
            this.webhookUrls.push(url);
        }
    }

    removeWebhook(url) {
        this.webhookUrls = this.webhookUrls.filter(u => u !== url);
    }
}

module.exports = {
    sendWebhook,
    notifyGenerationStarted,
    notifyProgress,
    notifyGenerationCompleted,
    notifyQRCodeCreated,
    notifyQRCodeFailed,
    notifyBatchCompleted,
    notifyValidationCompleted,
    notifyExportReady,
    batchSendWebhooks,
    testWebhook,
    WebhookManager,
    EVENT_TYPES
};
