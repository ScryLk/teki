<div align="center">

# Teki

**Assistente IA para Suporte Tecnico | Powered by Algolia Agent Studio**

[![Algolia](https://img.shields.io/badge/Algolia-Agent%20Studio-5468FF?style=flat&logo=algolia&logoColor=white)](https://www.algolia.com/products/ai-search/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

[Demo ao Vivo](https://teki.vercel.app) | [Documentacao](#configuracao-do-algolia) | [Contribuir](#contribuicao)

</div>

---

## Sobre o Projeto

Teki e um assistente inteligente desenvolvido para auxiliar tecnicos de suporte de TI durante atendimentos ao vivo. Utilizando o poder do **Algolia Agent Studio**, o sistema busca em bases de conhecimento indexadas e fornece diagnosticos precisos com passos acionaveis em tempo real.

### O Problema

Tecnicos de helpdesk frequentemente enfrentam:
- Pressao por respostas rapidas durante ligacoes com usuarios
- Dificuldade em localizar documentacoes relevantes
- Falta de acesso a historico de problemas similares ja resolvidos
- Necessidade de consultar multiplas fontes simultaneamente

### A Solucao

Teki centraliza todas as fontes de informacao em uma interface de chat inteligente que:
- Busca em documentacoes, tickets historicos e cadastro de sistemas em menos de 50ms
- Fornece diagnosticos estruturados com passos numerados
- Permite adicionar contexto do atendimento para respostas mais precisas
- Funciona em qualquer dispositivo com interface responsiva

### Publico-Alvo

- Analistas de suporte tecnico (N1, N2, N3)
- Equipes de helpdesk corporativo
- Tecnicos de campo com acesso mobile
- Gestores de base de conhecimento

---

## Features

| Feature | Descricao |
|---------|-----------|
| **Chat com IA Contextual** | Conversacao natural com respostas baseadas em dados reais da empresa |
| **Busca Ultra-Rapida** | Resultados em menos de 50ms usando Algolia Search |
| **Diagnostico Estruturado** | Respostas organizadas com passos, alertas e referencias |
| **Base de Conhecimento** | Upload e indexacao de documentos PDF/DOC com chunking automatico |
| **Painel de Contexto** | Adicione informacoes do sistema, versao e erro para respostas precisas |
| **Interface Minimalista** | Design limpo e responsivo que funciona em desktop e mobile |
| **Streaming de Respostas** | Respostas em tempo real via Server-Sent Events |
| **App Desktop (Electron)** | Versao desktop com captura de tela, gato mascote animado e auto-contexto |
| **Screen Viewer** | Captura e exibicao da tela em tempo real com intervalos configuraveis |
| **Gato Mascote** | SVG animado com 6 estados que reage ao sistema (idle, watching, thinking, happy, alert, sleeping) |
| **Command Palette** | Ctrl+K para acesso rapido a comandos e navegacao |
| **System Tray** | Icone na bandeja com menu de acoes rapidas |

---

## Tech Stack

### Frontend
- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca de UI
- **Tailwind CSS v4** - Estilizacao utility-first
- **shadcn/ui** - Componentes acessiveis e customizaveis
- **TypeScript** - Tipagem estatica

### AI e Search
- **Algolia Agent Studio** - Motor de IA com RAG integrado
- **Gemini 2.5 Flash** - LLM para geracao de respostas

### Indices Algolia
| Indice | Conteudo |
|--------|----------|
| `documentacoes` | SOPs, manuais, procedimentos |
| `tickets` | Historico de chamados resolvidos |
| `sistemas` | Catalogo de sistemas, versoes, bugs conhecidos |
| `solucoes` | Base de conhecimento criada pelos tecnicos |

### Infraestrutura
- **Vercel** - Deploy e hosting
- **Edge Runtime** - API de chat otimizada

---

## Screenshots

<div align="center">

<!-- Substituir pelo GIF/imagem real -->
```
+------------------------------------------+
|  Teki        Chat | Base de Conhecimento |
+------------------------------------------+
|                                          |
|              [Logo Teki]                 |
|                 Teki                     |
|    Assistente inteligente para suporte   |
|                                          |
|   +----------------+ +----------------+  |
|   | Excel nao abre | | VPN desconecta |  |
|   +----------------+ +----------------+  |
|   +----------------+ +----------------+  |
|   | Usuario sem    | | Impressora     |  |
|   | senha          | | em branco      |  |
|   +----------------+ +----------------+  |
|                                          |
|  [____________________________________]  |
|  [Descreva o problema...]          [->]  |
+------------------------------------------+
```

</div>

---

## Quick Start

### Pre-requisitos

- Node.js 18.17 ou superior
- Conta no [Algolia](https://www.algolia.com/) com Agent Studio habilitado
- npm, yarn ou pnpm

### Instalacao

```bash
# Clone o repositorio
git clone https://github.com/ScryLk/teki.git
cd teki

# Instale as dependencias (usa pnpm workspaces)
pnpm install

# Configure as variaveis de ambiente
cp .env.example .env.local
```

### Variaveis de Ambiente

Edite o arquivo `.env.local`:

```env
# Algolia - Obtenha em https://dashboard.algolia.com/
NEXT_PUBLIC_ALGOLIA_APP_ID=seu_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=sua_search_key
NEXT_PUBLIC_ALGOLIA_AGENT_ID=seu_agent_id

# Admin Key - Necessaria para indexacao (server-side only)
ALGOLIA_ADMIN_KEY=sua_admin_key
```

### Executar

```bash
# Desenvolvimento - Web
pnpm dev:web

# Desenvolvimento - Desktop (Electron)
pnpm dev:desktop

# Build de producao
pnpm build:web
pnpm build:desktop
```

Web: Acesse [http://localhost:3000](http://localhost:3000)
Desktop: A janela Electron abre automaticamente

---

## Configuracao do Algolia

### 1. Criar os Indices

No [Algolia Dashboard](https://dashboard.algolia.com/), crie os seguintes indices:

**documentacoes**
```json
{
  "searchableAttributes": ["title", "content", "category"],
  "attributesForFaceting": ["filterOnly(category)", "filterOnly(system)"]
}
```

**tickets**
```json
{
  "searchableAttributes": ["title", "description", "solution", "tags"],
  "attributesForFaceting": ["filterOnly(status)", "filterOnly(category)"]
}
```

**sistemas**
```json
{
  "searchableAttributes": ["name", "description", "known_issues"],
  "attributesForFaceting": ["filterOnly(category)", "filterOnly(status)"]
}
```

**solucoes**
```json
{
  "searchableAttributes": ["title", "content", "description", "tags"],
  "attributesForFaceting": ["filterOnly(category)", "filterOnly(criticality)"]
}
```

### 2. Configurar o Agent Studio

1. Acesse **Agent Studio** no dashboard Algolia
2. Crie um novo agente com o nome "Teki"
3. Adicione os 4 indices como **Data Sources**
4. Configure o **System Prompt**:

```
Voce e Teki, um assistente de IA especializado em ajudar tecnicos de suporte de TI durante atendimentos ao vivo.

## SEU PAPEL
- Voce auxilia o TECNICO, nao o usuario final
- Use a busca Algolia para encontrar informacoes relevantes na base de conhecimento
- Forneca diagnosticos baseados em DADOS REAIS, nao suposicoes

## FONTES DE DADOS (via Algolia Search)
1. documentacoes - SOPs, manuais, procedimentos
2. tickets - Historico de chamados resolvidos
3. sistemas - Catalogo de sistemas, versoes, bugs conhecidos
4. solucoes - Base de conhecimento dos tecnicos

## REGRAS
1. Seja OBJETIVO - o tecnico esta em uma ligacao, tempo e critico
2. Forneca passos NUMERADOS e acionaveis
3. Sempre cite as FONTES quando usar informacoes da base
4. Se nao encontrar informacao, admita e sugira alternativas
5. Alerte sobre riscos ou prerequisitos importantes
```

5. Selecione **Gemini 2.5 Flash** como modelo
6. Publique o agente

### 3. Obter o Agent ID

Apos publicar, copie o **Agent ID** da URL ou das configuracoes do agente e adicione ao `.env.local`.

---

## Estrutura de Pastas (Monorepo)

```
teki/
├── apps/
│   ├── web/                          # App Web (Next.js) - teki-kappa.vercel.app
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   ├── components/           # React components + shadcn/ui
│   │   │   ├── hooks/
│   │   │   └── lib/                  # Algolia, types, utilities
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── desktop/                      # App Desktop (Electron)
│       ├── src/
│       │   ├── main/                 # Processo principal Electron
│       │   │   ├── index.ts          # Entry point, BrowserWindow
│       │   │   ├── tray.ts           # System tray
│       │   │   ├── ipc-handlers.ts   # IPC main handlers
│       │   │   └── services/         # Screen capture, window detector, settings
│       │   ├── preload/              # contextBridge seguro
│       │   │   └── index.ts
│       │   └── renderer/             # UI React
│       │       ├── App.tsx
│       │       ├── components/
│       │       │   ├── layout/       # TitleBar, SplitLayout, StatusBar
│       │       │   ├── chat/         # ChatPanel, MessageBubble, ChatInput
│       │       │   ├── screen/       # ScreenViewer, CaptureControls
│       │       │   ├── cat/          # CatMascot SVG animado
│       │       │   └── command-palette/
│       │       ├── hooks/            # useCatState, useScreenCapture, useAlgoliaChat
│       │       ├── services/         # Algolia Agent Studio client
│       │       └── stores/           # Zustand state management
│       ├── electron.vite.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                       # Tipos e constantes compartilhados
│       ├── types/                    # ChatMessage, CaptureFrame, TekiAPI, IPC
│       └── constants/                # Algolia indices, sistemas, ambientes
│
├── package.json                      # Workspace root (pnpm)
└── pnpm-workspace.yaml
```

---

## API Reference

### POST /api/chat

Envia uma mensagem para o agente e recebe a resposta em streaming.

**Request**

```typescript
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: {
    sistema?: string;
    versao?: string;
    ambiente?: string;
    sistemaOperacional?: string;
    mensagemErro?: string;
  };
}
```

**Response**

Server-Sent Events com formato:

```
data: {"type":"text-delta","delta":"Texto parcial..."}
data: {"type":"text-delta","delta":" continuacao"}
data: [DONE]
```

**Exemplo**

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Excel nao abre' }],
    context: { sistema: 'Microsoft Excel', versao: '365' }
  })
});

const reader = response.body.getReader();
// Processar streaming...
```

---

## Contribuicao

Contribuicoes sao bem-vindas! Para contribuir:

1. Fork o repositorio
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Reportar Bugs

Use as [Issues](https://github.com/seu-usuario/teki/issues) para reportar bugs ou sugerir features.

---

## Licenca

Este projeto esta licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Autor

**Lucas**

[![GitHub](https://img.shields.io/badge/GitHub-@lucas-181717?style=flat&logo=github)](https://github.com/lucas)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/lucas)

---

## Agradecimentos

<div align="center">

**Desenvolvido para o Algolia Agent Studio Challenge**

[![Algolia Challenge](https://img.shields.io/badge/Built%20for-Algolia%20Agent%20Studio%20Challenge-5468FF?style=for-the-badge&logo=algolia&logoColor=white)](https://dev.to/challenges/algolia)

Agradecimentos especiais a equipe da **Algolia** por disponibilizar o Agent Studio e promover este desafio.

</div>
# teki
