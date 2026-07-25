export interface CompressionOptions {
  format?: 'original' | 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';
  maxSizeBytes?: number;
  quality?: number;
  autoTargetSize?: boolean;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

export interface CompressionResult {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  resolutionString: string;
  format: string;
  originalUrl: string;
  compressedUrl: string;
  compressedBlob: Blob;
  processingTimeMs: number;
  timestamp: number;
}

export interface AttachOptions extends CompressionOptions {
  onStart?: (files: File[]) => void;
  onSuccess?: (compressedFiles: File[]) => void;
  onError?: (error: Error) => void;
}

export declare class ImageCompressor {
  static compress(file: File, options?: CompressionOptions): Promise<CompressionResult>;
}

export declare class FileOptimizerSDK {
  static compress(file: File, options?: CompressionOptions): Promise<File>;
  static attachToInput(target: string | HTMLInputElement, options?: AttachOptions): { detach: () => void } | null;
  static compressFormData(formData: FormData, options?: CompressionOptions): Promise<FormData>;
}

export default FileOptimizerSDK;
