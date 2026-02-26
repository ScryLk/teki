# 📡 API Reference

> Overview da API pública do Teki. Este documento cobre os endpoints mais usados. A documentação completa (OpenAPI/Swagger) estará disponível em breve.

## Base URL

```
Produção:  https://teki.vercel.app/api/v1
Local:     http://localhost:3000/api/v1
```

## Autenticação

Todas as requisições autenticadas usam Bearer token no header `Authorization`:

```http
Authorization: Bearer tk_live_abc123def456...
```

### Tipos de Token

| Prefixo | Ambiente | Uso |
|---------|----------|-----|
| `tk_live_` | Produção | Operações reais |
| `tk_test_` | Teste | Sandbox, sem efeitos colaterais |

### Obter um Token

Tokens são gerados na página de configurações do tenant ou via API de sessão (NextAuth).

## Rate Limits

| Plano | Limite | Janela |
|-------|--------|--------|
| Free | 100 req | 1 minuto |
| Starter | 300 req | 1 minuto |
| Pro | 1000 req | 1 minuto |
| Enterprise | Customizável | — |

Headers de resposta incluem informações de rate limit:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1706900000
```

## Endpoints Principais

### Chat

#### POST /chat

Envia uma mensagem para o agente de IA e recebe a resposta.

**Request:**
```json
{
  "conversationId": "uuid-opcional",
  "agentId": "uuid-do-agente",
  "messages": [
    {
      "role": "user",
      "content": "NFe rejeição 656, o que fazer?"
    }
  ],
  "modelId": "gemini-flash",
  "stream": false
}
```

**Response (200):**
```json
{
  "content": "A rejeição 656 indica consumo indevido. Verifique se o CNPJ está habilitado...",
  "model": "gemini-flash",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "usage": {
    "inputTokens": 450,
    "outputTokens": 230
  },
  "confidence": {
    "percentage": 73,
    "label": "[INFERIDO]",
    "classification": "INFERIDO"
  }
}
```

**Headers de resposta:**
```http
X-Teki-Model: gemini-flash
```

---

### Conversas

#### GET /conversations

Lista conversas do usuário autenticado.

**Query params:**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `limit` | number | 20 | Itens por página (máx. 100) |
| `offset` | number | 0 | Offset para paginação |
| `type` | string | — | Filtrar por tipo (chat, screen_inspection, floating) |
| `status` | string | — | Filtrar por status (active, archived) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "NFe rejeição 656",
      "type": "CHAT",
      "status": "ACTIVE",
      "messageCount": 4,
      "createdAt": "2025-01-15T14:30:00Z",
      "updatedAt": "2025-01-15T14:35:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### Base de Conhecimento

#### GET /kb/search

Busca artigos na base de conhecimento por similaridade semântica.

**Query params:**
| Param | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `q` | string | — | Query de busca (obrigatório) |
| `agentId` | string | — | ID do agente (obrigatório) |
| `topK` | number | 5 | Número de resultados |
| `minSimilarity` | number | 0.3 | Similaridade mínima (0-1) |

**Response (200):**
```json
{
  "results": [
    {
      "chunkId": "chunk-uuid",
      "documentId": "doc-uuid",
      "content": "Para resolver a rejeição 656, verifique...",
      "similarity": 0.87,
      "filename": "procedimento-nfe-rejeicoes.pdf"
    }
  ],
  "query": "NFe rejeição 656",
  "totalResults": 3
}
```

---

### Settings

#### GET /settings/ai

Retorna as configurações de IA do tenant (query expansion + confidence).

**Response (200):**
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
    "weights": {
      "kbRelevance": 0.25,
      "sourceCoverage": 0.15,
      "historicalSuccess": 0.15,
      "specificity": 0.12,
      "contextMatch": 0.10,
      "solutionNovelty": 0.08,
      "recency": 0.08,
      "providerReliability": 0.07
    },
    "thresholds": {
      "baseLocal": 0.80,
      "inferido": 0.50
    },
    "preset": "default"
  }
}
```

#### PATCH /settings/ai

Atualiza parcialmente as configurações de IA. Envie apenas os campos que deseja alterar.

**Request:**
```json
{
  "query_expansion": {
    "maxLayers": 2,
    "primaryThreshold": 0.6
  }
}
```

**Response (200):**
```json
{
  "ok": true
}
```

## Erros

Todas as respostas de erro seguem o formato:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Nao autenticado. Envie um header Authorization: Bearer tk_live_..."
  }
}
```

### Códigos de Erro

| HTTP | Code | Descrição |
|------|------|-----------|
| 400 | `BAD_REQUEST` | Parâmetros inválidos |
| 401 | `UNAUTHORIZED` | Token ausente ou inválido |
| 403 | `FORBIDDEN` | Sem permissão para o recurso |
| 404 | `NOT_FOUND` | Recurso não encontrado |
| 429 | `RATE_LIMITED` | Limite de requisições excedido |
| 500 | `INTERNAL_ERROR` | Erro interno do servidor |

## SDKs

SDKs oficiais estão em desenvolvimento:

- [ ] JavaScript/TypeScript (npm)
- [ ] Python (pip)
- [ ] cURL examples collection

---

📚 **Próximos:** [Arquitetura](ARCHITECTURE.md) · [Segurança](SECURITY.md) · [Planos](PLANS.md)
