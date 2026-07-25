# ocr-scanner

Client-side Optical Character Recognition (OCR) scanner and integration SDK designed to extract structured metadata (Merchant Name, Date, Total Amount, Tax/Subtotal) from receipt and document images 100% locally in the browser, with instant export to Excel (CSV) and JSON.

## Features

- **100% Client-Side OCR Execution**: Runs Optical Character Recognition inside the user's browser using `tesseract.js` and Canvas contrast pre-processing, guaranteeing data privacy and zero API costs.
- **Structured Metadata Parser**: Automatically parses extracted raw text to detect Store/Merchant Name, Transaction Date, Total Amount (IDR/Currency), Tax, and Subtotal.
- **Auto-Fill Integration SDK**: Embeddable JavaScript SDK (`ReceiptOcrSDK`) that hooks into HTML file inputs on expense forms to automatically auto-fill form fields (`merchant`, `date`, `totalAmount`) without manual data entry.
- **Excel & CSV Export**: Allows users to export scanned receipt records directly into Excel-compatible `.csv` files.

## Website SDK Integration

### Option A: Automatic Form Auto-Fill

Attach `ReceiptOcrSDK` to an HTML `<input type="file">` element to automatically populate form inputs:

```javascript
import { ReceiptOcrSDK } from './src/sdk/ReceiptOcrSDK.js';

ReceiptOcrSDK.attachToForm('#receiptInput', {
  merchantInput: '#storeName',
  dateInput: '#transactionDate',
  amountInput: '#totalAmount'
}, {
  onSuccess: (data) => {
    console.log('Form fields populated successfully:', data);
  }
});
```

### Option B: Programmatic Function Call

Use the `extract()` method for custom data pipelines:

```javascript
import { ReceiptOcrSDK } from './src/sdk/ReceiptOcrSDK.js';

const imageFile = document.getElementById('myInput').files[0];

const metadata = await ReceiptOcrSDK.extract(imageFile);

console.log('Merchant:', metadata.merchant);
console.log('Date:', metadata.date);
console.log('Total Amount:', metadata.totalAmount);
```

## Setup and Development

### Installation

```bash
cd ocr-scanner
npm install
```

### Development Server

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

## License

Copyright © 2026 Gilang. All rights reserved.

Proprietary software. Unauthorized copying, modification, or distribution is strictly prohibited.
