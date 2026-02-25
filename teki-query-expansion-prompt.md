# Teki — Query Expansion Fallback (Busca Inteligente Progressiva)

## Contexto e Motivação

Este módulo estende o pipeline de busca na KB do Teki. Atualmente a busca semântica (embedding similarity) é executada uma única vez usando os termos originais do técnico. Quando a relevância dos resultados é baixa, a IA recebe pouco contexto e entrega uma resposta genérica — exatamente quando o técnico mais precisa de ajuda.

**O problema real:** Um técnico digita "erro 656 SEFAZ" e a KB tem um artigo intitulado "Timeout na transmissão de NFe para webservice estadual". Os termos não batem, o embedding retorna score baixo, e a IA perde a melhor fonte de informação.

**A solução:** Gastar mais tokens apenas quando a busca primária falha, ativando camadas progressivas de expansão de query. A cada camada que encontra resultado satisfatório, o pipeline para imediatamente — sem desperdício.

**PRINCÍPIO FUNDAMENTAL:**

```
Busca primária (PT) → relevância ≥ 0.5?
  SIM → usa os resultados, custo extra = ZERO
  NÃO → ativa expansão progressiva, gasta tokens proporcionais à dificuldade

Resultado esperado:
  ~75% das buscas resolvem no Layer 0 (custo zero)
  ~15% resolvem no Layer 1 (~200 tokens extras)
  ~7% resolvem no Layer 2 (~350 tokens extras)
  ~2% resolvem no Layer 3 (~650 tokens extras)
  ~1% não resolvem → IA responde como [INFERIDO] sem contexto KB
```

### Leia antes de implementar

- `apps/web/src/lib/kb/search.ts` — busca semântica por embedding (cosine similarity)
- `apps/web/src/lib/ai/router.ts` — provider router para gerar expansões
- `apps/web/src/lib/kb/ai-assistant.ts` — padrão de chamada a IA com provider abstraction
- `apps/web/src/app/api/v1/chat/route.ts` — pipeline de chat com RAG via KB

---

## 1. Arquitetura do Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  QUERY ORIGINAL: "Erro 656 SEFAZ ao transmitir NFe"                    │
│                                                                         │
│  ┌─── LAYER 0: Busca Primária (sempre roda, custo zero) ────────────┐  │
│  │                                                                    │  │
│  │  1. Embedding search (cosine similarity) via searchKnowledgeBase  │  │
│  │  2. Filtra por minSimilarity reduzido (0.3 vs 0.7 padrão)        │  │
│  │  3. Retorna top K resultados com score de similaridade            │  │
│  │                                                                    │  │
│  │  → best_score = max(resultados)                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  best_score ≥ 0.5? ───YES──→ ✅ RETORNA. Custo extra: 0 tokens.        │
│       │                                                                 │
│       NO (score baixo — busca primária insuficiente)                    │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─── LAYER 1: Expansão Semântica (mesmo idioma) ───────────────────┐  │
│  │                                                                    │  │
│  │  IA leve (Flash/Haiku) gera 3-5 reformulações em PT:              │  │
│  │                                                                    │  │
│  │  • "rejeição 656 nota fiscal eletrônica"                           │  │
│  │  • "timeout SEFAZ webservice transmissão"                          │  │
│  │  • "cStat 656 retorno autorização NFe"                             │  │
│  │  • "falha comunicação secretaria fazenda código 656"               │  │
│  │                                                                    │  │
│  │  → Busca embedding para CADA variação (em paralelo)                │  │
│  │  → Deduplica e pega melhores scores                                │  │
│  │  → Custo: ~200 tokens                                              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  best_score ≥ 0.5? ───YES──→ ✅ RETORNA.                                │
│       │                                                                 │
│       NO                                                                │
│       ▼                                                                 │
│  ┌─── LAYER 2: Tradução Técnica (PT → EN) ──────────────────────────┐  │
│  │                                                                    │  │
│  │  IA traduz termos técnicos mantendo contexto brasileiro:           │  │
│  │                                                                    │  │
│  │  • "SEFAZ rejection 656 NFe transmission timeout"                  │  │
│  │  • "Brazilian tax authority electronic invoice error 656"          │  │
│  │  • "digital certificate webservice connection refused"             │  │
│  │                                                                    │  │
│  │  → Útil porque muitos artigos KB usam termos mistos (PT+EN)        │  │
│  │  → E documentações oficiais de APIs são em EN                      │  │
│  │  → Custo: ~150 tokens                                              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  best_score ≥ 0.5? ───YES──→ ✅ RETORNA.                                │
│       │                                                                 │
│       NO                                                                │
│       ▼                                                                 │
│  ┌─── LAYER 3: Decomposição de Conceito ────────────────────────────┐  │
│  │                                                                    │  │
│  │  IA quebra o problema em sub-problemas independentes:              │  │
│  │                                                                    │  │
│  │  • "timeout webservice SEFAZ"         (rede/conectividade)         │  │
│  │  • "certificado A1 expirado"          (autenticação)               │  │
│  │  • "firewall porta 443 SEFAZ RS"      (infraestrutura)             │  │
│  │  • "xml NFe schema validação"         (formato/dados)              │  │
│  │  • "connection refused 443"           (EN genérico)                │  │
│  │                                                                    │  │
│  │  → Busca com threshold relaxado (0.25 vs 0.3)                     │  │
│  │  → Combina artigos de ângulos diferentes                           │  │
│  │  → Custo: ~300 tokens                                              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  best_score ≥ 0.4? ───YES──→ ✅ RETORNA (threshold menor, last resort). │
│       │                                                                 │
│       NO                                                                │
│       ▼                                                                 │
│  ❌ SEM MATCH KB. IA responde com conhecimento geral.                   │
│     Resposta marcada como [INFERIDO] ou [GENÉRICO].                     │
│     Log registra: query não resolvida → candidata a novo artigo KB.     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tabela de Custo por Layer

| Layer | Nome | Quando roda | Tokens extras | Latência extra | Threshold para aceitar |
|-------|------|-------------|---------------|----------------|----------------------|
| 0 | Busca Primária | Sempre | 0 | 0ms | ≥ 0.5 |
| 1 | Expansão Semântica (PT) | L0 score < 0.5 | ~200 | ~400-600ms | ≥ 0.5 |
| 2 | Tradução Técnica (EN) | L1 score < 0.5 | ~150 | ~300-500ms | ≥ 0.5 |
| 3 | Decomposição de Conceito | L2 score < 0.5 | ~300 | ~500-700ms | ≥ 0.4 (relaxado) |

**Custo máximo (pior caso, todas as layers):** ~650 tokens ≈ $0.001 USD com modelo leve.
**Budget cap:** 800 tokens por pipeline. Se atingir antes do Layer 3, para.

**Por que o Layer 3 tem threshold relaxado (0.4)?** Porque nesse ponto já esgotamos as opções. Artigos com score 0.4 são parcialmente relevantes — melhor do que nada. A IA recebe o artigo com nota de que é "parcialmente relacionado" e decide se usa ou não.

---

## 3. Interfaces TypeScript

**Arquivo:** `apps/web/src/lib/kb/query-expansion.ts`

```typescript
/** Resultado individual de um artigo KB encontrado */
interface KBSearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  filename: string;
  matchSource: 'primary' | 'expansion_pt' | 'translation_en' | 'decomposition';
  matchedQuery: string;
}

/** Resultado de uma layer individual de expansão */
interface ExpansionLayerResult {
  layer: 0 | 1 | 2 | 3;
  layerName: string;
  queriesUsed: string[];
  results: KBSearchResult[];
  bestScore: number;
  tokensUsed: number;
  latencyMs: number;
  accepted: boolean;
}

/** Resultado final do pipeline completo */
interface QueryExpansionResult {
  originalQuery: string;
  finalResults: KBSearchResult[];
  finalBestScore: number;
  layers: ExpansionLayerResult[];
  resolvedAtLayer: number;        // 0-3 = qual layer resolveu, -1 = nenhuma
  fallbackActivated: boolean;
  totalTokensUsed: number;
  totalLatencyMs: number;
  budgetRemaining: number;
}
```

---

## 4. Configuração

```typescript
interface QueryExpansionConfig {
  enabled: boolean;                    // liga/desliga expansão (Layer 0 sempre roda)

  // Thresholds
  primaryThreshold: number;            // score mínimo para aceitar Layer 0 (default: 0.5)
  fallbackThreshold: number;           // score mínimo para Layers 1 e 2 (default: 0.5)
  lastResortThreshold: number;         // score mínimo para Layer 3 (default: 0.4)

  // Limites
  maxLayers: 1 | 2 | 3;               // quantas layers de fallback permitir
  maxVariationsPerLayer: number;       // queries geradas por layer (default: 5)
  maxTotalTokens: number;             // budget de tokens para expansão (default: 800)
  maxTotalLatencyMs: number;          // timeout geral do pipeline (default: 5000)

  // Provider para expansão
  expansionModelId: string;           // modelo LEVE (default: 'gemini-flash')

  // Idiomas
  primaryLanguage: string;            // 'pt' — idioma do Layer 0 e 1
  fallbackLanguages: string[];        // ['en'] — idiomas do Layer 2

  // Observabilidade
  logExpansions: boolean;             // registrar cada layer no console
}
```

**Defaults:**

```typescript
const DEFAULT_EXPANSION_CONFIG: QueryExpansionConfig = {
  enabled: true,
  primaryThreshold: 0.5,
  fallbackThreshold: 0.5,
  lastResortThreshold: 0.4,
  maxLayers: 3,
  maxVariationsPerLayer: 5,
  maxTotalTokens: 800,
  maxTotalLatencyMs: 5000,
  expansionModelId: 'gemini-flash',
  primaryLanguage: 'pt',
  fallbackLanguages: ['en'],
  logExpansions: true,
};
```

**Screen Inspection override (latência crítica):**

```typescript
const SCREEN_INSPECTION_EXPANSION_CONFIG: Partial<QueryExpansionConfig> = {
  maxLayers: 1,
  maxTotalLatencyMs: 800,
  maxVariationsPerLayer: 3,
};
```

---

## 5. Implementação

**Localização:** `apps/web/src/lib/kb/query-expansion.ts`

A função principal `searchWithExpansion()` substitui chamadas diretas a `searchKnowledgeBase()`:

```typescript
// ANTES (busca simples):
const results = await searchKnowledgeBase(agent.id, query);
const kbContext = formatKBContext(results);

// DEPOIS (busca com expansão):
const expansionResult = await searchWithExpansion({ agentId: agent.id, query });
const kbContext = formatExpansionContext(expansionResult);
```

### Fluxo interno

1. **Layer 0** — Chama `searchKnowledgeBase()` diretamente (custo zero)
2. Se score < threshold, **Layer 1** — Gera reformulações em PT via modelo leve, busca cada uma em paralelo
3. Se score < threshold, **Layer 2** — Traduz para EN e busca novamente
4. Se score < threshold, **Layer 3** — Decompõe em sub-problemas e busca com threshold relaxado
5. A cada layer, deduplica resultados e mantém os melhores scores

### Deduplicação cross-layer

Resultados são indexados por `chunkId`. Se o mesmo chunk aparece em múltiplas queries/layers, o maior score é mantido. O resultado final são os top 5 chunks com melhor score global.

### Budget control

Antes de cada layer, verifica:
- `totalTokens < maxTotalTokens` (800)
- `elapsed < maxTotalLatencyMs` (5000ms)

Se qualquer limite for atingido, o pipeline para e retorna o melhor resultado disponível.

---

## 6. Integração nos Pipelines Existentes

### 6.1 Chat com IA (api/v1/chat)

No arquivo `apps/web/src/app/api/v1/chat/route.ts`, a busca KB (step 6) é substituída:

```typescript
// ANTES:
const results = await searchKnowledgeBase(agent.id, lastUserMsg.content);
kbContext = formatKBContext(results);

// DEPOIS:
import { searchWithExpansion, formatExpansionContext, buildExpansionMetadata } from '@/lib/kb/query-expansion';

const expansionResult = await searchWithExpansion({
  agentId: agent.id,
  query: lastUserMsg.content,
});
kbContext = formatExpansionContext(expansionResult);

// Salvar metadados de expansão junto com a mensagem do assistente
const expansionMeta = buildExpansionMetadata(expansionResult);
```

### 6.2 Screen Inspection (futuro)

Quando integrado, usar config override com latência apertada:

```typescript
const result = await searchWithExpansion(
  { agentId, query },
  SCREEN_INSPECTION_EXPANSION_CONFIG,
);
```

### 6.3 Floating Assistant (futuro)

Mesma substituição que o chat, sem config override.

---

## 7. Registro nos Metadados da IA

Quando a expansão é usada, salvar no campo de metadados da mensagem:

```typescript
interface ExpansionMetadata {
  activated: boolean;
  resolvedAtLayer: number;
  layersExecuted: number;
  expansionTokens: number;
  expansionLatencyMs: number;
  queriesGenerated: string[];
  improvement: {
    l0BestScore: number;
    finalBestScore: number;
    scoreDelta: number;
  };
}

// Exemplo de valor salvo:
{
  "activated": true,
  "resolvedAtLayer": 1,
  "layersExecuted": 2,
  "expansionTokens": 187,
  "expansionLatencyMs": 520,
  "queriesGenerated": [
    "rejeição 656 nota fiscal eletrônica",
    "timeout SEFAZ webservice transmissão",
    "cStat 656 retorno autorização NFe"
  ],
  "improvement": {
    "l0BestScore": 0.32,
    "finalBestScore": 0.78,
    "scoreDelta": 0.46
  }
}
```

---

## 8. DevTools — Tab Query Expansion

Adicionar seção no DevTools para debug de expansão:

```
┌─ DevTools > Query Expansion ─────────────────────────────────────┐
│                                                                   │
│  Status: ● Habilitado   Provider: Gemini Flash   Budget: 800 tok │
│  Thresholds: L0≥0.5  L1-2≥0.5  L3≥0.4                          │
│                                                                   │
│  ── Última Busca ──                                              │
│  Query: "erro 656 SEFAZ ao transmitir NFe"                       │
│  Resolvido no: Layer 1 (Expansão Semântica)                      │
│                                                                   │
│  Layer 0: score 0.32   (3 resultados)    0 tok    12ms           │
│  Layer 1: score 0.78   (4 resultados)  187 tok   520ms           │
│    ├─ "rejeição 656 nota fiscal eletrônica"      → 0.78          │
│    ├─ "timeout SEFAZ webservice transmissão"     → 0.61          │
│    └─ "cStat 656 retorno autorização NFe"        → 0.55          │
│  Layer 2: não executado (L1 resolveu)                            │
│  Layer 3: não executado                                          │
│                                                                   │
│  Total: 187 tokens · 532ms · Melhoria: +0.46                    │
│                                                                   │
│  ── Estatísticas (sessão) ──                                     │
│  Buscas: 47  |  L0 resolveu: 35 (74%)  |  L1: 8 (17%)          │
│  L2: 3 (6%)  |  L3: 0 (0%)  |  Sem match: 1 (2%)               │
│  Tokens gastos em expansão: 2.340  |  Custo: ~$0.004             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 9. Analytics no Admin Panel

Métricas de expansão no painel admin:

```
┌─ Admin > Analytics > Query Expansion ────────────────────────────┐
│                                                                   │
│  Período: [Últimos 30 dias]                                      │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 74.3%    │  │ 15.2%    │  │ 8.1%     │  │ 2.4%     │       │
│  │ L0 (PT)  │  │ L1 (Exp) │  │ L2 (EN)  │  │ L3 (Dec) │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
│  Melhoria média de score: +0.38                                  │
│  Tokens gastos em expansão (mês): 12.450 (~$0.02)               │
│  Queries sem match total: 1.1%                                   │
│                                                                   │
│  Insight automático:                                             │
│  "23 queries resolveram só no Layer 2 (EN). Considere adicionar  │
│   termos em inglês nos artigos KB mais acessados."               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Insight automático** — o sistema detecta padrões:
- Muitos Layer 2 (EN) → sugerir ao admin adicionar termos em inglês nos artigos
- Muitos Layer 3 → KB tem lacunas, sugerir criação de artigos
- Score delta grande (> 0.4) → a reformulação fez muita diferença, talvez os artigos precisem de mais sinônimos nas tags

---

## 10. Integração com Feedback Loop

Quando um feedback negativo é registrado, verificar se a expansão foi ativada:

```typescript
async function onNegativeFeedback(messageId: string, feedback: MessageFeedback) {
  const aiMetadata = await getAIMetadata(messageId);

  if (aiMetadata.kb_expansion?.activated) {
    // A expansão foi ativada mas a resposta ainda foi ruim
    // → Forte candidato a lacuna na KB
    await createKBGapSuggestion({
      original_query: aiMetadata.kb_expansion.queriesGenerated[0],
      expansion_queries: aiMetadata.kb_expansion.queriesGenerated,
      best_score_achieved: aiMetadata.kb_expansion.improvement.finalBestScore,
      feedback_comment: feedback.comment,
      corrected_answer: feedback.corrected_content,
      suggestion: 'Criar novo artigo KB cobrindo este cenário',
      priority: aiMetadata.kb_expansion.resolvedAtLayer === -1 ? 'high' : 'medium',
    });
  }
}
```

---

## 11. Ordem de Implementação

### FASE 1 — Core do Pipeline (sem IA, sem expansão) ✅

1. Interface `QueryExpansionConfig` com defaults
2. Interface `QueryExpansionResult` e tipos auxiliares
3. `searchWithExpansion()` — apenas Layer 0 (wrapper direto da busca existente)
4. Testes: comportamento idêntico à busca original quando expansão desabilitada
5. Substituir chamada no chat route pelo expansion service

### FASE 2 — Layer 1: Expansão Semântica ✅

6. Prompt de expansão semântica (PT)
7. `parseQueryList` — parser robusto da resposta da IA
8. `searchMultipleQueries` — busca paralela + deduplicação
9. Budget check (tokens + latência)
10. Testes: query com score baixo ativa Layer 1, score alto não ativa

### FASE 3 — Layer 2: Tradução Técnica ✅

11. Prompt de tradução técnica (PT → EN)
12. Mapa de termos brasileiros → inglês no prompt
13. Testes: query sobre SEFAZ gera termos como "tax authority", "e-invoice"

### FASE 4 — Layer 3: Decomposição ✅

14. Prompt de decomposição multi-ângulo
15. Busca com threshold relaxado
16. Testes: query complexa decomposta em sub-problemas relevantes

### FASE 5 — Integração ✅

17. Plugar no pipeline de chat (api/v1/chat)
18. Salvar expansion info nos metadados da mensagem
19. `formatExpansionContext()` — formata resultados com notas de confiança

### FASE 6 — Observabilidade (futuro)

20. Tab Query Expansion no DevTools
21. Métricas no Admin Panel (analytics)
22. Integração com feedback loop (KB gap detection)

### FASE 7 — Refinamento (futuro)

23. A/B testing: medir impacto na taxa de resolução
24. Tuning de thresholds baseado em dados reais
25. Cache de expansões: se mesma query já foi expandida recentemente, reusar
26. Insights automáticos no admin panel
