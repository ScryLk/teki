'use client';

import { useState } from 'react';
import { useDevTools } from '@/stores/dev-tools.store';
import type { CatState } from '@/stores/dev-tools.store';

interface EventButton {
  label: string;
  event: string;
}

interface EventCategory {
  icon: string;
  label: string;
  events: EventButton[];
}

const EVENT_CATEGORIES: EventCategory[] = [
  {
    icon: '\u{1F3AB}',
    label: 'Tickets',
    events: [
      { label: 'New ticket', event: 'new_ticket' },
      { label: 'New message', event: 'new_message' },
      { label: 'Ticket resolved', event: 'ticket_resolved' },
    ],
  },
  {
    icon: '\u{1F916}',
    label: 'AI',
    events: [
      { label: 'Streaming response', event: 'ai_streaming_response' },
      { label: 'Provider error', event: 'ai_error' },
      { label: 'Rate limit', event: 'rate_limit' },
      { label: 'Fallback provider', event: 'fallback_provider' },
    ],
  },
  {
    icon: '\u{1F510}',
    label: 'Security',
    events: [
      { label: 'Login failed (5x)', event: 'login_failed' },
    ],
  },
  {
    icon: '\u26A0\uFE0F',
    label: 'System',
    events: [
      { label: 'Error 500', event: 'error_500' },
      { label: 'Slow query', event: 'slow_query' },
      { label: 'AI cost alert', event: 'cost_alert' },
    ],
  },
  {
    icon: '\u{1F4AC}',
    label: 'Floating Assistant',
    events: [
      { label: 'New suggestion', event: 'new_suggestion' },
      { label: 'OCR result', event: 'ocr_result' },
      { label: 'Audio transcript', event: 'audio_transcript' },
    ],
  },
  {
    icon: '\u{1F4CA}',
    label: 'Plan',
    events: [
      { label: 'Limit: articles', event: 'limit_reached_articles' },
      { label: 'Limit: storage', event: 'limit_reached_storage' },
    ],
  },
];

const CAT_STATES: { state: CatState; icon: string; label: string }[] = [
  { state: 'idle', icon: '\u{1F63A}', label: 'idle' },
  { state: 'watching', icon: '\u{1F440}', label: 'watch' },
  { state: 'thinking', icon: '\u{1F914}', label: 'think' },
  { state: 'alert', icon: '\u{1F6A8}', label: 'alert' },
  { state: 'sleeping', icon: '\u{1F634}', label: 'sleep' },
  { state: 'happy', icon: '\u{1F638}', label: 'happy' },
];

export function EventsTab() {
  const [firing, setFiring] = useState<string | null>(null);
  const eventLog = useDevTools((s) => s.eventLog);
  const addEventLog = useDevTools((s) => s.addEventLog);
  const clearEventLog = useDevTools((s) => s.clearEventLog);
  const catStateOverride = useDevTools((s) => s.catStateOverride);
  const catStateLoop = useDevTools((s) => s.catStateLoop);
  const setCatState = useDevTools((s) => s.setCatState);
  const setCatStateLoop = useDevTools((s) => s.setCatStateLoop);
  const resetCatState = useDevTools((s) => s.resetCatState);

  const handleSimulate = async (event: string, label: string) => {
    setFiring(event);
    try {
      await fetch('/api/dev/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });

      addEventLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        category: event.split('_')[0],
        event,
        detail: label,
      });
    } finally {
      setFiring(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cat Mascot Controls */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">
          {'\u{1F431}'} Cat Mascot
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Real state:</span>
            <span className="text-zinc-300">watching</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Forced state:</span>
            <span className={catStateOverride ? 'text-amber-400' : 'text-zinc-600 italic'}>
              {catStateOverride ?? 'none'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {CAT_STATES.map((cat) => (
              <button
                key={cat.state}
                onClick={() => setCatState(cat.state)}
                className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                  catStateOverride === cat.state
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={catStateLoop}
                onChange={(e) => setCatStateLoop(e.target.checked)}
                className="accent-amber-500"
              />
              Loop
            </label>
            <button
              onClick={resetCatState}
              className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              {'\u23F9'} Reset to real state
            </button>
          </div>
        </div>
      </section>

      {/* Simulate Events */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Simulate Events</h3>
        {EVENT_CATEGORIES.map((cat) => (
          <div key={cat.label} className="mb-2 last:mb-0">
            <div className="mb-1 text-[11px] text-zinc-400">
              {cat.icon} {cat.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.events.map((evt) => (
                <button
                  key={evt.event}
                  onClick={() => handleSimulate(evt.event, evt.label)}
                  disabled={firing !== null}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {firing === evt.event ? '...' : evt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Event Log */}
      <section className="rounded border border-zinc-700 p-2.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-zinc-300">
            Event Log ({eventLog.length})
          </h3>
          {eventLog.length > 0 && (
            <button
              onClick={clearEventLog}
              className="text-[10px] text-zinc-600 hover:text-zinc-400"
            >
              Clear
            </button>
          )}
        </div>
        {eventLog.length === 0 ? (
          <p className="text-[10px] text-zinc-600 italic">
            No events triggered yet
          </p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {eventLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 text-[10px]"
              >
                <span className="text-zinc-600 shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-zinc-400">{entry.event}</span>
                <span className="text-zinc-600 truncate">{entry.detail}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
