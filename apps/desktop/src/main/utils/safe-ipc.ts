import { BrowserWindow, WebContents } from 'electron';

// Track which webContents have a live renderer process
const aliveRenderers = new WeakSet<WebContents>();

/**
 * Mark a webContents renderer as alive (call after did-finish-load).
 */
export function markRendererAlive(wc: WebContents): void {
  aliveRenderers.add(wc);
}

/**
 * Mark a webContents renderer as dead (call on render-process-gone / destroyed).
 */
export function markRendererDead(wc: WebContents): void {
  aliveRenderers.delete(wc);
}

/**
 * Safely send an IPC message to the renderer.
 * - Checks window + webContents are alive
 * - Checks renderer process hasn't been terminated
 * - Deep-clones the payload via JSON roundtrip to strip non-serializable values
 *   (Error objects, functions, circular refs, etc.)
 * - Catches any send error silently
 */
export function safeSend(win: BrowserWindow | null, channel: string, data: unknown): void {
  try {
    if (!win || win.isDestroyed()) return;
    const wc = win.webContents;
    if (!wc || wc.isDestroyed()) return;

    // Don't send if the renderer process was terminated or hasn't loaded yet
    if (!aliveRenderers.has(wc)) return;

    // JSON roundtrip ensures only serializable data goes through IPC
    const safe = JSON.parse(JSON.stringify(data ?? null));
    wc.send(channel, safe);
  } catch {
    // Renderer might be gone or data wasn't serializable — silently ignore
  }
}
