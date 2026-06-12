# Migrations

Este diretório foi criado junto com a feature de voice listening — até então o
schema era aplicado via `prisma db push`.

A migration `20260612190000_add_voice_listening` é **estritamente aditiva**
(novas tabelas/enums, nenhuma alteração em tabelas existentes). Em bancos já
existentes criados via `db push`, faça o baseline antes de aplicar:

```bash
# 1. Baseline do schema atual (marca o estado pré-migration como aplicado)
pnpm --filter @teki/web exec prisma migrate resolve --applied 20260612190000_add_voice_listening
# ...ou simplesmente aplique o SQL aditivo:
pnpm db:migrate   # prisma migrate deploy
```

Em bancos novos, `prisma migrate deploy` falharia por não conter o schema base —
use `prisma db push` primeiro (fluxo atual do projeto) ou gere o baseline com
`prisma migrate diff --from-empty`.
