'use client';

import { useState } from 'react';

type GenerateType = 'kb_article' | 'ticket' | 'log' | 'user' | 'ai_log' | 'session';

interface GenerateSection {
  icon: string;
  label: string;
  type: GenerateType;
  counts: number[];
  options?: { label: string; key: string; values: string[] }[];
}

const SECTIONS: GenerateSection[] = [
  {
    icon: '\u{1F4DA}',
    label: 'Knowledge Base',
    type: 'kb_article',
    counts: [1, 10, 100],
    options: [
      {
        label: 'Category',
        key: 'category',
        values: ['Random', 'Fiscal', 'Installation', 'Printing', 'Database', 'Network'],
      },
      {
        label: 'Status',
        key: 'status',
        values: ['Published', 'Draft', 'Archived'],
      },
    ],
  },
  {
    icon: '\u{1F3AB}',
    label: 'Tickets',
    type: 'ticket',
    counts: [1, 10, 50],
    options: [
      {
        label: 'Status',
        key: 'status',
        values: ['Random', 'Open', 'In Progress', 'Resolved', 'Closed'],
      },
    ],
  },
  {
    icon: '\u{1F4CB}',
    label: 'Logs',
    type: 'log',
    counts: [1, 50, 500],
    options: [
      {
        label: 'Category',
        key: 'category',
        values: ['All', 'Audit', 'AI', 'Security', 'System'],
      },
    ],
  },
  {
    icon: '\u{1F464}',
    label: 'Users',
    type: 'user',
    counts: [1, 5],
    options: [
      {
        label: 'Role',
        key: 'role',
        values: ['Agent', 'Admin', 'Viewer'],
      },
    ],
  },
  {
    icon: '\u{1F916}',
    label: 'AI Interactions',
    type: 'ai_log',
    counts: [1, 20],
    options: [
      {
        label: 'Provider',
        key: 'provider',
        values: ['Anthropic', 'Google', 'OpenAI'],
      },
      {
        label: 'Status',
        key: 'status',
        values: ['Success', 'Error'],
      },
    ],
  },
];

const SEED_SCENARIOS = [
  { id: 'empty', label: 'empty', icon: '\u{1F4ED}' },
  { id: 'basic', label: 'basic', icon: '\u{1F4E6}' },
  { id: 'full', label: 'full', icon: '\u{1F4CA}' },
  { id: 'limit', label: 'limit', icon: '\u{1F534}' },
];

export function DataTab() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [optionSelections, setOptionSelections] = useState<
    Record<string, Record<string, string>>
  >({});

  const handleGenerate = async (type: GenerateType, count: number) => {
    setGenerating(`${type}-${count}`);
    try {
      const options = optionSelections[type] ?? {};
      await fetch('/api/dev/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, count, options }),
      });
    } finally {
      setGenerating(null);
    }
  };

  const handleSeed = async (scenario: string, reset = false) => {
    setGenerating(`seed-${scenario}`);
    try {
      await fetch('/api/dev/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, reset }),
      });
    } finally {
      setGenerating(null);
    }
  };

  const setOption = (type: string, key: string, value: string) => {
    setOptionSelections((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Quick Generate */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Quick Generate</h3>

        {SECTIONS.map((section) => (
          <div key={section.type} className="mb-3 last:mb-0">
            <div className="mb-1 text-[11px] text-zinc-400">
              {section.icon} {section.label}
            </div>
            <div className="flex items-center gap-1 mb-1">
              {section.counts.map((count) => (
                <button
                  key={count}
                  onClick={() => handleGenerate(section.type, count)}
                  disabled={generating !== null}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {generating === `${section.type}-${count}`
                    ? '...'
                    : `+ ${count}`}
                </button>
              ))}
            </div>
            {section.options && (
              <div className="flex flex-wrap gap-2">
                {section.options.map((opt) => (
                  <div key={opt.key} className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-600">
                      {opt.label}:
                    </span>
                    <select
                      value={optionSelections[section.type]?.[opt.key] ?? opt.values[0]}
                      onChange={(e) =>
                        setOption(section.type, opt.key, e.target.value)
                      }
                      className="rounded bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-400 border border-zinc-700"
                    >
                      {opt.values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Full Seed */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Full Seed</h3>
        <div className="flex flex-wrap gap-1 mb-2">
          <button
            onClick={() => handleSeed('', true)}
            disabled={generating !== null}
            className="rounded bg-red-900/30 px-2 py-1 text-[10px] text-red-400 hover:bg-red-900/50 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            Reset DB
          </button>
          {SEED_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSeed(s.id)}
              disabled={generating !== null}
              className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-50 transition-colors"
            >
              {generating === `seed-${s.id}` ? '...' : `${s.icon} ${s.label}`}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-zinc-600">
          Reset deletes ALL data in the local database
        </p>
      </section>
    </div>
  );
}
