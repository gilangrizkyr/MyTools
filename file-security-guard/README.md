# file-security-guard

Client-side file security verification, EXIF location metadata stripper, and SVG XSS sanitizer SDK (`SecurityGuardSDK`) built for Unara Storage.

## Features

- **Magic Bytes Binary Verification**: Inspects raw binary headers (e.g. JPEG, PNG, PDF, ZIP/Office) to detect disguised executable malware.
- **EXIF GPS Location Stripper**: Re-encodes images to completely strip latitude/longitude GPS metadata from smartphone photos.
- **SVG XSS Sanitizer**: Strips inline `<script>` tags from SVG vector files.
- **Integration SDK (`SecurityGuardSDK`)**: Intercepts HTML `<input type="file">` elements to sanitize files before server upload.

## Usage

```javascript
import { SecurityGuardSDK } from './src/sdk/SecurityGuardSDK.js';

const cleanFile = await SecurityGuardSDK.validate(userFile);
```

## License

Copyright © 2026 Gilang. All rights reserved.
Proprietary software.
