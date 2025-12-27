declare module 'tesseract.js' {
  export function createWorker(options?: unknown): {
    load: () => Promise<void>;
    loadLanguage: (lang: string) => Promise<void>;
    initialize: (lang: string) => Promise<void>;
    recognize: (image: string | Uint8Array | ImageBitmap) => Promise<{ data: { text: string } }>;
    terminate: () => Promise<void>;
  };
  const _default: { createWorker: typeof createWorker };
  export default _default;
}
