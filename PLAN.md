# Monitor de Conexão — Plano de Implementação

## Visão Geral
Expandir o sistema de Connection Health existente (polling binário de 3 serviços)
para um Monitor de Conexão completo com: probes reais (TCP/DB/HTTP) com latência,
histórico persistido (better-sqlite3), alertas inteligentes com debounce,
dashboard consolidado (recharts), e detecção de padrões.

## Dependências a Instalar
- `recharts` — gráficos no renderer
- `better-sqlite3` + `@types/better-sqlite3` — persistência local
- `pg` já está no root `package.json`; não precisa de dep extra para probe PG

`better-sqlite3` é addon nativo — deve ser marcado como `external` no electron-vite
config (como `bufferutil`).

---

## Etapa 1 — Tipos e Fundação (shared)

**Arquivo: `packages/shared/types/monitor.ts`** (NOVO)
- `ProbeType = 'http' | 'tcp' | 'pg'`
- `MonitoredService { id, name, type: ProbeType, target (url/host:port/connString), intervalMs, enabled }`
- `PingResult { serviceId, status: ServiceStatus, latencyMs, timestamp, error? }`
- `PingHistoryQuery { serviceId, from, to, granularity: 'raw' | 'hourly' }`
- `HourlyAggregate { serviceId, hourStart, avgLatency, p95Latency, minLatency, maxLatency, checkCount, failCount, uptimePct }`
- `AlertEvent { serviceId, serviceName, status, message, timestamp, grouped: boolean }`
- `DetectedPattern { serviceId, dayOfWeek, hour, avgLatency, baselineLatency, severity, message }`

**Arquivo: `packages/shared/types/ipc.ts`** (MODIFICAR)
- Adicionar novos IPC channels para Monitor
- Adicionar métodos ao `TekiAPI` interface

**Arquivo: `packages/shared/index.ts`** (MODIFICAR)
- Re-exportar `./types/monitor`

---

## Etapa 2 — Probes (main process)

**Arquivo: `apps/desktop/src/main/connection/probes/httpProbe.ts`** (NOVO)
- `httpProbe(url: string, timeoutMs = 5000): Promise<PingResult>`
- Usa `fetch()` com medição `Date.now()` antes e depois
- Status: <100ms online, <300ms degraded, else offline

**Arquivo: `apps/desktop/src/main/connection/probes/tcpProbe.ts`** (NOVO)
- `tcpProbe(host: string, port: number, timeoutMs = 5000): Promise<PingResult>`
- Usa `net.Socket` — connect + medir tempo até 'connect' event
- Destroy socket após medição

**Arquivo: `apps/desktop/src/main/connection/probes/pgProbe.ts`** (NOVO)
- `pgProbe(connectionString: string, timeoutMs = 5000): Promise<PingResult>`
- Pool com `max: 1`, executa `SELECT 1`, mede latência
- Cache de pools por connectionString

**Arquivo: `apps/desktop/src/main/connection/probes/index.ts`** (NOVO)
- `ProbeRegistry`: map `ProbeType → probe function`
- `runProbe(service: MonitoredService): Promise<PingResult>`

---

## Etapa 3 — Histórico Persistido (main process)

**Arquivo: `apps/desktop/src/main/connection/HistoryStore.ts`** (NOVO)
- Abre/cria SQLite em `app.getPath('userData')/monitor.db`
- Tabelas: `ping_history` (raw, 24h), `ping_hourly` (agregado, 90d), `monitored_services` (config), `detected_patterns`
- Métodos: `insertPing()`, `queryHistory()`, `queryHourly()`, `compact()`, `getStats()`
- Compactação horária via `setInterval` (1x/hora)
- Singleton pattern

**Config: `apps/desktop/electron.vite.config.ts`** (MODIFICAR)
- Adicionar `'better-sqlite3'` ao array `external` do rollup

---

## Etapa 4 — Refatorar ConnectionHealthManager (main process)

**Arquivo: `apps/desktop/src/main/connection/ConnectionHealthManager.ts`** (MODIFICAR)
- Manter checks existentes (internet, backend, openclaw) para backward compat
- Adicionar: lista de `MonitoredService` (carregados do HistoryStore)
- Novo loop: para cada serviço monitorado, `runProbe()` → `insertPing()` no HistoryStore
- Emitir novo evento `'probe-result'` com `PingResult` (além do `'health-changed'` existente)
- Novos métodos: `addService()`, `removeService()`, `getServices()`, `probeNow(serviceId)`

---

## Etapa 5 — AlertManager (main process)

**Arquivo: `apps/desktop/src/main/connection/AlertManager.ts`** (NOVO)
- State machine por serviço: `ok → suspicious → alerted → recovering → ok`
- `suspicious`: 1 falha. `alerted`: 3 falhas consecutivas → dispara notificação
- Cooldown: 5min por serviço após alerta
- Agrupamento: se 2+ serviços falham no mesmo ciclo, 1 notificação agrupada
- Usa `Notification` do Electron para system tray notifications
- Emite evento `'alert'` para push ao renderer via IPC
- Emite evento `'alert-resolved'` quando serviço recupera

---

## Etapa 6 — IPC e Preload (bridge)

**Arquivo: `apps/desktop/src/main/connection/setupConnectionHealth.ts`** (MODIFICAR)
- Registrar IPC handlers para: listar serviços, add/remove serviço, query history, query stats, probe agora, get patterns
- Encaminhar eventos `probe-result` e `alert` ao renderer via `webContents.send`

**Arquivo: `apps/desktop/src/preload/index.ts`** (MODIFICAR)
- Adicionar métodos do Monitor ao bridge: `monitorListServices`, `monitorAddService`, `monitorRemoveService`, `monitorQueryHistory`, `monitorQueryStats`, `monitorProbeNow`, `onMonitorProbeResult`, `onMonitorAlert`, `monitorGetPatterns`

---

## Etapa 7 — Zustand Store (renderer)

**Arquivo: `apps/desktop/src/renderer/stores/monitor-store.ts`** (NOVO)
- Store separado (não poluir app-store):
  - `services: MonitoredService[]`
  - `latestPings: Map<serviceId, PingResult[]>` (últimos 60 por serviço, em memória)
  - `alerts: AlertEvent[]`
  - Actions: `addPing`, `setServices`, `addAlert`, `clearAlert`
- Hook `useMonitorStore`

---

## Etapa 8 — Layout & Navegação (renderer)

**Arquivo: `apps/desktop/src/renderer/stores/app-store.ts`** (MODIFICAR)
- Adicionar `'monitor'` ao tipo `LayoutMode`

**Arquivo: `apps/desktop/src/renderer/App.tsx`** (MODIFICAR)
- Adicionar case `'monitor'` no switch de layout → renderizar `<MonitorDashboard />`

**Arquivo: `apps/desktop/src/renderer/components/layout/StatusBar.tsx`** (MODIFICAR)
- Adicionar botão/link "Monitor" na StatusBar para navegar ao layout monitor
- Atalho Ctrl+4 para monitor

---

## Etapa 9 — Dashboard UI (renderer)

**Arquivo: `apps/desktop/src/renderer/components/monitor/MonitorDashboard.tsx`** (NOVO)
- Layout principal: scorecard row + gráfico de latência + heatmap + insights
- Carrega dados via IPC no mount

**Arquivo: `apps/desktop/src/renderer/components/monitor/ServiceScorecard.tsx`** (NOVO)
- Cards: total serviços, uptime % (24h), latência média (24h), incidentes ativos

**Arquivo: `apps/desktop/src/renderer/components/monitor/LatencyChart.tsx`** (NOVO)
- Recharts `LineChart` multi-line — 1 linha por serviço, últimos 60 pings
- Tooltip unificado, cores distintas por serviço
- Eixo Y com domínio clamped (max 500ms)

**Arquivo: `apps/desktop/src/renderer/components/monitor/AvailabilityHeatmap.tsx`** (NOVO)
- Grid de divs (7 dias × 24 horas) — cor = uptime % da hora
- Verde ≥99%, amarelo ≥95%, vermelho <95%
- Dados da tabela `ping_hourly`

**Arquivo: `apps/desktop/src/renderer/components/monitor/ServiceConfigModal.tsx`** (NOVO)
- Modal para adicionar/editar/remover serviço monitorado
- Campos: nome, tipo (HTTP/TCP/PG), target, intervalo
- Mesmo padrão visual do SettingsModal

**Arquivo: `apps/desktop/src/renderer/components/monitor/InsightCards.tsx`** (NOVO)
- Cards mostrando padrões detectados em linguagem natural
- Ex: "PostgreSQL degrada toda Segunda às 9h (3.2x acima do normal)"

---

## Etapa 10 — Hook de Monitor (renderer)

**Arquivo: `apps/desktop/src/renderer/hooks/useMonitor.ts`** (NOVO)
- Carrega serviços e histórico recente no mount
- Subscreve a `onMonitorProbeResult` para updates em tempo real
- Subscreve a `onMonitorAlert` para alertas
- Alimenta o `monitor-store`

---

## Etapa 11 — Pattern Detection (main process)

**Arquivo: `apps/desktop/src/main/connection/PatternDetector.ts`** (NOVO)
- `buildWeeklyProfile()`: agrupa dados hourly em 168 slots (7×24)
- `detectPatterns()`: slots com latência >2× média geral + mínimo 3 semanas
- `run()`: roda 1x/dia, salva patterns no HistoryStore
- IPC para query patterns pelo renderer

---

## Ordem de Implementação
1. Tipos (shared) — 1 arquivo novo, 2 modificados
2. Probes — 4 arquivos novos
3. HistoryStore — 1 arquivo novo, 1 config modificado
4. Refatorar ConnectionHealthManager — 1 arquivo modificado
5. AlertManager — 1 arquivo novo
6. IPC + Preload — 2 arquivos modificados
7. Monitor Store — 1 arquivo novo
8. Layout/navegação — 3 arquivos modificados
9. Dashboard UI — 6 arquivos novos
10. Hook useMonitor — 1 arquivo novo
11. PatternDetector — 1 arquivo novo

**Total: ~15 arquivos novos, ~8 modificados**
