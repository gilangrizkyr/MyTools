// gilang-storage-sdk v1.1.0 — TypeScript Definitions

export interface SDKConfig {
  apiEndpoint?: string;
  apiKey?: string;
  authToken?: string;
  maxImageSizeBytes?: number;
  maxVideoSizeBytes?: number;
  maxPdfSizeBytes?: number;
  maxDocSizeBytes?: number;
  thumbnailSize?: number;
  generateThumbnail?: boolean;
  skipSecurity?: boolean;
  fieldName?: string;
  thumbnailFieldName?: string;
  onProgress?: (percent: number, statusText: string) => void;
  onSuccess?: (result: ProcessResult) => void;
  onError?: (error: Error) => void;
  onStart?: (files: File[]) => void;
}

export interface SecurityMeta {
  hexSignature: string;
  detectedMime: string;
  gpsStripped: boolean;
}

export interface CompressionMeta {
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  skipped: boolean;
}

export interface ProcessResult {
  fileName: string;
  originalFile: File;
  processedFile: File;
  thumbnailFile: File | null;
  securityMeta: SecurityMeta;
  compressionMeta: CompressionMeta;
  uploadResponse: any | null;
  totalTimeMs: number;
}

export interface DetachHandle {
  detach: () => void;
}

export declare class GilangStorageSDK {
  /**
   * Set global SDK configuration once — applies to all subsequent calls.
   */
  static configure(config: SDKConfig): void;

  /**
   * Run the full pipeline: Security → Compress → Thumbnail → Upload
   */
  static process(file: File, options?: SDKConfig): Promise<ProcessResult>;

  /**
   * Compress a file and upload to UnaraStorage in one call.
   */
  static compressAndUpload(file: File, options?: SDKConfig): Promise<ProcessResult>;

  /**
   * Compress only — no upload, no thumbnail.
   */
  static compressOnly(file: File, options?: SDKConfig): Promise<ProcessResult>;

  /**
   * Auto-attach full pipeline to an <input type="file"> element.
   */
  static attachToInput(
    target: string | HTMLInputElement,
    options?: SDKConfig
  ): DetachHandle | null;

  /**
   * Auto-attach full pipeline to a drag & drop zone element.
   */
  static attachToDropzone(
    target: string | HTMLElement,
    options?: SDKConfig
  ): DetachHandle | null;
}

export default GilangStorageSDK;
