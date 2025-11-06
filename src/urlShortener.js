/**
 * URL Shortening Service Integration
 * Supports multiple URL shortening services
 */

const axios = require('axios');

/**
 * Supported URL shortening services
 */
const SERVICES = {
    BITLY: 'bitly',
    TINYURL: 'tinyurl',
    ISGD: 'isgd',
    VGD: 'vgd',
    CUTTLY: 'cuttly'
};

/**
 * Shorten URL using specified service
 */
async function shortenUrl(url, service = SERVICES.ISGD, apiKey = null) {
    try {
        console.log(`Shortening URL: ${url} using ${service}`);

        switch (service) {
            case SERVICES.BITLY:
                return await shortenWithBitly(url, apiKey);

            case SERVICES.TINYURL:
                return await shortenWithTinyUrl(url, apiKey);

            case SERVICES.ISGD:
                return await shortenWithIsGd(url);

            case SERVICES.VGD:
                return await shortenWithVgd(url);

            case SERVICES.CUTTLY:
                return await shortenWithCuttly(url, apiKey);

            default:
                console.log(`Unknown service: ${service}, using original URL`);
                return url;
        }
    } catch (error) {
        console.log(`Warning: URL shortening failed: ${error.message}. Using original URL.`);
        return url;
    }
}

/**
 * Shorten with Bit.ly (requires API key)
 */
async function shortenWithBitly(url, apiKey) {
    if (!apiKey) {
        throw new Error('Bitly requires an API key');
    }

    const response = await axios.post(
        'https://api-ssl.bitly.com/v4/shorten',
        {
            long_url: url,
            domain: 'bit.ly'
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        }
    );

    return response.data.link;
}

/**
 * Shorten with TinyURL (API key optional)
 */
async function shortenWithTinyUrl(url, apiKey) {
    const endpoint = apiKey
        ? `https://api.tinyurl.com/create`
        : `https://tinyurl.com/api-create.php`;

    if (apiKey) {
        const response = await axios.post(
            endpoint,
            {
                url: url,
                domain: 'tinyurl.com'
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        return response.data.data.tiny_url;
    } else {
        const response = await axios.get(endpoint, {
            params: { url },
            timeout: 10000
        });
        return response.data;
    }
}

/**
 * Shorten with is.gd (no API key required)
 */
async function shortenWithIsGd(url) {
    const response = await axios.get('https://is.gd/create.php', {
        params: {
            format: 'json',
            url: url
        },
        timeout: 10000
    });

    if (response.data.shorturl) {
        return response.data.shorturl;
    }

    throw new Error(response.data.errormessage || 'Failed to shorten URL');
}

/**
 * Shorten with v.gd (no API key required)
 */
async function shortenWithVgd(url) {
    const response = await axios.get('https://v.gd/create.php', {
        params: {
            format: 'json',
            url: url
        },
        timeout: 10000
    });

    if (response.data.shorturl) {
        return response.data.shorturl;
    }

    throw new Error(response.data.errormessage || 'Failed to shorten URL');
}

/**
 * Shorten with Cuttly (requires API key)
 */
async function shortenWithCuttly(url, apiKey) {
    if (!apiKey) {
        throw new Error('Cuttly requires an API key');
    }

    const response = await axios.get('https://cutt.ly/api/api.php', {
        params: {
            key: apiKey,
            short: url
        },
        timeout: 10000
    });

    if (response.data.url && response.data.url.status === 7) {
        return response.data.url.shortLink;
    }

    throw new Error('Failed to shorten URL with Cuttly');
}

/**
 * Batch shorten multiple URLs
 */
async function batchShortenUrls(urls, service = SERVICES.ISGD, apiKey = null, delayMs = 1000) {
    const results = [];

    for (const url of urls) {
        try {
            const shortUrl = await shortenUrl(url, service, apiKey);
            results.push({ original: url, shortened: shortUrl, success: true });

            // Add delay to respect rate limits
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        } catch (error) {
            results.push({
                original: url,
                shortened: url,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Create tracking URL with analytics
 */
async function createTrackingUrl(url, trackingId, baseTrackingUrl) {
    if (!baseTrackingUrl) {
        return url;
    }

    // Create a tracking redirect URL
    const trackingUrl = `${baseTrackingUrl}?id=${trackingId}&redirect=${encodeURIComponent(url)}`;
    return trackingUrl;
}

module.exports = {
    shortenUrl,
    batchShortenUrls,
    createTrackingUrl,
    SERVICES
};
