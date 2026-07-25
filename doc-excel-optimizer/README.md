# doc-excel-optimizer

Client-side Office document optimization library and SDK built to compress Word (`.docx`), Excel (`.xlsx`), and PowerPoint (`.pptx`) files while keeping 100% of text, formulas, layout formatting, and table definitions completely untouched.

## Features

- **100% Data Integrity**: Keeps XML text layers, formulas, tables, and slide animations completely untouched.
- **Embedded Asset Optimization**: Scans internal `word/media/`, `ppt/media/`, and `xl/media/` assets inside Office ZIP containers and applies high-fidelity compression.
- **100% Client-Side Privacy**: Runs in the browser via JSZip and Web APIs.
- **Integration SDK (`DocOptimizerSDK`)**: Intercepts HTML `<input type="file">` elements to automatically compress Word, Excel, and PowerPoint uploads.

## Usage

```javascript
import { DocOptimizerSDK } from './src/sdk/DocOptimizerSDK.js';

DocOptimizerSDK.attachToInput('#docUpload', {
  onSuccess: (files) => {
    console.log('Optimized Office document ready:', files[0]);
  }
});
```

## License

Copyright © 2026 Gilang. All rights reserved.
Proprietary software.
