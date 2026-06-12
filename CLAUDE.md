# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório. Leia antes de fazer alterações.

## O que é o Teki

SaaS multi-tenant de **inteligência para suporte técnico**. Conecta-se aos sistemas de
chamados existentes (GLPI, Zendesk, Freshdesk, OTRS) e potencializa técnicos com:

- **Screen Inspection** — detecção automática de erros na tela em tempo real (OCR local).
- **Assistente flutuante** — sugere soluções proativamente sem abrir o app.
- **IA com confiança transparente** — toda resposta carrega score 0-100% e origem,
  classificada como `[BASE LOCAL]`, `[INFERIDO]` ou `[GENÉRICO]`.
- **Base de conhecimento** — busca semântica progressiva com fallback multilíngue.

Modelo: SaaS multi-tenant com 4 planos (Free, Starter, Pro, Enterprise).

## Arquitetura (monorepo pnpm)

| Caminho            | App                          | Port | Descrição                                            |
| ------------------ | ---------------------------- | ---- | ---------------------------------------------------- |
| `apps/web`         | Next.js 16 (App Router)      | 3000 | App principal do técnico + API routes.               |
| `apps/desktop`     | Electron 33 + electron-vite  | 5173 | Screen inspection, OCR, janela flutuante, tray.      |
| `apps/admin`       | Next.js 16                   | 3001 | Painel super admin, analytics cross-tenant.          |
| `packages/shared`  | Lib compartilhada            | —    | Tipos, serviços, utils, constantes, config.          |

Desktop tem três processos: `src/main` (Electron), `src/preload` (bridge IPC),
`src/renderer` (React). Docs detalhadas em `docs/` (ARCHITECTURE, AI-SYSTEM, FEATURES,
PLANS, INTEGRATIONS, SCREEN-INSPECTION, SECURITY, API).

## Stack

- **Frontend**: React 19 + TypeScript 5 (strict) + Tailwind CSS 4 + shadcn/ui (Radix) + Zustand 5
- **Backend**: Next.js API routes + Prisma 7
- **Banco**: PostgreSQL 16 + pgvector (embeddings) · **Cache/sessions**: Redis 7
- **Desktop**: Electron 33 + electron-vite + Tesseract.js (OCR local)
- **IA multi-provider** (sem vendor lock-in, com fallback automático): Claude, Gemini, GPT, DeepSeek, Groq, Ollama
- **Embeddings**: Google Gemini `text-embedding-004` via pgvector
- **Auth**: NextAuth v5 + argon2id + TOTP (MFA) · **Cripto**: ECDH X25519 + AES-256-GCM
- **Pagamentos**: AbacatePay · **Email**: Resend · **Storage**: Supabase · **Gráficos**: recharts
- **Runtime**: Node 22 LTS · **Package manager**: pnpm 9+

## Comandos

```bash
# Dev
pnpm dev                 # web (3000)
pnpm dev:desktop         # electron (5173)
pnpm dev:admin           # admin (3001)
pnpm dev:free|starter|pro|enterprise|onboarding   # dev com cenário/plano específico

# Build
pnpm build               # todos os apps (ou :web / :desktop / :admin)

# Qualidade — rode antes de concluir uma alteração
pnpm lint
pnpm test

# Banco de dados (Prisma)
pnpm db:migrate          # aplicar migrations
pnpm db:generate         # gerar Prisma client
pnpm db:studio           # inspecionar DB

# Setup / seed
pnpm setup               # migra + seed inicial
pnpm seed | seed:reset   # popular dados (reset limpa antes)
```

## Banco de dados

Schema em `apps/web/prisma/schema.prisma`. Modelos principais:
`Tenant`, `User`, `UserCredential`, `UserAuthProvider`,
`TenantMember` (roles: `owner` / `admin` / `agent` / `viewer`),
`Conversation`, `Message`, `KbArticle`, `KbCategory`,
`AiProviderConfig`, `AiUsageDaily`, `ExternalConnector`,
`Notification`, `AuditLog`, `DataAccessLog` (LGPD).

Toda alteração de modelo exige migration Prisma (`pnpm db:migrate`).

## Convenções

- **Código em inglês** (variáveis, funções, tipos, comentários técnicos).
- **UI/strings voltadas ao usuário em português** (labels, mensagens).
- **Commits em inglês**, Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Branches: `feature/...`, `fix/...`, `docs/...`, `refactor/...`.
- TypeScript strict. Estilização só com Tailwind. Componentes-base via shadcn/ui.
- Estrutura web (`apps/web/src/`): `app/` (rotas + API), `components/` (`ui`, `dev`, `layout`),
  `lib/` (`ai`, `kb`, `auth`, `prisma`, `services`), `stores/` (Zustand), `hooks/`.
- Reutilize o que já existe em `packages/shared` e `lib/` antes de criar algo novo.

## Princípios não-negociáveis

- **Confiança transparente**: toda saída de IA carrega score e origem; nunca apresentar
  inferência como fato verificado.
- **Multi-provider sem lock-in**: nada deve assumir um único provider de IA; respeite o
  router e o fallback existentes em `lib/ai`.
- **Multi-tenant**: sempre considerar isolamento por tenant em queries, permissões e UI.
- **Segurança/LGPD**: criptografia at-rest e E2E; registrar ações em `AuditLog` e acesso a
  dados em `DataAccessLog`. Tratar dados de tenant como isolados.
- Ao mexer em IA, aponte impactos em **custo por provider**; em dados de usuário, em **LGPD**.
