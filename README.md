# QR Code API Actor

The QR Code API Actor offers a versatile solution for generating, customizing, and managing QR codes programmatically on Apify's platform. Users can create QR codes for various data types such as URLs, text, contact information, WiFi credentials, and social media profiles. The Actor provides extensive customization options, including colors, logos, sizes, and error correction levels.

## Key Features

### 🚀 Bulk QR Code Generation
Process multiple inputs simultaneously for efficient workflow. Generate hundreds or thousands of QR codes in a single run with configurable concurrency control.

### 🎨 Advanced Customization
- **Brand Integration**: Incorporate logos and custom color schemes
- **Size Control**: Generate QR codes from 100px to 2000px
- **Error Correction**: Choose from L, M, Q, or H levels
- **Custom Margins**: Adjust white space around QR codes
- **Color Schemes**: Fully customizable foreground and background colors

### 📦 Multiple Output Formats
- **PNG**: High-quality raster images perfect for digital and print
- **SVG**: Scalable vector graphics for responsive designs
- **PDF**: Professional documents with embedded QR codes
- **All Formats**: Generate all three formats simultaneously

### 📊 Analytics Tracking
Monitor QR code performance with built-in metadata tracking. Each generated QR code includes:
- Unique tracking ID
- Creation timestamp
- Scan count placeholder (for integration with tracking services)
- Last scan timestamp

### 🎯 Multiple Data Types
- **URLs**: Direct links to websites
- **Text**: Plain text messages
- **Email**: mailto: links
- **Phone**: tel: links for direct calling
- **SMS**: Pre-formatted text messages
- **WiFi**: Automatic WiFi network connection
- **vCard**: Contact information cards
- **Social Media**: Direct links to social profiles (Twitter, Instagram, Facebook, LinkedIn, YouTube)

## Target Audience

This Actor is perfect for:

- **Marketing Agencies**: Create branded QR codes for campaigns and promotional materials
- **E-commerce Businesses**: Generate product links and promotional QR codes at scale
- **Event Organizers**: Create ticket QRs, venue information, and event schedules
- **Developers**: Integrate QR functionality into applications via API
- **Small Businesses**: Create contactless menus, payment solutions, and customer engagement tools
- **Educational Institutions**: Generate QR codes for learning materials and resource sharing

## Benefits

✅ **Streamlined Workflow Automation**: Eliminate manual QR code creation
✅ **Enhanced Brand Consistency**: Customizable designs ensure brand alignment
✅ **Scalable Processing**: Handle high-volume requirements efficiently
✅ **Comprehensive Tracking**: Gain insights into engagement metrics
✅ **Cost-Effective**: More affordable than premium QR services
✅ **Seamless Integration**: Easy integration with Apify workflows and third-party applications

## Input Configuration

### Basic Configuration

```json
{
  "qrCodes": [
    {
      "type": "url",
      "content": "https://apify.com",
      "id": "apify-homepage"
    }
  ],
  "outputFormat": "png",
  "customization": {
    "size": 300,
    "errorCorrectionLevel": "M"
  }
}
```

### Advanced Configuration with Logo

```json
{
  "qrCodes": [
    {
      "type": "url",
      "content": "https://example.com",
      "id": "branded-qr"
    }
  ],
  "outputFormat": "all",
  "customization": {
    "size": 500,
    "margin": 4,
    "errorCorrectionLevel": "H",
    "foregroundColor": "#1a1a1a",
    "backgroundColor": "#ffffff",
    "logoUrl": "https://example.com/logo.png",
    "logoSize": 20
  },
  "enableAnalytics": true,
  "saveToKeyValueStore": true
}
```

### Bulk Generation Example

```json
{
  "qrCodes": [
    {
      "type": "url",
      "content": "https://example.com/product1",
      "id": "product-001"
    },
    {
      "type": "url",
      "content": "https://example.com/product2",
      "id": "product-002"
    },
    {
      "type": "vcard",
      "content": "{\"name\":\"John Doe\",\"phone\":\"+1234567890\",\"email\":\"john@example.com\"}",
      "id": "contact-john"
    },
    {
      "type": "wifi",
      "content": "{\"ssid\":\"MyNetwork\",\"password\":\"secret123\",\"encryption\":\"WPA\"}",
      "id": "office-wifi"
    }
  ],
  "outputFormat": "png",
  "maxConcurrency": 10
}
```

## Input Parameters

### qrCodes (required)
Array of QR code configurations. Each item should include:
- `type`: Type of QR code (url, text, email, phone, sms, wifi, vcard, social)
- `content`: The actual content to encode
- `id` (optional): Unique identifier for tracking

### outputFormat
- `png` (default): Generate PNG images
- `svg`: Generate SVG vectors
- `pdf`: Generate PDF documents
- `all`: Generate all formats

### customization
Global customization settings (can be overridden per QR code):
- `size`: QR code size in pixels (100-2000, default: 300)
- `margin`: White space margin (0-10, default: 4)
- `errorCorrectionLevel`: Error correction (L/M/Q/H, default: M)
  - **L**: ~7% error correction
  - **M**: ~15% error correction (recommended)
  - **Q**: ~25% error correction
  - **H**: ~30% error correction (use when adding logos)
- `foregroundColor`: QR code color (hex format, default: #000000)
- `backgroundColor`: Background color (hex format, default: #FFFFFF)
- `logoUrl`: URL to logo image for embedding
- `logoSize`: Logo size as percentage (10-40, default: 20)

### Other Options
- `enableAnalytics`: Enable tracking metadata (default: true)
- `filenamePrefix`: Prefix for generated files (default: "qr-code")
- `saveToKeyValueStore`: Save files to Apify KV Store (default: true)
- `maxConcurrency`: Max concurrent generations (1-50, default: 10)

## QR Code Types & Formats

### URL
```json
{
  "type": "url",
  "content": "https://example.com"
}
```

### Email
```json
{
  "type": "email",
  "content": "contact@example.com"
}
```

### Phone
```json
{
  "type": "phone",
  "content": "+1234567890"
}
```

### WiFi Network
```json
{
  "type": "wifi",
  "content": "{\"ssid\":\"NetworkName\",\"password\":\"password123\",\"encryption\":\"WPA\"}"
}
```

### vCard (Contact)
```json
{
  "type": "vcard",
  "content": "{\"name\":\"Jane Smith\",\"phone\":\"+1234567890\",\"email\":\"jane@example.com\",\"organization\":\"ACME Corp\"}"
}
```

### Social Media
```json
{
  "type": "social",
  "content": "{\"platform\":\"instagram\",\"username\":\"myhandle\"}"
}
```
Supported platforms: twitter, instagram, facebook, linkedin, youtube

## Output

### Dataset
The Actor saves detailed results to the default dataset. Each record contains:

```json
{
  "id": "qr-001",
  "type": "url",
  "content": "https://example.com",
  "formattedContent": "https://example.com",
  "format": "png",
  "size": 300,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "customization": {
    "errorCorrectionLevel": "M",
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "hasLogo": false
  },
  "files": {
    "png": {
      "filename": "qr-code-qr-001.png",
      "url": "https://api.apify.com/v2/key-value-stores/xxx/records/qr-code-qr-001.png",
      "size": 12345
    }
  },
  "fileUrl": "https://api.apify.com/v2/key-value-stores/xxx/records/qr-code-qr-001.png",
  "success": true,
  "analytics": {
    "trackingId": "qr-001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "scanCount": 0,
    "lastScanned": null
  }
}
```

### Key-Value Store
Generated QR code files are automatically saved to the Actor's Key-Value Store with public URLs for easy access and sharing.

### OUTPUT Summary
A summary is saved as `OUTPUT` in the Key-Value Store:

```json
{
  "summary": {
    "total": 10,
    "successful": 10,
    "failed": 0,
    "format": "png"
  },
  "results": [...]
}
```

## Use Cases

### 1. Marketing Campaign
Generate 1000 unique QR codes linking to personalized landing pages:
```javascript
const qrCodes = products.map((product, idx) => ({
  type: 'url',
  content: `https://example.com/promo/${product.id}`,
  id: `promo-${idx + 1}`
}));
```

### 2. Event Tickets
Create QR codes for event tickets with custom branding:
```json
{
  "customization": {
    "foregroundColor": "#FF0000",
    "logoUrl": "https://event.com/logo.png",
    "errorCorrectionLevel": "H"
  }
}
```

### 3. Restaurant Menu
Generate QR codes for contactless menu access:
```json
{
  "qrCodes": [
    {
      "type": "url",
      "content": "https://restaurant.com/menu",
      "id": "table-menu"
    }
  ],
  "customization": {
    "size": 400,
    "logoUrl": "https://restaurant.com/logo.png"
  }
}
```

### 4. Product Packaging
Bulk generate QR codes for product information:
```javascript
const qrCodes = inventory.map(product => ({
  type: 'url',
  content: `https://products.com/${product.sku}`,
  id: product.sku
}));
```

### 5. Business Cards
Create vCard QR codes for networking:
```json
{
  "type": "vcard",
  "content": "{\"name\":\"John Doe\",\"phone\":\"+1234567890\",\"email\":\"john@company.com\",\"organization\":\"Tech Corp\"}"
}
```

## Integration Examples

### Node.js / JavaScript
```javascript
const Apify = require('apify');

const input = {
  qrCodes: [
    {
      type: 'url',
      content: 'https://example.com',
      id: 'example-qr'
    }
  ],
  outputFormat: 'png',
  customization: {
    size: 500,
    foregroundColor: '#000080'
  }
};

const run = await Apify.call('your-username/qr-code-api-actor', input);
const dataset = await Apify.openDataset(run.defaultDatasetId);
const { items } = await dataset.getData();
console.log(items);
```

### Python
```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run_input = {
    'qrCodes': [
        {
            'type': 'url',
            'content': 'https://example.com',
            'id': 'example-qr'
        }
    ],
    'outputFormat': 'png'
}

run = client.actor('your-username/qr-code-api-actor').call(run_input=run_input)
for item in client.dataset(run['defaultDatasetId']).iterate_items():
    print(item)
```

### REST API
```bash
curl -X POST https://api.apify.com/v2/acts/your-username~qr-code-api-actor/runs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "qrCodes": [
      {
        "type": "url",
        "content": "https://example.com",
        "id": "example-qr"
      }
    ],
    "outputFormat": "png"
  }'
```

## Best Practices

1. **Error Correction**: Use level H when adding logos to ensure scannability
2. **Size Selection**: Use at least 300px for print, 200px for digital
3. **Color Contrast**: Maintain high contrast between foreground and background
4. **Logo Size**: Keep logos at 20% or less to maintain QR code functionality
5. **Testing**: Always test generated QR codes with multiple scanners
6. **Bulk Processing**: Use appropriate concurrency (10-20) for large batches
7. **URL Shorteners**: Consider using shortened URLs for cleaner QR codes

## Troubleshooting

### QR Code Not Scanning
- Increase error correction level to H
- Reduce logo size or remove it
- Increase QR code size
- Ensure sufficient color contrast

### Logo Not Appearing
- Verify logo URL is publicly accessible
- Check logo format (PNG, JPG supported)
- Ensure logo URL returns valid image data

### Slow Generation
- Reduce concurrency if hitting rate limits
- Remove logo overlay if not needed
- Generate only required formats

## Performance

- **Speed**: ~0.5-2 seconds per QR code (depending on format and customization)
- **Concurrency**: Configurable up to 50 simultaneous generations
- **Limits**: No hard limit on number of QR codes per run
- **File Sizes**:
  - PNG: 2-50 KB (depending on size and content)
  - SVG: 1-10 KB
  - PDF: 10-100 KB

## Pricing

The Actor runs on Apify's platform with standard compute unit pricing. Typical usage:
- ~0.01 compute units per QR code (simple)
- ~0.02-0.03 compute units per QR code (with logo and multiple formats)

## Support & Feedback

- **Issues**: Report bugs via [GitHub Issues](https://github.com/Yash-Kavaiya/QR-code-api-actor/issues)
- **Documentation**: [Apify Actor Documentation](https://docs.apify.com/platform/actors)
- **Community**: [Apify Discord](https://discord.gg/apify)

## License

Apache-2.0

## Version History

### 1.0.0 (Initial Release)
- Bulk QR code generation
- Multiple data type support (URL, text, email, phone, SMS, WiFi, vCard, social)
- Advanced customization (colors, logos, sizes, error correction)
- Multiple output formats (PNG, SVG, PDF)
- Analytics tracking metadata
- Key-Value Store integration
- Configurable concurrency

---

Built with ❤️ on the [Apify Platform](https://apify.com)
