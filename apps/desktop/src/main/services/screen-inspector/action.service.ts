import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type {
  InspectionAlert,
  InspectionAction,
  PotentialError,
  DetectedSoftware,
  KbMatchResult,
  AnalysisResult,
} from '@teki/shared';

// ── Deduplication ──────────────────────────────────────────────────────────
const DEDUP_WINDOW_MS = 60_000; // Don't alert same error twice within 60s

export class InspectionActionService {
  private recentAlerts: Map<string, number> = new Map(); // errorKey → timestamp
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  buildAlert(
    analysis: AnalysisResult,
    kbMatches: KbMatchResult[],
    screenshot?: string
  ): InspectionAlert | null {
    // Filter out deduplicated errors
    const newErrors = analysis.potentialErrors.filter((error) => {
      const key = this.getErrorKey(error);
      const lastSeen = this.recentAlerts.get(key);

      if (lastSeen && Date.now() - lastSeen < DEDUP_WINDOW_MS) {
        return false; // Skip — recently alerted
      }

      return true;
    });

    if (newErrors.length === 0) {
      return null; // Nothing new to alert
    }

    // Mark errors as seen
    for (const error of newErrors) {
      this.recentAlerts.set(this.getErrorKey(error), Date.now());
    }

    // Clean old entries
    this.cleanDedup();

    const software = analysis.detectedSoftware[0];
    const actions = this.buildActions(newErrors, kbMatches, software);

    const alert: InspectionAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: Date.now(),
      software,
      errors: newErrors,
      kbMatches: kbMatches.length > 0 ? kbMatches : undefined,
      screenshot,
      actions,
    };

    return alert;
  }

  sendAlert(alert: InspectionAlert): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.mainWindow.webContents.send(IPC_CHANNELS.INSPECTION_ALERT, alert);
  }

  private buildActions(
    errors: PotentialError[],
    kbMatches: KbMatchResult[],
    software?: DetectedSoftware
  ): InspectionAction[] {
    const actions: InspectionAction[] = [];

    // If KB matches found, add "Open KB" action
    const bestMatch = kbMatches[0]?.bestMatch;
    if (bestMatch) {
      actions.push({
        id: 'action_open_kb',
        label: `Ver: ${bestMatch.title}`,
        type: 'open_kb',
        data: {
          articleId: bestMatch.articleId,
          title: bestMatch.title,
        },
      });
    }

    // Ask AI about the error
    const primaryError = errors[0];
    actions.push({
      id: 'action_ask_ai',
      label: 'Perguntar à IA',
      type: 'ask_ai',
      data: {
        errorText: primaryError.text,
        errorCode: primaryError.code,
        software: software?.name,
      },
    });

    // Copy error text
    actions.push({
      id: 'action_copy',
      label: 'Copiar erro',
      type: 'copy_error',
      data: {
        text: errors.map((e) => e.text).join('\n'),
      },
    });

    // Create ticket annotation
    actions.push({
      id: 'action_ticket',
      label: 'Anotar no chamado',
      type: 'create_ticket_note',
      data: {
        errors: errors.map((e) => ({
          text: e.text,
          code: e.code,
          severity: e.severity,
        })),
        software: software?.name,
      },
    });

    // Dismiss
    actions.push({
      id: 'action_dismiss',
      label: 'Ignorar',
      type: 'dismiss',
    });

    return actions;
  }

  private getErrorKey(error: PotentialError): string {
    // Key based on error source and code for deduplication
    return `${error.source}:${error.code ?? error.text.substring(0, 50)}`;
  }

  private cleanDedup(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.recentAlerts) {
      if (now - timestamp > DEDUP_WINDOW_MS * 2) {
        this.recentAlerts.delete(key);
      }
    }
  }
}

export default InspectionActionService;
