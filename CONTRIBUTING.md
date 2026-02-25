# 🤝 Contribuindo com o Teki

Obrigado pelo interesse em contribuir! Este guia vai te ajudar a configurar o ambiente e entender as convenções do projeto.

## Setup do Ambiente

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ com extensão pgvector
- Redis 7+
- Git

### Instalação

```bash
# Fork o repositório no GitHub, depois:
git clone https://github.com/SEU-USUARIO/teki.git
cd teki

# Instale as dependências
pnpm install

# Copie o .env de exemplo
cp .env.example .env.local

# Configure as variáveis de ambiente (veja README.md)
# Pelo menos DATABASE_URL e REDIS_URL são necessários

# Rode as migrations
pnpm db:migrate

# Gere o client Prisma
pnpm db:generate

# Inicie o dev server
pnpm dev
```

### Comandos de Desenvolvimento

```bash
pnpm dev              # Web app (Next.js)
pnpm dev:desktop      # Desktop app (Electron)
pnpm dev:admin        # Admin panel
pnpm build            # Build de produção
pnpm test             # Todos os testes
pnpm lint             # Lint em todos os workspaces
pnpm db:studio        # Prisma Studio (visual DB)
```

## Convenções

### Idioma

- **Código:** Inglês (variáveis, funções, tipos, comentários técnicos)
- **UI/Strings:** Português (labels, mensagens, documentação)
- **Commits:** Inglês
- **PRs e Issues:** Português ou inglês

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add query expansion pipeline
fix: resolve certificate validation timeout
docs: update AI system documentation
refactor: simplify provider routing logic
test: add confidence scorer unit tests
chore: update dependencies
```

### Branches

```
feature/nome-da-feature    # Nova funcionalidade
fix/descricao-do-bug       # Correção de bug
docs/o-que-mudou           # Documentação
refactor/o-que-mudou       # Refatoração
```

### Estrutura de Pastas

```
apps/web/src/
├── app/          # Next.js App Router (páginas e API routes)
├── components/   # Componentes React (ui/, dev/, layout/)
├── lib/          # Lógica de negócio (ai/, kb/, auth, prisma)
├── stores/       # Zustand stores
└── hooks/        # React hooks customizados
```

## Fluxo de PR

1. Crie uma branch a partir de `main`
2. Desenvolva com commits pequenos e descritivos
3. Garanta que `pnpm lint` e `pnpm test` passam
4. Abra um PR com descrição clara do que foi feito e por quê
5. Aguarde code review (pelo menos 1 aprovação)
6. Merge via squash ou merge commit

### Template de PR

```markdown
## O que mudou

Descrição curta das mudanças.

## Por quê

Contexto e motivação.

## Como testar

Passos para verificar que funciona.

## Screenshots (se aplicável)

Antes/depois para mudanças visuais.
```

## Rodando Testes

```bash
# Todos os testes
pnpm test

# Testes de um workspace específico
pnpm --filter web test
pnpm --filter admin test

# Com watch mode
pnpm --filter web test --watch
```

## Reportando Bugs

Use as [Issues do GitHub](https://github.com/ScryLk/teki/issues) com o template de bug report. Inclua:

- Passos para reproduzir
- Comportamento esperado vs real
- Screenshots se aplicável
- Ambiente (OS, browser, versão do Node)

## Segurança

Encontrou uma vulnerabilidade? **NÃO** reporte via issue pública. Envie email para security@teki.app.

## Code of Conduct

Seja respeitoso, construtivo e inclusivo. Contribuições de todos são bem-vindas independente de experiência, gênero, origem ou qualquer outra característica pessoal.

---

Dúvidas? Abra uma [issue](https://github.com/ScryLk/teki/issues) ou procure nos [discussions](https://github.com/ScryLk/teki/discussions).
