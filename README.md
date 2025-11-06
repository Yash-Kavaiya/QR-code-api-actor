# QR Code API Actor - Advanced Edition v2.0

🚀 The most advanced QR code generation solution on Apify! Create, customize, and manage professional QR codes at scale with AI-powered features, advanced styling, batch processing, and real-time analytics.

## 🌟 What's New in v2.0

- **15+ Pre-designed Templates**: Professional templates for every use case
- **Advanced Styling**: Dots, rounded corners, gradients, and decorative frames
- **URL Shortening**: Integrate with bit.ly, TinyURL, is.gd, and more
- **Batch Import**: CSV/JSON file import and Apify dataset integration
- **QR Validation**: Automatic readability testing
- **ZIP Export**: Download all QR codes in organized archives
- **Webhook Notifications**: Real-time progress and completion alerts
- **15+ Data Types**: Extended support including calendar events, payments, geo-location
- **Enhanced Analytics**: Comprehensive tracking and reporting

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Advanced Features](#advanced-features)
- [Templates](#templates)
- [Input Configuration](#input-configuration)
- [Data Types](#data-types)
- [Styling Options](#styling-options)
- [Batch Processing](#batch-processing)
- [Examples](#examples)
- [API Integration](#api-integration)

## 🚀 Quick Start

### Basic Example
```json
{
  "qrCodes": [
    {
      "type": "url",
      "content": "https://apify.com",
      "id": "my-first-qr"
    }
  ]
}
```

### Using a Template
```json
{
  "qrCodes": [
    {
      "type": "vcard",
      "content": "{\"name\":\"John Doe\",\"phone\":\"+1234567890\",\"email\":\"john@example.com\"}",
      "id": "business-card"
    }
  ],
  "template": "BUSINESS_CARD"
}
```

## ✨ Advanced Features

### 1. Pre-designed Templates

Choose from 15+ professional templates optimized for different use cases:

**Business & Professional**
- `BUSINESS_CARD` - Professional QR codes for business cards
- `CORPORATE` - Clean corporate style
- `MINIMALIST` - Simple and elegant

**Marketing & Creative**
- `VIBRANT` - Eye-catching designs for marketing
- `GRADIENT_MODERN` - Modern gradient styles
- `PROMOTIONAL` - Bold promotional designs

**Social Media**
- `SOCIAL_MEDIA` - Optimized for social profiles
- `INSTAGRAM` - Instagram-inspired gradients

**Specialized**
- `EVENT_TICKET` - High reliability for events
- `RESTAURANT_MENU` - Easy-to-scan for menus
- `WIFI_SHARING` - WiFi credential sharing
- `PAYMENT` - Secure payment QR codes
- `APP_DOWNLOAD` - App store downloads
- `PRODUCT_TAG` - Compact for product labels
- `PRINT_HIGH_QUALITY` - High-res for printing

**Usage:**
```json
{
  "qrCodes": [...],
  "template": "BUSINESS_CARD",
  "listTemplates": true
}
```

### 2. Advanced Styling

#### QR Code Styles
- **square**: Traditional square modules (default)
- **dots**: Circular dots instead of squares
- **rounded**: Rounded corner squares
- **extra-rounded**: Very rounded corners
- **classy**: Professional appearance
- **classy-rounded**: Rounded classy style

#### Gradients
- **linear-vertical**: Top to bottom gradient
- **linear-horizontal**: Left to right gradient
- **radial**: Center outward gradient

#### Frames
- **basic**: Simple border frame
- **circular**: Circular mask
- **edge**: Edge decoration
- **banner**: Decorative banner style

**Example:**
```json
{
  "customization": {
    "style": "dots",
    "gradientType": "radial",
    "gradientColors": ["#667eea", "#764ba2"],
    "frame": "circular",
    "frameText": "Scan Me"
  }
}
```

### 3. URL Shortening

Shorten URLs automatically before encoding in QR codes:

**Supported Services:**
- `isgd` (is.gd) - Free, no API key required
- `vgd` (v.gd) - Free, no API key required
- `tinyurl` - Free, optional API key
- `bitly` - Requires API key
- `cuttly` - Requires API key

**Example:**
```json
{
  "urlShortening": {
    "enabled": true,
    "service": "isgd"
  }
}
```

### 4. Batch Import

Import QR codes from multiple sources:

#### CSV Import
```json
{
  "batchImport": {
    "csvUrl": "https://example.com/qrcodes.csv"
  }
}
```

**CSV Format:**
```csv
type,content,id,customization
url,https://example.com,qr-1,
email,contact@example.com,qr-2,
vcard,"{\"name\":\"Jane\"}",qr-3,"{\"size\":400}"
```

#### JSON Import
```json
{
  "batchImport": {
    "jsonUrl": "https://example.com/qrcodes.json"
  }
}
```

#### Apify Dataset
```json
{
  "batchImport": {
    "datasetId": "your-dataset-id"
  }
}
```

### 5. QR Code Validation

Automatically test readability of generated QR codes:

```json
{
  "validateQRCodes": true
}
```

Validation checks:
- ✅ Readability test
- ✅ Content verification
- ✅ Quality assessment
- ✅ Resilience testing (blur, scale, brightness)

### 6. ZIP Export

Download all generated QR codes in a ZIP archive:

```json
{
  "exportZip": {
    "enabled": true,
    "organizeByType": true
  }
}
```

Features:
- Organized folder structure
- Metadata JSON file
- Comprehensive README
- CSV export option

### 7. Webhook Notifications

Receive real-time updates during generation:

```json
{
  "webhookUrl": "https://your-server.com/webhook"
}
```

**Events:**
- `generation.started` - When generation begins
- `generation.progress` - Progress updates (every 5 chunks)
- `qrcode.created` - Individual QR code created
- `qrcode.failed` - Individual QR code failed
- `generation.completed` - All QR codes processed
- `validation.completed` - Validation finished
- `export.ready` - ZIP archive ready

## 🎯 Data Types

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

### SMS
```json
{
  "type": "sms",
  "content": "{\"phone\":\"+1234567890\",\"message\":\"Hello!\"}"
}
```

### WiFi
```json
{
  "type": "wifi",
  "content": "{\"ssid\":\"MyNetwork\",\"password\":\"secret123\",\"encryption\":\"WPA\",\"hidden\":false}"
}
```

### vCard (Contact)
```json
{
  "type": "vcard",
  "content": "{\"name\":\"John Doe\",\"phone\":\"+1234567890\",\"email\":\"john@example.com\",\"organization\":\"ACME Corp\",\"title\":\"CEO\",\"url\":\"https://example.com\",\"address\":\"123 Main St\"}"
}
```

### Social Media
```json
{
  "type": "social",
  "content": "{\"platform\":\"instagram\",\"username\":\"myhandle\"}"
}
```
**Supported platforms:** twitter, instagram, facebook, linkedin, youtube, tiktok, github, discord

### Geo-Location
```json
{
  "type": "geo",
  "content": "{\"latitude\":40.7128,\"longitude\":-74.0060}"
}
```

### Calendar Event (NEW!)
```json
{
  "type": "calendar",
  "content": "{\"title\":\"Meeting\",\"start\":\"2024-12-01T10:00:00\",\"end\":\"2024-12-01T11:00:00\",\"location\":\"Office\",\"description\":\"Team meeting\"}"
}
```

### Payment (NEW!)
```json
{
  "type": "payment",
  "content": "{\"upi\":\"user@bank\",\"name\":\"John Doe\",\"amount\":\"100\"}"
}
```

### App Store Links (NEW!)
```json
{
  "type": "app",
  "content": "{\"ios\":\"https://apps.apple.com/app/...\",\"android\":\"https://play.google.com/store/apps/...\",\"universal\":\"https://myapp.com\"}"
}
```

## 🎨 Complete Input Configuration

```json
{
  "qrCodes": [],
  "batchImport": {
    "csvUrl": "",
    "jsonUrl": "",
    "datasetId": "",
    "kvStoreKey": ""
  },
  "outputFormat": "png",
  "template": "BUSINESS_CARD",
  "listTemplates": false,
  "customization": {
    "size": 500,
    "margin": 4,
    "errorCorrectionLevel": "H",
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "logoUrl": "https://example.com/logo.png",
    "logoSize": 20,
    "style": "dots",
    "gradientType": "radial",
    "gradientColors": ["#667eea", "#764ba2"],
    "frame": "circular",
    "frameColor": "#000000",
    "frameText": "Scan to Connect"
  },
  "urlShortening": {
    "enabled": true,
    "service": "isgd",
    "apiKey": ""
  },
  "trackingUrl": "https://track.example.com/qr",
  "validateQRCodes": true,
  "exportZip": {
    "enabled": true,
    "organizeByType": true
  },
  "exportCSV": true,
  "webhookUrl": "https://your-server.com/webhook",
  "enableAnalytics": true,
  "filenamePrefix": "qr-code",
  "saveToKeyValueStore": true,
  "maxConcurrency": 10
}
```

## 📊 Output

### Dataset
Each QR code result includes:
```json
{
  "id": "qr-001",
  "type": "url",
  "content": "https://example.com",
  "formattedContent": "https://example.com",
  "success": true,
  "fileUrl": "https://api.apify.com/v2/key-value-stores/.../qr-code-qr-001.png",
  "files": {
    "png": {
      "filename": "qr-code-qr-001.png",
      "url": "...",
      "size": 12345
    }
  },
  "customization": {...},
  "analytics": {
    "trackingId": "qr-001",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Key-Value Store

- **OUTPUT**: Complete summary with statistics
- **VALIDATION_RESULTS**: QR code validation results
- **results.csv**: CSV export of all results
- **qr-codes-[timestamp].zip**: ZIP archive
- Individual QR code files

## 💡 Use Cases & Examples

### Marketing Campaign (1000 unique QR codes)
```json
{
  "batchImport": {
    "csvUrl": "https://example.com/campaign-urls.csv"
  },
  "template": "VIBRANT",
  "urlShortening": {
    "enabled": true,
    "service": "bitly",
    "apiKey": "YOUR_BITLY_KEY"
  },
  "validateQRCodes": true,
  "exportZip": {
    "enabled": true
  },
  "webhookUrl": "https://your-dashboard.com/webhook"
}
```

### Event Tickets with Validation
```json
{
  "qrCodes": [...],
  "template": "EVENT_TICKET",
  "customization": {
    "logoUrl": "https://event.com/logo.png",
    "errorCorrectionLevel": "H"
  },
  "validateQRCodes": true,
  "exportZip": {
    "enabled": true,
    "organizeByType": false
  }
}
```

### Restaurant Menu QR Codes
```json
{
  "qrCodes": [
    {"type": "url", "content": "https://restaurant.com/menu", "id": "table-1"},
    {"type": "url", "content": "https://restaurant.com/menu", "id": "table-2"}
  ],
  "template": "RESTAURANT_MENU",
  "customization": {
    "frame": "banner",
    "frameText": "View Menu"
  }
}
```

### Business Cards with vCard
```json
{
  "qrCodes": [...],
  "template": "BUSINESS_CARD",
  "customization": {
    "logoUrl": "https://company.com/logo.png",
    "style": "classy-rounded"
  },
  "outputFormat": "all"
}
```

## 🔌 API Integration

### Node.js
```javascript
const Apify = require('apify');

const input = {
  qrCodes: [{type: 'url', content: 'https://example.com', id: 'qr-1'}],
  template: 'GRADIENT_MODERN',
  validateQRCodes: true,
  exportZip: {enabled: true}
};

const run = await Apify.call('your-username/qr-code-api-actor', input);
const dataset = await Apify.openDataset(run.defaultDatasetId);
const {items} = await dataset.getData();
```

### Python
```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('your-username/qr-code-api-actor').call(run_input={
    'qrCodes': [{'type': 'url', 'content': 'https://example.com'}],
    'template': 'GRADIENT_MODERN',
    'validateQRCodes': True,
    'exportZip': {'enabled': True}
})

for item in client.dataset(run['defaultDatasetId']).iterate_items():
    print(item)
```

### REST API
```bash
curl -X POST https://api.apify.com/v2/acts/your-username~qr-code-api-actor/runs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodes": [{
      "type": "url",
      "content": "https://example.com"
    }],
    "template": "GRADIENT_MODERN"
  }'
```

## 📈 Performance

- **Speed**: 0.5-3 seconds per QR code
- **Concurrency**: Up to 50 simultaneous generations
- **Batch size**: No practical limit
- **Validation**: Adds ~0.5s per QR code
- **ZIP creation**: ~1-5s for 100 QR codes

## 🎓 Best Practices

1. **Error Correction**: Use level H with logos, M or Q without
2. **Size**: Minimum 300px for print, 200px for digital
3. **Contrast**: Maintain 4.5:1 ratio for accessibility
4. **Logo**: Keep at 20% or less of QR size
5. **Testing**: Always enable validation for production
6. **Gradients**: Use high contrast colors
7. **Batch**: Process in chunks of 10-50 for optimal performance
8. **Templates**: Start with templates, then customize

## 🔧 Troubleshooting

### QR Code Not Scanning
- Increase error correction to H
- Reduce logo size or remove it
- Increase QR code size
- Check color contrast
- Enable validation to catch issues

### Logo Not Appearing
- Verify URL is publicly accessible
- Check image format (PNG, JPG supported)
- Ensure logo isn't too large

### Slow Generation
- Reduce concurrency
- Disable validation for testing
- Remove complex styling temporarily

### Batch Import Fails
- Check CSV format matches template
- Verify URLs are accessible
- Ensure JSON is valid

## 📚 Additional Resources

- [CSV Template Generator](Generate via Actor)
- [Webhook Testing Tool](Use webhook.site)
- [QR Code Scanner](Use any mobile QR scanner app)
- [Apify Documentation](https://docs.apify.com)

## 🆕 Changelog

### v2.0.0 (Current)
- Added 15+ pre-designed templates
- Advanced styling (dots, gradients, frames)
- URL shortening integration (5 services)
- Batch CSV/JSON import
- QR code validation
- ZIP export with organization
- Webhook notifications (7 event types)
- 15+ data types (added calendar, payment, geo, app)
- Enhanced analytics and reporting
- Comprehensive error handling

### v1.0.0
- Basic QR code generation
- Multiple formats (PNG, SVG, PDF)
- Logo overlay support
- Basic customization
- Dataset export

## 💎 Premium Features

### URL Shortening
Integrate with premium services like Bitly for:
- Custom branded short links
- Click analytics
- Link management
- A/B testing

### Analytics Integration
Connect with tracking platforms for:
- Scan location data
- Device information
- Time-based analytics
- Campaign performance

### Custom Templates
Create and save your own templates:
- Brand-specific designs
- Reusable configurations
- Team sharing

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/Yash-Kavaiya/QR-code-api-actor/issues)
- **Documentation**: [Apify Docs](https://docs.apify.com)
- **Community**: [Apify Discord](https://discord.gg/apify)
- **Email**: support@apify.com

## 📄 License

Apache-2.0

---

**Built with ❤️ on the [Apify Platform](https://apify.com)**

🌟 **Star this Actor** if you find it useful!
💡 **Feature requests** are welcome via GitHub Issues
🐛 **Bug reports** help make this Actor better

## Quick Links

- [Try it now on Apify Console](https://console.apify.com)
- [View source code](https://github.com/Yash-Kavaiya/QR-code-api-actor)
- [API Documentation](https://docs.apify.com/api/v2)
- [Pricing Calculator](https://apify.com/pricing)
