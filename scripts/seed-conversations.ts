// ═══════════════════════════════════════════════════════════════
// Conversation Seed Data Factory
// Generates realistic conversation data for development
// ═══════════════════════════════════════════════════════════════

// ── Sample Data ──

export const SAMPLE_AI_CHAT_TITLES = [
  'Erro 656 SEFAZ - Certificado expirado',
  'Como configurar backup automatico no JPosto',
  'Problema de conexao VPN Corporativa',
  'SQL Server travando nas consultas de relatorio',
  'Migracao de banco Oracle para PostgreSQL',
  'Configurar GLPI para envio de emails',
  'Active Directory sincronizacao com Azure AD',
  'Fluig BPM processo de aprovacao nao dispara',
  'ERP interno nao gera NF-e',
  'Rede WiFi corporativa instavel',
  'Windows Server 2019 alto consumo de memoria',
  'Teams nao sincroniza com calendario',
  'Linux Server permissoes de diretorio',
  'Excel VBA macro parou de funcionar',
  'Impressora de rede nao imprime etiquetas',
  'Banco de dados corrompido apos queda de energia',
  'Firewall bloqueando porta 443',
  'DNS nao resolve dominio interno',
  'Certificado SSL expirando em 3 dias',
  'Performance lenta no ERP apos atualizacao',
  'Outlook nao recebe emails externos',
  'Proxy transparente nao funciona no Chrome',
  'Servidor de arquivos lento',
  'Backup diferencial falhando',
  'RAID degradado no servidor principal',
];

export const SAMPLE_INTERNAL_NOTE_TITLES = [
  'Discussao sobre migracao de banco de dados',
  'Plano de contingencia para o datacenter',
  'Revisao do processo de onboarding',
  'Analise de incidentes recorrentes Q4',
  'Padronizacao de configuracoes de rede',
  'Documentacao de APIs internas',
  'Treinamento novo sistema ERP',
  'Escalacao de ticket critico - Cliente ABC',
  'Revisao de SLA mensal',
  'Planejamento de manutencao programada',
];

export const SAMPLE_USER_MESSAGES = [
  'O cliente esta reportando erro 656 ao tentar emitir NF-e. O certificado A1 esta dentro da validade.',
  'Preciso configurar o backup automatico do banco de dados do JPosto para rodar todo dia as 2h da manha.',
  'A VPN esta desconectando a cada 5 minutos. Ja tentei reinstalar o cliente FortiClient.',
  'As consultas de relatorio que antes levavam 2 segundos agora estao demorando mais de 30 segundos.',
  'Qual o procedimento para migrar os dados do Oracle 19c para PostgreSQL 16?',
  'O GLPI nao esta enviando emails de notificacao. O SMTP esta configurado no painel.',
  'Como sincronizar o AD local com o Azure AD usando o Azure AD Connect?',
  'O processo de aprovacao no Fluig BPM nao esta disparando para o proximo nivel.',
  'O sistema nao esta gerando NF-e. Aparece "Erro interno" sem mais detalhes.',
  'A rede WiFi corporativa fica caindo. Temos 3 APs Unifi configurados.',
];

export const SAMPLE_AI_RESPONSES = [
  'O erro 656 da SEFAZ geralmente esta relacionado a problemas com o certificado digital, mesmo quando ele esta dentro da validade. Vamos verificar alguns pontos:\n\n1. **Verificar a cadeia de certificados**: Abra o certificado e verifique se toda a cadeia de confianca esta instalada\n2. **Verificar o horario do servidor**: O certificado usa timestamp UTC, entao uma diferenca de fuso horario pode causar rejeicao\n3. **Reinstalar o certificado**: Exporte e reimporte o certificado no repositorio do Windows\n\n```bash\ncertutil -verify certificado.pfx\n```\n\nSe o problema persistir, verifique se o certificado esta na store correta (LocalMachine\\My).',
  'Para configurar o backup automatico no JPosto, siga estes passos:\n\n1. Acesse **Administracao > Configuracoes > Backup**\n2. Configure o agendamento para 02:00\n3. Defina o diretorio de destino\n\n```sql\n-- Verificar o ultimo backup\nSELECT TOP 1 * FROM sys.backupset\nORDER BY backup_finish_date DESC;\n```\n\nRecomendo tambem configurar um alerta por email para falhas de backup.',
  'A desconexao frequente da VPN pode ser causada por varios fatores:\n\n1. **Keep-alive**: Verifique se o keep-alive esta configurado no FortiClient\n2. **MTU**: Ajuste o MTU para 1400 na interface da VPN\n3. **Firewall local**: Verifique se nenhum software esta bloqueando as portas UDP 500 e 4500\n\n```bash\n# Testar MTU\nping -f -l 1400 servidor-vpn.empresa.com\n```',
  'A degradacao de performance nas consultas pode estar relacionada a:\n\n1. **Estatisticas desatualizadas**: Execute `UPDATE STATISTICS` nas tabelas principais\n2. **Fragmentacao de indices**: Verifique com `sys.dm_db_index_physical_stats`\n3. **Planos de execucao**: Compare os planos antes e depois da degradacao\n\n```sql\n-- Verificar fragmentacao\nSELECT \n  OBJECT_NAME(ips.object_id) AS TableName,\n  i.name AS IndexName,\n  ips.avg_fragmentation_in_percent\nFROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, \'LIMITED\') ips\nJOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id\nWHERE ips.avg_fragmentation_in_percent > 30\nORDER BY ips.avg_fragmentation_in_percent DESC;\n```',
];

export const SAMPLE_SUGGESTIONS = [
  {
    title: 'Possivel solucao para erro 656',
    content: 'Baseado no historico de tickets similares, o erro 656 geralmente e resolvido reinstalando a cadeia de certificados da SEFAZ.',
    confidence: 0.87,
    source: 'kb',
  },
  {
    title: 'Artigo relevante encontrado',
    content: 'Encontrei um artigo na base de conhecimento sobre configuracao de backup no JPosto que pode ser util.',
    confidence: 0.92,
    source: 'kb',
  },
  {
    title: 'Ticket similar resolvido',
    content: 'O ticket TK-0038 tinha sintomas identicos e foi resolvido ajustando o MTU da interface de rede.',
    confidence: 0.78,
    source: 'ticket',
  },
];

export const SAMPLE_SYSTEM_EVENTS = [
  { event: 'participant_joined', data: { user_id: 'uuid', name: 'Maria Silva' } },
  { event: 'conversation_archived', data: { by: 'uuid', reason: 'resolved' } },
  { event: 'ai_provider_changed', data: { from: 'anthropic', to: 'google' } },
  { event: 'ticket_linked', data: { ticket_id: 'uuid', number: 'TK-0042' } },
];

export const SAMPLE_PROVIDERS = [
  { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929', costIn: 0.000003, costOut: 0.000015 },
  { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', costIn: 0.0000008, costOut: 0.000004 },
  { provider: 'google', model: 'gemini-2.5-flash', costIn: 0.0000001, costOut: 0.0000004 },
  { provider: 'google', model: 'gemini-2.5-pro', costIn: 0.0000025, costOut: 0.000015 },
  { provider: 'openai', model: 'gpt-4o', costIn: 0.0000025, costOut: 0.00001 },
  { provider: 'openai', model: 'gpt-4o-mini', costIn: 0.00000015, costOut: 0.0000006 },
  { provider: 'deepseek', model: 'deepseek-chat', costIn: 0.00000027, costOut: 0.0000011 },
];

export const SAMPLE_FEEDBACK_TAGS = [
  ['accurate', 'good_solution', 'helpful_sources'],
  ['accurate', 'fast'],
  ['inaccurate', 'wrong_solution'],
  ['incomplete', 'too_brief'],
  ['accurate', 'too_verbose'],
  ['outdated', 'irrelevant_sources'],
];

export const SAMPLE_KB_SOURCES = [
  { title: 'Guia de Resolucao - Erros SEFAZ', url: '/kb/articles/sefaz-errors' },
  { title: 'Configuracao de Backup - JPosto', url: '/kb/articles/jposto-backup' },
  { title: 'VPN Troubleshooting Guide', url: '/kb/articles/vpn-troubleshooting' },
  { title: 'SQL Server Performance Tuning', url: '/kb/articles/sql-performance' },
  { title: 'Migracao Oracle para PostgreSQL', url: '/kb/articles/oracle-to-pg' },
];

// ── Conversation Scenarios for DevTools ──

export const CONVERSATION_SCENARIOS = {
  basic: {
    ai_chat: 5,
    floating: 2,
    internal_note: 3,
    support_chat: 0,
    messages_per_conv: { min: 4, max: 12 },
    ai_ratio: 0.4,
    feedback_ratio: 0.5,
    sources_per_ai_msg: { min: 1, max: 3 },
  },
  full: {
    ai_chat: 25,
    floating: 10,
    internal_note: 10,
    support_chat: 5,
    messages_per_conv: { min: 6, max: 30 },
    ai_ratio: 0.4,
    feedback_ratio: 0.4,
    sources_per_ai_msg: { min: 1, max: 5 },
  },
  limit: {
    ai_chat: 12,
    floating: 4,
    internal_note: 4,
    support_chat: 0,
    messages_per_conv: { min: 8, max: 20 },
    ai_ratio: 0.45,
    feedback_ratio: 0.3,
    sources_per_ai_msg: { min: 1, max: 4 },
  },
};
