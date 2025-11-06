/**
 * Advanced QR Code Styling Engine
 * Provides advanced visual styles and customizations for QR codes
 */

const QRCode = require('qrcode');
const sharp = require('sharp');
const Jimp = require('jimp');

/**
 * Style types available
 */
const STYLE_TYPES = {
    SQUARE: 'square',
    DOTS: 'dots',
    ROUNDED: 'rounded',
    EXTRA_ROUNDED: 'extra-rounded',
    CLASSY: 'classy',
    CLASSY_ROUNDED: 'classy-rounded'
};

/**
 * Frame styles
 */
const FRAME_STYLES = {
    NONE: 'none',
    BASIC: 'basic',
    CIRCULAR: 'circular',
    EDGE: 'edge',
    CAMERA: 'camera',
    BANNER: 'banner'
};

/**
 * Generate QR code with advanced styling
 */
async function generateStyledQR(content, options) {
    const {
        size = 300,
        margin = 4,
        errorCorrectionLevel = 'M',
        foregroundColor = '#000000',
        backgroundColor = '#FFFFFF',
        style = STYLE_TYPES.SQUARE,
        dotsStyle = 'square',
        cornersSquareStyle = 'square',
        cornersDotStyle = 'square',
        gradientType = 'none',
        gradientColors = null,
        frame = FRAME_STYLES.NONE,
        frameColor = '#000000',
        frameText = '',
        frameTextColor = '#000000',
        frameTextSize = 14
    } = options;

    // Generate base QR code
    const qrOptions = {
        errorCorrectionLevel,
        type: 'png',
        width: size,
        margin,
        color: {
            dark: foregroundColor,
            light: backgroundColor
        }
    };

    let qrBuffer = await QRCode.toBuffer(content, qrOptions);

    // Apply gradient if specified
    if (gradientType !== 'none' && gradientColors && gradientColors.length >= 2) {
        qrBuffer = await applyGradient(qrBuffer, size, gradientType, gradientColors);
    }

    // Apply advanced styling
    if (style !== STYLE_TYPES.SQUARE) {
        qrBuffer = await applyAdvancedStyle(qrBuffer, style, size);
    }

    // Apply frame if specified
    if (frame !== FRAME_STYLES.NONE) {
        qrBuffer = await applyFrame(qrBuffer, frame, {
            frameColor,
            frameText,
            frameTextColor,
            frameTextSize,
            size
        });
    }

    return qrBuffer;
}

/**
 * Apply gradient to QR code
 */
async function applyGradient(qrBuffer, size, gradientType, colors) {
    try {
        const image = await Jimp.read(qrBuffer);

        // Create gradient overlay
        const gradient = new Jimp(size, size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const pixel = image.getPixelColor(x, y);
                const rgba = Jimp.intToRGBA(pixel);

                // Only apply gradient to dark pixels
                if (rgba.r < 128) {
                    let color;

                    switch (gradientType) {
                        case 'linear-vertical':
                            color = interpolateColors(colors, y / size);
                            break;
                        case 'linear-horizontal':
                            color = interpolateColors(colors, x / size);
                            break;
                        case 'radial':
                            const centerX = size / 2;
                            const centerY = size / 2;
                            const distance = Math.sqrt(
                                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                            );
                            const maxDistance = Math.sqrt(
                                Math.pow(centerX, 2) + Math.pow(centerY, 2)
                            );
                            color = interpolateColors(colors, distance / maxDistance);
                            break;
                        default:
                            color = colors[0];
                    }

                    image.setPixelColor(color, x, y);
                }
            }
        }

        return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
        console.log(`Warning: Failed to apply gradient: ${error.message}`);
        return qrBuffer;
    }
}

/**
 * Interpolate between multiple colors
 */
function interpolateColors(colors, position) {
    const hexColors = colors.map(c => parseInt(c.replace('#', ''), 16));

    if (position <= 0) return hexColors[0];
    if (position >= 1) return hexColors[hexColors.length - 1];

    const scaledPosition = position * (hexColors.length - 1);
    const index = Math.floor(scaledPosition);
    const fraction = scaledPosition - index;

    const color1 = hexColors[index];
    const color2 = hexColors[Math.min(index + 1, hexColors.length - 1)];

    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * fraction);
    const g = Math.round(g1 + (g2 - g1) * fraction);
    const b = Math.round(b1 + (b2 - b1) * fraction);

    return Jimp.rgbaToInt(r, g, b, 255);
}

/**
 * Apply advanced styling (dots, rounded corners, etc.)
 */
async function applyAdvancedStyle(qrBuffer, style, size) {
    try {
        const image = await Jimp.read(qrBuffer);
        const moduleSize = Math.floor(size / 33); // Approximate module size

        const styledImage = new Jimp(size, size, 0xFFFFFFFF);

        // Detect QR code modules
        for (let y = 0; y < size; y += moduleSize) {
            for (let x = 0; x < size; x += moduleSize) {
                const pixel = image.getPixelColor(x + Math.floor(moduleSize / 2), y + Math.floor(moduleSize / 2));
                const rgba = Jimp.intToRGBA(pixel);

                // If dark pixel, draw styled module
                if (rgba.r < 128) {
                    await drawStyledModule(styledImage, x, y, moduleSize, style, image.getPixelColor(x, y));
                }
            }
        }

        return await styledImage.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
        console.log(`Warning: Failed to apply advanced style: ${error.message}`);
        return qrBuffer;
    }
}

/**
 * Draw a styled module (dot, rounded square, etc.)
 */
async function drawStyledModule(image, x, y, size, style, color) {
    switch (style) {
        case STYLE_TYPES.DOTS:
            // Draw circle
            const radius = size / 2;
            const centerX = x + radius;
            const centerY = y + radius;
            image.scan(x, y, size, size, function(px, py) {
                const distance = Math.sqrt(
                    Math.pow(px - centerX, 2) + Math.pow(py - centerY, 2)
                );
                if (distance <= radius) {
                    this.setPixelColor(color, px, py);
                }
            });
            break;

        case STYLE_TYPES.ROUNDED:
        case STYLE_TYPES.CLASSY_ROUNDED:
            // Draw rounded square
            const cornerRadius = size * 0.3;
            image.scan(x, y, size, size, function(px, py) {
                const localX = px - x;
                const localY = py - y;

                // Check if in corner
                const inTopLeft = localX < cornerRadius && localY < cornerRadius;
                const inTopRight = localX > size - cornerRadius && localY < cornerRadius;
                const inBottomLeft = localX < cornerRadius && localY > size - cornerRadius;
                const inBottomRight = localX > size - cornerRadius && localY > size - cornerRadius;

                let shouldDraw = true;

                if (inTopLeft) {
                    const dist = Math.sqrt(
                        Math.pow(localX - cornerRadius, 2) + Math.pow(localY - cornerRadius, 2)
                    );
                    shouldDraw = dist <= cornerRadius;
                } else if (inTopRight) {
                    const dist = Math.sqrt(
                        Math.pow(localX - (size - cornerRadius), 2) + Math.pow(localY - cornerRadius, 2)
                    );
                    shouldDraw = dist <= cornerRadius;
                } else if (inBottomLeft) {
                    const dist = Math.sqrt(
                        Math.pow(localX - cornerRadius, 2) + Math.pow(localY - (size - cornerRadius), 2)
                    );
                    shouldDraw = dist <= cornerRadius;
                } else if (inBottomRight) {
                    const dist = Math.sqrt(
                        Math.pow(localX - (size - cornerRadius), 2) + Math.pow(localY - (size - cornerRadius), 2)
                    );
                    shouldDraw = dist <= cornerRadius;
                }

                if (shouldDraw) {
                    this.setPixelColor(color, px, py);
                }
            });
            break;

        default:
            // Square (default)
            image.scan(x, y, size, size, function(px, py) {
                this.setPixelColor(color, px, py);
            });
    }
}

/**
 * Apply decorative frame around QR code
 */
async function applyFrame(qrBuffer, frameStyle, options) {
    try {
        const { size, frameColor, frameText, frameTextColor, frameTextSize } = options;

        const image = await Jimp.read(qrBuffer);
        const frameWidth = Math.floor(size * 0.1);
        const newSize = size + (frameWidth * 2);
        const textSpace = frameText ? 60 : 0;

        // Create new image with frame
        const framedImage = new Jimp(newSize, newSize + textSpace, frameColor);

        // Add QR code in center
        framedImage.composite(image, frameWidth, frameWidth);

        // Add frame border based on style
        switch (frameStyle) {
            case FRAME_STYLES.BASIC:
                // Simple border (already created)
                break;

            case FRAME_STYLES.CIRCULAR:
                // Circular mask
                framedImage.circle({ radius: newSize / 2, x: newSize / 2, y: newSize / 2 });
                break;

            case FRAME_STYLES.BANNER:
                // Add decorative corners
                // This is simplified - could add more elaborate designs
                break;
        }

        // Add text if provided
        if (frameText) {
            const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            framedImage.print(
                font,
                0,
                newSize + 10,
                {
                    text: frameText,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_TOP
                },
                newSize,
                50
            );
        }

        return await framedImage.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
        console.log(`Warning: Failed to apply frame: ${error.message}`);
        return qrBuffer;
    }
}

module.exports = {
    generateStyledQR,
    STYLE_TYPES,
    FRAME_STYLES
};
