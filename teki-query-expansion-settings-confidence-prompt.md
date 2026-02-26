# Teki — Query Expansion Settings + AI Confidence Score System

## Overview

Two interlinked features for the Teki platform:

1. **Query Expansion Settings UI** — Configuration section where tenant admins control the KB search expansion pipeline
2. **AI Confidence Score System** — Post-response scoring system quantifying how likely an AI solution resolves the problem (0-100%)

---

## Architecture

### Confidence Score Pipeline

```
User Query
    │
    ▼
┌─────────────────────┐
│  Query Expansion     │  ← Layer 0-3 progressive search
│  (query-expansion.ts)│
└────────┬────────────┘
         │ expansionResult
         ▼
┌─────────────────────┐
│  AI Provider Call    │  ← getProvider() → chat()
│  (chat route)        │
└────────┬────────────┘
         │ responseText
         ▼
┌─────────────────────┐
│  Confidence Scorer   │  ← 8 weighted signals
│  (confidence-scorer) │
└────────┬────────────┘
         │ ConfidenceResult
         ▼
┌─────────────────────┐
│  Classification      │
│  BASE LOCAL ≥80%     │
│  INFERIDO   ≥50%     │
│  GENÉRICO   <50%     │
└─────────────────────┘
```

### File Architecture

```
apps/web/src/
├── lib/kb/
│   ├── term-maps.ts          # 7-language term translation maps
│   ├── confidence-scorer.ts  # 8-signal confidence engine
│   ├── query-expansion.ts    # (updated) multi-language support
│   └── search.ts             # (existing) base KB search
├── app/
│   ├── api/v1/
│   │   ├── chat/route.ts     # (updated) confidence integration
│   │   └── settings/ai/route.ts  # GET/PATCH tenant AI settings
│   └── settings/
│       ├── layout.tsx         # Settings sidebar layout
│       └── ia-modelos/page.tsx # Busca Inteligente + Confiança
├── stores/
│   └── dev-tools.store.ts    # (updated) expansion + confidence state
└── components/dev/
    ├── DevToolsTabs.tsx       # (updated) +2 tabs
    ├── DevToolsPanel.tsx      # (updated) +2 cases
    └── tabs/
        ├── QueryExpansionTab.tsx  # KB Search debug tab
        └── ConfidenceTab.tsx      # Confidence score debug tab

apps/admin/src/
├── app/
│   ├── (admin)/
│   │   ├── analytics/page.tsx     # (updated) confidence section
│   │   └── query-expansion/page.tsx # Expansion analytics page
│   └── api/
│       ├── analytics/route.ts     # (updated) confidence data
│       └── query-expansion/route.ts # Expansion analytics API
└── components/layout/
    └── AdminSidebar.tsx           # (updated) +1 nav item
```

---

## Confidence Score — 8 Signals

| # | Signal | Weight | Source | Description |
|---|--------|--------|--------|-------------|
| 1 | KB Relevance | 25% | `expansionResult.finalBestScore` | Best similarity score from KB search |
| 2 | Source Coverage | 15% | Count of results ≥ 0.3 similarity | 0→0, 1→0.4, 2→0.7, 3+→1.0 |
| 3 | Historical Success | 15% | Neutral 0.5 (future: helpfulCount) | Article success rate placeholder |
| 4 | Specificity | 12% | Heuristic text analysis | Code blocks, error codes, steps, length |
| 5 | Context Match | 10% | KB presence + best score | 0.6 base + 0.4 if best > 0.7 |
| 6 | Solution Novelty | 8% | 1.0 default (future) | Not duplicating prior attempts |
| 7 | Recency | 8% | Neutral 0.5 (future) | Article freshness |
| 8 | Provider Reliability | 7% | 0.7 baseline (future) | Provider success rate |

### Adjustments

- **Expansion Bonus**: +5% if expansion found better results
- **Short Response Cap**: Cap at 40% if response < 50 chars
- **No KB Cap**: Cap at 50% if no KB results found

### Weight Presets

| Preset | KB Relevance | Specificity | Key Difference |
|--------|-------------|-------------|----------------|
| `default` | 25% | 12% | Balanced |
| `kb_heavy` | 35% | 10% | Favors local knowledge |
| `ai_heavy` | 15% | 25% | Favors AI response quality |

---

## Settings Storage

Settings are stored in `AiRoutingRules.typeRules` JSON field (per tenant):

```json
{
  "query_expansion": {
    "enabled": true,
    "primaryThreshold": 0.5,
    "maxLayers": 3,
    "fallbackLanguageConfigs": [
      { "code": "en", "enabled": true },
      { "code": "es", "enabled": false }
    ],
    "expansionModelId": "gemini-flash",
    "maxTotalTokens": 800
  },
  "confidence": {
    "weights": { "kbRelevance": 0.25, ... },
    "thresholds": { "baseLocal": 0.80, "inferido": 0.50 },
    "preset": "default"
  }
}
```

---

## Term Maps — 7 Languages

Multilingual technical term translation for Layer 2 expansion:

- **English** (en) — Most comprehensive, ~35 terms covering NFe, SEFAZ, certificates, etc.
- **Spanish** (es) — ~18 terms
- **German** (de) — ~20 terms, includes SAP-specific (IDoc, RFC, BAPI)
- **French** (fr) — ~17 terms
- **Japanese** (ja) — ~14 terms
- **Chinese** (zh) — ~14 terms
- **Korean** (ko) — ~14 terms

Smart filtering: `getRelevantTerms()` only includes terms relevant to the current query, with fallback to top 5 common terms.

---

## API Endpoints

### Settings API

```
GET  /api/v1/settings/ai          → Load tenant AI settings (merged with defaults)
PATCH /api/v1/settings/ai         → Save partial AI settings
```

### Admin Analytics

```
GET /api/query-expansion?days=30  → Expansion layer stats, daily distribution
GET /api/analytics?days=30        → (updated) includes confidenceDistribution, avgConfidence
```

---

## DevTools

### KB Search Tab
- Session stats: Layer resolution counts (L0-L3, Miss)
- Last search breakdown: query, resolved layer, metrics, layer details, top results

### Confidence Tab
- Score badge with classification (BASE LOCAL / INFERIDO / GENÉRICO)
- 8-signal bar breakdown with raw + weighted scores
- Adjustments list
- Positive/negative factor summary
