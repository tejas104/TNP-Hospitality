import type { PreviewService } from '../contracts/preview.ts';
import { DemoPreviewService } from '../demo/service.ts';
import { BrowserPreviewStorage, MemoryPreviewStorage, PreviewStore } from '../demo/store.ts';

export async function createPreviewService(options?: { browser?: boolean }): Promise<PreviewService> {
  const storage = options?.browser && typeof window !== 'undefined'
    ? new BrowserPreviewStorage()
    : new MemoryPreviewStorage();
  return new DemoPreviewService(await PreviewStore.create(storage));
}

let browserService: Promise<PreviewService> | null = null;

export function getBrowserPreviewService(): Promise<PreviewService> {
  if (!browserService) browserService = createPreviewService({ browser: true });
  return browserService;
}
