# Migrations

Este diretório foi criado junto com a feature de voice listening — até então o
schema era aplicado via `prisma db push`.

## Estrutura

- `00000000000000_init` — **baseline**: o schema completo pré-voice-listening
  (gerado com `prisma migrate diff --from-empty`).
- `20260612190000_add_voice_listening` — migration **estritamente aditiva**
  (novas tabelas/enums: `audit_log`, `tenant_voice_configs`, `voice_sessions`,
  `voice_transcript_segments`; nenhuma alteração em tabelas existentes).

## Banco novo

```bash
pnpm db:migrate   # prisma migrate deploy — aplica init + voice listening
```

## Banco existente (criado via `db push`)

Marque o baseline como aplicado uma única vez e depois faça o deploy:

```bash
pnpm --filter @teki/web exec prisma migrate resolve --applied 00000000000000_init
pnpm db:migrate
```

Ambos os fluxos foram validados contra PostgreSQL 16 + pgvector. Após o
deploy, `prisma db push` reporta "already in sync" (zero drift entre
`schema.prisma` e as migrations).
