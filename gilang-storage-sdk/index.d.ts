export interface ProcessOptions {
  apiEndpoint?: string;
  onProgress?: (percent: number, statusText: string) => void;
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

export declare class GilangStorageSDK {
  static process(file: File, options?: ProcessOptions): Promise<ProcessResult>;
  static attachToInput(
    target: string | HTMLInputElement,
    options?: ProcessOptions & {
      onStart?: (files: File[]) => void;
      onSuccess?: (results: ProcessResult[]) => void;
      onError?: (error: any) => void;
    }
  ): { detach: () => void } | null;
}

export default GilangStorageSDK;
