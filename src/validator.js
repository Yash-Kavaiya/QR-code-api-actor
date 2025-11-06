/**
 * QR Code Validation Module
 * Tests readability and validates QR code quality
 */

const jsQR = require('jsqr');
const Jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');

/**
 * Validate QR code readability
 */
async function validateQRCode(imageBuffer, expectedContent = null) {
    try {
        const image = await Jimp.read(imageBuffer);
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height
        };

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
        });

        if (!code) {
            return {
                valid: false,
                readable: false,
                message: 'QR code could not be read',
                quality: 'poor'
            };
        }

        const result = {
            valid: true,
            readable: true,
            decodedContent: code.data,
            location: code.location,
            quality: assessQuality(code)
        };

        // If expected content provided, verify it matches
        if (expectedContent) {
            result.contentMatches = code.data === expectedContent;
            if (!result.contentMatches) {
                result.message = 'Decoded content does not match expected content';
                result.expectedContent = expectedContent;
            }
        }

        return result;
    } catch (error) {
        return {
            valid: false,
            readable: false,
            message: `Validation error: ${error.message}`,
            quality: 'unknown'
        };
    }
}

/**
 * Assess QR code quality based on detection data
 */
function assessQuality(qrData) {
    // Check if all corner positions are detected
    if (!qrData.location) {
        return 'poor';
    }

    // Calculate area coverage (simple heuristic)
    const points = [
        qrData.location.topLeftCorner,
        qrData.location.topRightCorner,
        qrData.location.bottomLeftCorner,
        qrData.location.bottomRightCorner
    ];

    // If any corner is missing, quality is poor
    if (points.some(p => !p || !p.x || !p.y)) {
        return 'poor';
    }

    // Calculate approximate skew/distortion
    const width1 = Math.abs(points[1].x - points[0].x);
    const width2 = Math.abs(points[3].x - points[2].x);
    const height1 = Math.abs(points[2].y - points[0].y);
    const height2 = Math.abs(points[3].y - points[1].y);

    const widthDiff = Math.abs(width1 - width2) / Math.max(width1, width2);
    const heightDiff = Math.abs(height1 - height2) / Math.max(height1, height2);

    const avgDistortion = (widthDiff + heightDiff) / 2;

    if (avgDistortion < 0.05) {
        return 'excellent';
    } else if (avgDistortion < 0.15) {
        return 'good';
    } else if (avgDistortion < 0.30) {
        return 'fair';
    } else {
        return 'poor';
    }
}

/**
 * Batch validate multiple QR codes
 */
async function batchValidate(results, validateContent = true) {
    const validationResults = [];

    for (const result of results) {
        if (!result.success || !result.files) {
            validationResults.push({
                id: result.id,
                validated: false,
                message: 'QR code generation failed'
            });
            continue;
        }

        // Get PNG file for validation
        const pngFile = result.files.png || result.files[Object.keys(result.files)[0]];
        if (!pngFile || !pngFile.buffer) {
            validationResults.push({
                id: result.id,
                validated: false,
                message: 'No image buffer available for validation'
            });
            continue;
        }

        const expectedContent = validateContent ? result.formattedContent : null;
        const validation = await validateQRCode(pngFile.buffer, expectedContent);

        validationResults.push({
            id: result.id,
            type: result.type,
            ...validation
        });
    }

    return validationResults;
}

/**
 * Test QR code at different sizes and qualities
 */
async function testQRCodeResilience(imageBuffer) {
    const tests = [];

    // Test original
    tests.push({
        test: 'original',
        result: await validateQRCode(imageBuffer)
    });

    try {
        const image = await Jimp.read(imageBuffer);

        // Test scaled down
        const scaled = await image.clone().scale(0.5);
        tests.push({
            test: 'scaled-50%',
            result: await validateQRCode(await scaled.getBufferAsync(Jimp.MIME_PNG))
        });

        // Test with blur
        const blurred = await image.clone().blur(2);
        tests.push({
            test: 'blur-2px',
            result: await validateQRCode(await blurred.getBufferAsync(Jimp.MIME_PNG))
        });

        // Test with brightness adjustment
        const brightened = await image.clone().brightness(0.2);
        tests.push({
            test: 'brightness+20%',
            result: await validateQRCode(await brightened.getBufferAsync(Jimp.MIME_PNG))
        });

        // Test with contrast adjustment
        const contrasted = await image.clone().contrast(0.2);
        tests.push({
            test: 'contrast+20%',
            result: await validateQRCode(await contrasted.getBufferAsync(Jimp.MIME_PNG))
        });

    } catch (error) {
        console.log(`Error during resilience testing: ${error.message}`);
    }

    // Calculate overall resilience score
    const passedTests = tests.filter(t => t.result.valid && t.result.readable).length;
    const resilienceScore = (passedTests / tests.length) * 100;

    return {
        tests,
        passedTests,
        totalTests: tests.length,
        resilienceScore,
        rating: resilienceScore >= 80 ? 'excellent' : resilienceScore >= 60 ? 'good' : resilienceScore >= 40 ? 'fair' : 'poor'
    };
}

/**
 * Validate content format for specific QR types
 */
function validateContentFormat(type, content) {
    const errors = [];

    switch (type.toLowerCase()) {
        case 'url':
            try {
                new URL(content);
            } catch (e) {
                errors.push('Invalid URL format');
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(content)) {
                errors.push('Invalid email format');
            }
            break;

        case 'phone':
            const phoneRegex = /^\+?[\d\s\-()]+$/;
            if (!phoneRegex.test(content)) {
                errors.push('Invalid phone number format');
            }
            break;

        case 'wifi':
            try {
                const wifi = JSON.parse(content);
                if (!wifi.ssid) errors.push('WiFi configuration missing SSID');
                if (!wifi.password) errors.push('WiFi configuration missing password');
            } catch (e) {
                errors.push('WiFi configuration must be valid JSON');
            }
            break;

        case 'vcard':
            try {
                const vcard = JSON.parse(content);
                if (!vcard.name) errors.push('vCard missing name field');
            } catch (e) {
                errors.push('vCard data must be valid JSON');
            }
            break;
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateQRCode,
    batchValidate,
    testQRCodeResilience,
    validateContentFormat,
    assessQuality
};
