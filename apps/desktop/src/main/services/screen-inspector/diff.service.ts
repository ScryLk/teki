import type { CapturedFrame, DiffResult, Region, ChangeType } from '@teki/shared';

// ── Thresholds ──────────────────────────────────────────────────────────────
const PIXEL_THRESHOLD = 30;
const MINOR_CHANGE_PCT = 0.02;
const SIGNIFICANT_CHANGE_PCT = 0.08;
const POPUP_CHANGE_PCT = 0.15;
const GRID_SIZE = 16;

export class ScreenDiffService {
  private previousFrame: CapturedFrame | null = null;
  private previousSourceName: string | null = null;

  compare(currentFrame: CapturedFrame): DiffResult {
    // First frame — always analyze
    if (!this.previousFrame) {
      this.previousFrame = currentFrame;
      this.previousSourceName = currentFrame.sourceName;
      return {
        changed: true,
        changePercentage: 1,
        changeType: 'first_frame',
        changedRegions: [],
        shouldAnalyze: true,
        reason: 'First frame captured',
      };
    }

    // Window changed — always analyze
    if (currentFrame.sourceName !== this.previousSourceName) {
      this.previousFrame = currentFrame;
      this.previousSourceName = currentFrame.sourceName;
      return {
        changed: true,
        changePercentage: 1,
        changeType: 'window_change',
        changedRegions: [],
        shouldAnalyze: true,
        reason: `Window changed: ${currentFrame.sourceName}`,
      };
    }

    // Same window — compute pixel diff
    const { changePercentage, changedRegions } = this.computeGridDiff(
      this.previousFrame,
      currentFrame
    );

    this.previousFrame = currentFrame;
    this.previousSourceName = currentFrame.sourceName;

    // Decision flow
    if (changePercentage < MINOR_CHANGE_PCT) {
      return {
        changed: false,
        changePercentage,
        changeType: 'none',
        changedRegions,
        shouldAnalyze: false,
        reason: `Minimal change (${(changePercentage * 100).toFixed(1)}%)`,
      };
    }

    // Check for popup pattern (concentrated rectangular region)
    const popupDetected = this.detectPopupPattern(changedRegions, currentFrame.width, currentFrame.height);

    if (popupDetected) {
      return {
        changed: true,
        changePercentage,
        changeType: 'popup',
        changedRegions,
        shouldAnalyze: true,
        reason: 'Popup/dialog detected',
      };
    }

    if (changePercentage < SIGNIFICANT_CHANGE_PCT) {
      return {
        changed: true,
        changePercentage,
        changeType: 'minor',
        changedRegions,
        shouldAnalyze: false,
        reason: `Minor change (${(changePercentage * 100).toFixed(1)}%), no popup pattern`,
      };
    }

    return {
      changed: true,
      changePercentage,
      changeType: 'significant',
      changedRegions,
      shouldAnalyze: true,
      reason: `Significant change (${(changePercentage * 100).toFixed(1)}%)`,
    };
  }

  reset(): void {
    this.previousFrame = null;
    this.previousSourceName = null;
  }

  private computeGridDiff(
    prev: CapturedFrame,
    curr: CapturedFrame
  ): { changePercentage: number; changedRegions: Region[] } {
    const prevPixels = this.decodeToRaw(prev);
    const currPixels = this.decodeToRaw(curr);

    if (!prevPixels || !currPixels) {
      return { changePercentage: 0, changedRegions: [] };
    }

    const width = Math.min(prev.width, curr.width);
    const height = Math.min(prev.height, curr.height);

    const cellW = Math.ceil(width / GRID_SIZE);
    const cellH = Math.ceil(height / GRID_SIZE);

    const changedRegions: Region[] = [];
    let totalCells = 0;
    let changedCells = 0;

    for (let gy = 0; gy < GRID_SIZE; gy++) {
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        totalCells++;

        const startX = gx * cellW;
        const startY = gy * cellH;
        const endX = Math.min(startX + cellW, width);
        const endY = Math.min(startY + cellH, height);

        let diffPixels = 0;
        let totalPixels = 0;
        let totalDiff = 0;

        // Sample pixels in this cell (skip some for performance)
        const stepX = Math.max(1, Math.floor((endX - startX) / 8));
        const stepY = Math.max(1, Math.floor((endY - startY) / 8));

        for (let y = startY; y < endY; y += stepY) {
          for (let x = startX; x < endX; x += stepX) {
            totalPixels++;
            const idx = (y * width + x) * 4;

            if (idx + 2 < prevPixels.length && idx + 2 < currPixels.length) {
              const dr = Math.abs(prevPixels[idx] - currPixels[idx]);
              const dg = Math.abs(prevPixels[idx + 1] - currPixels[idx + 1]);
              const db = Math.abs(prevPixels[idx + 2] - currPixels[idx + 2]);
              const diff = (dr + dg + db) / 3;

              if (diff > PIXEL_THRESHOLD) {
                diffPixels++;
                totalDiff += diff;
              }
            }
          }
        }

        const cellChangeRatio = totalPixels > 0 ? diffPixels / totalPixels : 0;

        if (cellChangeRatio > 0.1) {
          changedCells++;
          changedRegions.push({
            x: startX,
            y: startY,
            width: endX - startX,
            height: endY - startY,
            changeIntensity: totalPixels > 0 ? totalDiff / totalPixels : 0,
          });
        }
      }
    }

    const changePercentage = totalCells > 0 ? changedCells / totalCells : 0;

    return { changePercentage, changedRegions };
  }

  private detectPopupPattern(regions: Region[], frameWidth: number, frameHeight: number): boolean {
    if (regions.length < 2 || regions.length > GRID_SIZE * GRID_SIZE * 0.4) {
      return false;
    }

    // Find bounding box of all changed regions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const r of regions) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }

    const boundingWidth = maxX - minX;
    const boundingHeight = maxY - minY;

    // Popup characteristics:
    // 1. Not full-screen (covers < 70% of frame)
    const coverageRatio = (boundingWidth * boundingHeight) / (frameWidth * frameHeight);
    if (coverageRatio > 0.7) return false;

    // 2. Somewhat centered (not at extreme edges)
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const frameCenterX = frameWidth / 2;
    const frameCenterY = frameHeight / 2;
    const distFromCenter = Math.sqrt(
      Math.pow((centerX - frameCenterX) / frameWidth, 2) +
      Math.pow((centerY - frameCenterY) / frameHeight, 2)
    );

    // 3. Concentrated — regions fill most of the bounding box
    const regionArea = regions.reduce((sum, r) => sum + r.width * r.height, 0);
    const boundingArea = boundingWidth * boundingHeight;
    const fillRatio = boundingArea > 0 ? regionArea / boundingArea : 0;

    // Popup if concentrated change near center, covering a moderate area
    return fillRatio > 0.3 && distFromCenter < 0.5 && coverageRatio > 0.02;
  }

  private decodeToRaw(frame: CapturedFrame): Uint8Array | null {
    try {
      // Use NativeImage's toBitmap for raw RGBA pixel data
      // Since we have a PNG buffer, we need to decode it
      // In Electron, we can use nativeImage
      const { nativeImage } = require('electron');
      const img = nativeImage.createFromBuffer(frame.imageBuffer);
      if (img.isEmpty()) return null;
      return new Uint8Array(img.toBitmap());
    } catch {
      return null;
    }
  }
}

export default ScreenDiffService;
