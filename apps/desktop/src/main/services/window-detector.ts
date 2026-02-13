import { exec } from 'child_process';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { ActiveWindowInfo } from '@teki/shared';

const POLL_INTERVAL = 2000;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastWindowTitle = '';

function getActiveWindowLinux(): Promise<ActiveWindowInfo> {
  return new Promise((resolve) => {
    exec('xdotool getactivewindow getwindowname', (err, title) => {
      if (err) {
        resolve({ title: '', processName: '' });
        return;
      }

      const windowTitle = title.trim();

      exec(
        'xdotool getactivewindow getwindowpid | xargs -I{} ps -p {} -o comm=',
        (pidErr, processName) => {
          resolve({
            title: windowTitle,
            processName: pidErr ? '' : processName.trim(),
          });
        }
      );
    });
  });
}

function getActiveWindowMac(): Promise<ActiveWindowInfo> {
  return new Promise((resolve) => {
    const script = `
      tell application "System Events"
        set frontApp to name of first application process whose frontmost is true
        set frontAppName to name of first application process whose frontmost is true
      end tell
      tell application frontApp
        if (count of windows) > 0 then
          set windowTitle to name of front window
        else
          set windowTitle to ""
        end if
      end tell
      return frontAppName & "|||" & windowTitle
    `;

    exec(`osascript -e '${script}'`, (err, stdout) => {
      if (err) {
        resolve({ title: '', processName: '' });
        return;
      }

      const parts = stdout.trim().split('|||');
      resolve({
        title: parts[1] || '',
        processName: parts[0] || '',
      });
    });
  });
}

function getActiveWindowWindows(): Promise<ActiveWindowInfo> {
  return new Promise((resolve) => {
    const script = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Text;
        public class Win32 {
          [DllImport("user32.dll")]
          public static extern IntPtr GetForegroundWindow();
          [DllImport("user32.dll")]
          public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
          [DllImport("user32.dll")]
          public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
        }
"@
      $hwnd = [Win32]::GetForegroundWindow()
      $sb = New-Object System.Text.StringBuilder 256
      [Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null
      $title = $sb.ToString()
      $pid = 0
      [Win32]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
      $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
      $procName = if ($proc) { $proc.ProcessName } else { "" }
      Write-Output "$procName|||$title"
    `;

    exec(
      `powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`,
      (err, stdout) => {
        if (err) {
          resolve({ title: '', processName: '' });
          return;
        }

        const parts = stdout.trim().split('|||');
        resolve({
          title: parts[1] || '',
          processName: parts[0] || '',
        });
      }
    );
  });
}

async function getActiveWindow(): Promise<ActiveWindowInfo> {
  switch (process.platform) {
    case 'linux':
      return getActiveWindowLinux();
    case 'darwin':
      return getActiveWindowMac();
    case 'win32':
      return getActiveWindowWindows();
    default:
      return { title: '', processName: '' };
  }
}

export function startPolling(mainWindow: BrowserWindow): void {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(async () => {
    try {
      const info = await getActiveWindow();

      // Only send update if the window title changed
      if (info.title !== lastWindowTitle) {
        lastWindowTitle = info.title;

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC_CHANNELS.WINDOW_ACTIVE, info);
        }
      }
    } catch {
      // Silently ignore detection errors
    }
  }, POLL_INTERVAL);
}

export function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  lastWindowTitle = '';
}

export { getActiveWindow };

export default { startPolling, stopPolling, getActiveWindow };
