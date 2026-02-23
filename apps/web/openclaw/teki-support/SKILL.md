---
name: teki-support
description: "Conecta ao Teki, assistente de suporte técnico com IA. Encaminha perguntas técnicas e retorna soluções baseadas em base de conhecimento e visão computacional."
version: 1.0.0
author: teki
metadata:
  openclaw:
    emoji: "🐱"
    bins: []
    env:
      - TEKI_API_URL
      - TEKI_WEBHOOK_SECRET
---

# Teki Support Skill

Conecta o OpenClaw ao Teki — assistente de suporte técnico com IA que pode:
- Analisar screenshots de erros enviados pelo usuário
- Consultar bases de conhecimento internas (documentos PDF/DOCX indexados)
- Manter histórico de conversa por sessão
- Responder via WhatsApp, Telegram, Discord, Slack e outros canais

## Quando usar

- Quando o usuário reportar problemas técnicos de TI
- Quando o usuário enviar screenshots de erros ou telas
- Quando o usuário perguntar sobre configurações de software/hardware
- Quando o usuário mencionar `@teki` ou pedir "suporte técnico"
- Quando o usuário enviar `TEKI XXXXXX` (código de vinculação de conta)

## Enviar mensagem de texto

```bash
curl -X POST "$TEKI_API_URL/api/openclaw/webhook" \
  -H "Authorization: Bearer $TEKI_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "<mensagem do usuário>",
    "sender": "<identificador único do remetente>",
    "senderName": "<nome do remetente>",
    "channel": "<whatsapp|telegram|discord|slack|signal>",
    "sessionKey": "<chave de sessão — ex: whatsapp:+5555999887766>"
  }'
```

## Enviar mensagem com imagem

```bash
curl -X POST "$TEKI_API_URL/api/openclaw/webhook" \
  -H "Authorization: Bearer $TEKI_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "o que esse erro significa?",
    "sender": "telegram:123456789",
    "senderName": "Lucas",
    "channel": "telegram",
    "sessionKey": "telegram:123456789",
    "media": {
      "type": "image",
      "base64": "<base64 da imagem, sem prefixo data:image>",
      "mimeType": "image/jpeg"
    }
  }'
```

## Formato da resposta

```json
{
  "response": "Texto da resposta do Teki",
  "sources": ["Documento 1", "Ticket #1234"],
  "confidence": "high"
}
```

Entregue o campo `response` de volta ao usuário no canal de origem.

Em caso de erro (status 5xx):
```json
{
  "response": "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.",
  "error": true
}
```

## Vinculação de conta (opcional)

O usuário pode vincular sua conta do Teki Web ao canal enviando `TEKI XXXXXX` (onde XXXXXX é o código gerado em `teki.com.br/configuracoes`). O webhook trata isso automaticamente.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `TEKI_API_URL` | URL base do Teki (ex: `https://teki.com.br` ou `http://localhost:3000`) |
| `TEKI_WEBHOOK_SECRET` | Token de autenticação (deve bater com `OPENCLAW_WEBHOOK_SECRET` no servidor) |

## Instalação

Copie esta pasta para `~/.openclaw/skills/teki-support/` e configure as variáveis de ambiente no OpenClaw.
