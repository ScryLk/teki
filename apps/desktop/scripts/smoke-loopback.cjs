// ─── Loopback capture smoke test ─────────────────────────────────────────────
// Verifies that system-audio loopback capture works on this platform with the
// PINNED Electron version. Run with:  pnpm --filter @teki/desktop smoke:loopback
//
// Why this exists: getDisplayMedia loopback has a history of regressions
// between Electron majors (e.g. it broke in the 40.x series). The Electron
// version in package.json is pinned EXACTLY for this reason — bump it only
// after this smoke test passes on macOS, Windows and Linux.
//
// Exit code 0 = an audio track was obtained from loopback; 1 = failure.

const { app, BrowserWindow, ipcMain } = require('electron');
const { initMain } = require('electron-audio-loopback');

const TIMEOUT_MS = 15000;

initMain();

const PAGE = `data:text/html,<script>
  const { ipcRenderer } = require('electron');
  (async () => {
    try {
      await ipcRenderer.invoke('enable-loopback-audio');
      // getDisplayMedia requires video: true; we discard the video track.
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      stream.getVideoTracks().forEach((t) => { t.stop(); stream.removeTrack(t); });
      await ipcRenderer.invoke('disable-loopback-audio');
      const audioTracks = stream.getAudioTracks();
      ipcRenderer.send('smoke-result', {
        ok: audioTracks.length > 0,
        tracks: audioTracks.length,
        label: audioTracks[0] ? audioTracks[0].label : null,
      });
    } catch (err) {
      ipcRenderer.send('smoke-result', { ok: false, error: String(err) });
    }
  })();
</script>`;

app.whenReady().then(() => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      // Smoke test only: node access in the page keeps this self-contained.
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const timeout = setTimeout(() => {
    console.error(`[smoke-loopback] FAIL (${process.platform}): timeout after ${TIMEOUT_MS}ms`);
    app.exit(1);
  }, TIMEOUT_MS);

  ipcMain.on('smoke-result', (_event, result) => {
    clearTimeout(timeout);
    if (result.ok) {
      console.log(
        `[smoke-loopback] OK (${process.platform}): ${result.tracks} audio track(s)` +
          (result.label ? ` — "${result.label}"` : '')
      );
      app.exit(0);
    } else {
      console.error(`[smoke-loopback] FAIL (${process.platform}):`, result.error ?? 'no audio track');
      app.exit(1);
    }
  });

  win.loadURL(PAGE);
});
