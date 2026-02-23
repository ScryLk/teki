import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TemplateField {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  required: boolean;
  aiWeight: string;
  displayOrder: number;
}

interface CategoryTemplateData {
  category: string;
  fields: TemplateField[];
}

const DEFAULT_TEMPLATES: CategoryTemplateData[] = [
  {
    category: 'erro_aplicacao',
    fields: [
      { key: 'tela_afetada', label: 'Tela/Módulo onde ocorre o erro', type: 'text', required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'acao_executada', label: 'Ação que estava sendo executada', type: 'text', required: true, aiWeight: 'high', displayOrder: 1 },
      { key: 'mensagem_erro', label: 'Mensagem de erro exibida', type: 'textarea', required: true, aiWeight: 'high', displayOrder: 2 },
      { key: 'codigo_erro', label: 'Código do erro', type: 'text', required: false, aiWeight: 'high', displayOrder: 3 },
      { key: 'reproduzivel', label: 'Erro é reproduzível?', type: 'select', options: ['Sempre', 'Às vezes', 'Apenas 1 vez'], required: true, aiWeight: 'medium', displayOrder: 4 },
      { key: 'funcionava_antes', label: 'Funcionava antes?', type: 'boolean', required: true, aiWeight: 'medium', displayOrder: 5 },
      { key: 'mudanca_recente', label: 'Mudança recente (atualização, config, etc)', type: 'textarea', required: false, aiWeight: 'high', displayOrder: 6 },
    ],
  },
  {
    category: 'banco_dados',
    fields: [
      { key: 'sgbd', label: 'Banco de dados', type: 'select', options: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'Firebird', 'SQLite', 'Outro'], required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'versao_banco', label: 'Versão do banco', type: 'text', required: true, aiWeight: 'high', displayOrder: 1 },
      { key: 'tipo_erro_db', label: 'Tipo do problema', type: 'select', options: ['Conexão recusada', 'Timeout', 'Lock/Deadlock', 'Corrupção de dados', 'Espaço em disco', 'Permissão negada', 'Query lenta', 'Backup/Restore', 'Replicação', 'Outro'], required: true, aiWeight: 'high', displayOrder: 2 },
      { key: 'mensagem_erro_db', label: 'Mensagem de erro do banco', type: 'textarea', required: false, aiWeight: 'high', displayOrder: 3 },
      { key: 'tabela_afetada', label: 'Tabela afetada', type: 'text', required: false, aiWeight: 'medium', displayOrder: 4 },
      { key: 'query_problematica', label: 'Query/Log do banco', type: 'textarea', required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'ultimo_backup', label: 'Data do último backup', type: 'date', required: false, aiWeight: 'low', displayOrder: 6 },
      { key: 'conexoes_ativas', label: 'Conexões ativas', type: 'number', required: false, aiWeight: 'medium', displayOrder: 7 },
      { key: 'tamanho_banco_gb', label: 'Tamanho do banco (GB)', type: 'number', required: false, aiWeight: 'low', displayOrder: 8 },
    ],
  },
  {
    category: 'impressao',
    fields: [
      { key: 'tipo_documento_imp', label: 'O que está tentando imprimir', type: 'text', required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'modelo_impressora', label: 'Modelo da impressora', type: 'text', required: true, aiWeight: 'high', displayOrder: 1 },
      { key: 'tipo_conexao_imp', label: 'Conexão da impressora', type: 'select', options: ['USB', 'Rede TCP/IP', 'Serial', 'Bluetooth', 'Compartilhada Windows', 'Wi-Fi'], required: true, aiWeight: 'high', displayOrder: 2 },
      { key: 'ip_impressora', label: 'IP da impressora (se rede)', type: 'text', required: false, aiWeight: 'medium', displayOrder: 3 },
      { key: 'driver_impressora', label: 'Driver/Modo de impressão', type: 'text', required: false, aiWeight: 'high', displayOrder: 4 },
      { key: 'erro_visual', label: 'Descreva o que aparece (ou não aparece)', type: 'textarea', required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'imprime_teste', label: 'Página de teste imprime?', type: 'select', options: ['Sim', 'Não', 'Não testei'], required: false, aiWeight: 'medium', displayOrder: 6 },
      { key: 'outras_impressoras_ok', label: 'Outras impressoras funcionam?', type: 'select', options: ['Sim', 'Não', 'Não há outras', 'Não testei'], required: false, aiWeight: 'medium', displayOrder: 7 },
    ],
  },
  {
    category: 'rede',
    fields: [
      { key: 'tipo_problema_rede', label: 'Tipo do problema', type: 'select', options: ['Sem internet', 'Lentidão', 'DNS não resolve', 'Firewall bloqueando', 'VPN não conecta', 'Proxy', 'Certificado SSL', 'Porta bloqueada', 'Outro'], required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'servico_afetado', label: 'Serviço/URL que não funciona', type: 'text', required: false, aiWeight: 'high', displayOrder: 1 },
      { key: 'tipo_conexao_rede', label: 'Tipo de conexão', type: 'select', options: ['Fibra', 'ADSL', '4G/5G', 'Via rádio', 'Satélite', 'Outro'], required: false, aiWeight: 'low', displayOrder: 2 },
      { key: 'firewall_ativo', label: 'Firewall/Antivírus', type: 'text', required: false, aiWeight: 'medium', displayOrder: 3 },
      { key: 'proxy_configurado', label: 'Proxy configurado?', type: 'boolean', required: false, aiWeight: 'medium', displayOrder: 4 },
      { key: 'portas_necessarias', label: 'Portas que precisam estar abertas', type: 'text', required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'ping_funciona', label: 'Ping para o destino funciona?', type: 'select', options: ['Sim', 'Não', 'Não testei'], required: false, aiWeight: 'medium', displayOrder: 6 },
      { key: 'erro_ssl_msg', label: 'Mensagem de erro SSL (se houver)', type: 'textarea', required: false, aiWeight: 'high', displayOrder: 7 },
    ],
  },
  {
    category: 'performance',
    fields: [
      { key: 'tela_lenta', label: 'Tela/Operação lenta', type: 'text', required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'tempo_resposta_seg', label: 'Tempo de resposta (segundos)', type: 'number', required: false, aiWeight: 'medium', displayOrder: 1 },
      { key: 'qtd_registros', label: 'Quantidade de registros envolvidos', type: 'number', required: false, aiWeight: 'medium', displayOrder: 2 },
      { key: 'usuarios_simultaneos', label: 'Usuários simultâneos no sistema', type: 'number', required: false, aiWeight: 'medium', displayOrder: 3 },
      { key: 'ram_total_gb', label: 'Memória RAM total (GB)', type: 'number', required: false, aiWeight: 'medium', displayOrder: 4 },
      { key: 'cpu_uso_percent', label: 'Uso de CPU (%)', type: 'number', required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'disco_tipo_perf', label: 'Tipo de disco', type: 'select', options: ['SSD', 'HDD', 'NVMe'], required: false, aiWeight: 'medium', displayOrder: 6 },
      { key: 'disco_livre_gb', label: 'Espaço livre em disco (GB)', type: 'number', required: false, aiWeight: 'medium', displayOrder: 7 },
      { key: 'lento_desde', label: 'Está lento desde quando?', type: 'text', required: false, aiWeight: 'high', displayOrder: 8 },
      { key: 'afeta_todo_sistema', label: 'Afeta todo o sistema ou só essa tela?', type: 'select', options: ['Todo o sistema', 'Só essa tela', 'Algumas telas'], required: true, aiWeight: 'high', displayOrder: 9 },
    ],
  },
  {
    category: 'integracao',
    fields: [
      { key: 'servico_externo', label: 'Serviço/API de integração', type: 'text', required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'tipo_integracao', label: 'Tipo de integração', type: 'select', options: ['REST API', 'SOAP', 'Webhook', 'Arquivo (EDI/XML/CSV)', 'Banco a banco', 'Outro'], required: true, aiWeight: 'high', displayOrder: 1 },
      { key: 'url_endpoint', label: 'URL/Endpoint', type: 'text', required: false, aiWeight: 'medium', displayOrder: 2 },
      { key: 'http_status', label: 'HTTP Status retornado', type: 'text', required: false, aiWeight: 'high', displayOrder: 3 },
      { key: 'corpo_resposta', label: 'Corpo da resposta de erro', type: 'textarea', required: false, aiWeight: 'high', displayOrder: 4 },
      { key: 'autenticacao', label: 'Tipo de autenticação', type: 'select', options: ['API Key', 'OAuth2', 'Bearer Token', 'Basic Auth', 'Certificado', 'Nenhuma'], required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'ultima_sincronizacao', label: 'Última sincronização com sucesso', type: 'text', required: false, aiWeight: 'medium', displayOrder: 6 },
    ],
  },
  {
    category: 'instalacao',
    fields: [
      { key: 'tipo_instalacao', label: 'Tipo de operação', type: 'select', options: ['Instalação nova', 'Atualização', 'Migração', 'Restauração', 'Configuração'], required: true, aiWeight: 'high', displayOrder: 0 },
      { key: 'versao_origem', label: 'Versão de origem (se migração/atualização)', type: 'text', required: false, aiWeight: 'high', displayOrder: 1 },
      { key: 'versao_destino', label: 'Versão de destino', type: 'text', required: false, aiWeight: 'high', displayOrder: 2 },
      { key: 'etapa_falha', label: 'Em qual etapa falhou?', type: 'text', required: true, aiWeight: 'high', displayOrder: 3 },
      { key: 'mensagem_instalacao', label: 'Mensagem de erro', type: 'textarea', required: false, aiWeight: 'high', displayOrder: 4 },
      { key: 'prerequisitos_ok', label: 'Pré-requisitos verificados?', type: 'select', options: ['Sim, todos OK', 'Não verifiquei', 'Algum faltando'], required: false, aiWeight: 'medium', displayOrder: 5 },
      { key: 'permissao_admin', label: 'Executando como administrador?', type: 'boolean', required: false, aiWeight: 'medium', displayOrder: 6 },
    ],
  },
];

async function seedCategoryTemplates(tenantId: string) {
  for (const template of DEFAULT_TEMPLATES) {
    for (const field of template.fields) {
      await prisma.categoryTemplate.upsert({
        where: {
          tenantId_category_fieldKey: {
            tenantId,
            category: template.category,
            fieldKey: field.key,
          },
        },
        update: {
          fieldLabel: field.label,
          fieldType: field.type,
          fieldOptions: field.options ?? undefined,
          placeholder: field.placeholder ?? null,
          required: field.required,
          aiWeight: field.aiWeight,
          displayOrder: field.displayOrder,
        },
        create: {
          tenantId,
          category: template.category,
          fieldKey: field.key,
          fieldLabel: field.label,
          fieldType: field.type,
          fieldOptions: field.options ?? undefined,
          placeholder: field.placeholder ?? null,
          required: field.required,
          aiWeight: field.aiWeight,
          displayOrder: field.displayOrder,
        },
      });
    }
  }

  console.log(`Seeded ${DEFAULT_TEMPLATES.length} category templates for tenant ${tenantId}`);
}

async function main() {
  // Create a default tenant if none exists
  let tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Empresa Demo',
        slug: 'demo',
        softwareName: 'Sistema ERP Demo',
        softwareDescription: 'Sistema de gestão empresarial para demonstração',
        plan: 'enterprise',
        settings: {
          ai_config: {
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2000,
            temperature: 0.3,
            auto_suggest: true,
            auto_respond_threshold: 0.9,
            language: 'pt-BR',
            max_kb_articles_in_context: 5,
            max_similar_tickets_in_context: 3,
          },
          ticket_config: {
            auto_assign: true,
            sla_hours: { high: 4, medium: 12, low: 48 },
            require_category: true,
            require_subcategory: false,
            auto_detect_category: true,
          },
          kb_config: {
            require_review: true,
            auto_suggest_articles: true,
            semantic_search_enabled: true,
            min_relevance_score: 30,
          },
        },
      },
    });
    console.log(`Created demo tenant: ${tenant.id}`);
  }

  // Link existing users to the tenant if they don't have one
  await prisma.user.updateMany({
    where: { tenantId: null },
    data: { tenantId: tenant.id },
  });

  // Create a demo client
  const existingClient = await prisma.client.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!existingClient) {
    await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: 'Cliente Demo Ltda',
        document: '12.345.678/0001-99',
        email: 'contato@clientedemo.com.br',
        phone: '(11) 99999-9999',
        contractPlan: 'professional',
        softwareVersion: '2.5.1',
        environmentJson: {
          os: 'Windows 10 Pro 22H2',
          arch: 'x64',
          runtime: 'Java 1.8.0_362',
          database: {
            engine: 'PostgreSQL',
            version: '16.2',
            host: 'localhost',
            port: 5432,
          },
          network: {
            type: 'local',
            proxy: false,
            firewall: 'Windows Defender',
          },
          hardware: {
            ram_gb: 16,
            cpu: 'Intel i7-10700',
            disk_type: 'NVMe',
            disk_free_gb: 120,
          },
        },
      },
    });
    console.log('Created demo client');
  }

  // Seed category templates for the tenant
  await seedCategoryTemplates(tenant.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
