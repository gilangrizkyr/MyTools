import { ImageCompressor } from './ImageCompressor.js';

/**
 * Batch Processor Engine
 * Manages parallel/sequential queue of files for batch compression.
 */
export class BatchProcessor {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 2;
    this.queue = [];
    this.results = [];
    this.isProcessing = false;
    this.onItemStart = options.onItemStart || (() => {});
    this.onItemProgress = options.onItemProgress || (() => {});
    this.onItemComplete = options.onItemComplete || (() => {});
    this.onBatchComplete = options.onBatchComplete || (() => {});
  }

  /**
   * Add files to batch queue
   * @param {Array<File>} files 
   * @param {Object} compressionOptions 
   */
  addFiles(files, compressionOptions = {}) {
    const items = files.map((file, idx) => ({
      id: `file_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      file,
      options: { ...compressionOptions },
      status: 'pending', // 'pending' | 'processing' | 'completed' | 'error'
      progress: 0,
      statusText: 'Queued',
      result: null,
      error: null
    }));

    this.queue.push(...items);
    return items;
  }

  /**
   * Start processing batch queue
   */
  async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const pending = this.queue.filter(item => item.status === 'pending');

    for (const item of pending) {
      item.status = 'processing';
      this.onItemStart(item);

      try {
        const result = await ImageCompressor.compress(item.file, {
          ...item.options,
          onProgress: (percent, text) => {
            item.progress = percent;
            item.statusText = text;
            this.onItemProgress(item);
          }
        });

        item.status = 'completed';
        item.result = result;
        item.progress = 100;
        item.statusText = 'Completed';
        this.results.push(result);
        this.onItemComplete(item);
      } catch (err) {
        console.error('Failed to compress file:', item.file.name, err);
        item.status = 'error';
        item.error = err.message || 'Compression failed';
        item.statusText = 'Failed';
        this.onItemComplete(item);
      }
    }

    this.isProcessing = false;
    this.onBatchComplete(this.results);
  }

  /**
   * Clear all items from queue and release object URLs
   */
  clear() {
    this.queue.forEach(item => {
      if (item.result) {
        if (item.result.originalUrl) URL.revokeObjectURL(item.result.originalUrl);
        if (item.result.compressedUrl) URL.revokeObjectURL(item.result.compressedUrl);
      }
    });
    this.queue = [];
    this.results = [];
    this.isProcessing = false;
  }
}
