let watchStartTime: number | null = null;

export function startWatchTimer(): void {
  watchStartTime = Date.now();
}

export function stopWatchTimer(): string {
  const elapsed = watchStartTime ? Date.now() - watchStartTime : 0;
  watchStartTime = null;
  return formatDuration(elapsed);
}

export function getElapsed(): string {
  if (!watchStartTime) return '0s';
  return formatDuration(Date.now() - watchStartTime);
}

export function isTimerRunning(): boolean {
  return watchStartTime !== null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min ${seconds}s`;
  return `${seconds}s`;
}
