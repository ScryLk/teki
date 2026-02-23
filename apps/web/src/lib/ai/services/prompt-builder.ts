import type { Tenant, Ticket, KnowledgeBaseArticle } from '@prisma/client';
import { getTenantSettings } from '@/lib/tenant';

interface ResolvedTicketSummary {
  ticketNumber: string;
  summary: string;
  category: string;
  resolutionNotes: string | null;
  aiConfidence: string | null;
}

const DEFAULT_SYSTEM_PROMPT = `Você é o assistente técnico da plataforma Teki, especializado em suporte para o software "{software_name}".

REGRAS OBRIGATÓRIAS:
1. PRIORIZE soluções da base de conhecimento local — elas são verificadas e confiáveis
2. Classifique cada solução com nível de confiança:
   - [BASE LOCAL] → solução encontrada na base de conhecimento (mais confiável)
   - [INFERIDO] → solução deduzida pelo contexto técnico (precisa validação)
   - [GENÉRICO] → solução genérica de TI (menos específica)
3. NUNCA invente códigos de erro, nomes de tabelas ou configurações que não estejam no contexto
4. Se não tiver informação suficiente, PEÇA detalhes específicos — liste exatamente o que precisa
5. Considere SEMPRE as soluções já tentadas para não repeti-las
6. Forneça passos NUMERADOS, claros e executáveis
7. Se houver RISCO em algum passo (perda de dados, downtime), avise explicitamente
8. Responda no idioma do atendente

FORMATO DE RESPOSTA (JSON):
Sempre responda EXCLUSIVAMENTE no formato JSON estruturado conforme o schema de resposta abaixo, sem nenhum texto adicional antes ou depois do JSON:

{
  "confidence": "high | medium | low",
  "source": "knowledge_base | ai_inference | hybrid",
  "diagnosis": {
    "summary": "Resumo do problema identificado",
    "root_cause": "Causa raiz mais provável",
    "technical_detail": "Explicação técnica detalhada"
  },
  "solution": {
    "steps": [
      {
        "order": 1,
        "title": "Nome curto do passo",
        "action": "Descrição completa do que fazer",
        "type": "manual | sql | command | config | code | restart",
        "detail": "Comando, query ou instrução específica",
        "risk_level": "none | low | medium | high",
        "warning": "Alerta de risco se houver"
      }
    ],
    "requires_restart": false,
    "requires_downtime": false
  },
  "prevention": {
    "description": "Como evitar que o problema ocorra novamente",
    "recommended_actions": ["Ação 1", "Ação 2"]
  },
  "follow_up": {
    "needs_more_info": false,
    "questions": [],
    "escalation_needed": false,
    "escalation_reason": null,
    "escalation_level": null
  },
  "metadata": {
    "tags": [],
    "category_suggestion": null,
    "should_add_to_kb": false,
    "kb_article_draft": null
  }
}`;

export class AiPromptBuilder {
  buildSystemPrompt(tenant: Tenant): string {
    const customPrompt = tenant.aiSystemPrompt;
    const base = customPrompt || DEFAULT_SYSTEM_PROMPT;
    return base.replace('{software_name}', tenant.softwareName ?? 'do cliente');
  }

  buildContext(ticket: Ticket): string {
    const ctx = ticket.contextJson as Record<string, unknown>;
    return JSON.stringify(ctx, null, 2);
  }

  buildKnowledgeSection(articles: KnowledgeBaseArticle[]): string {
    if (articles.length === 0) return '';

    const sections = articles.map((article, i) => {
      return `Artigo ${article.articleNumber} (relevância: alta):
Título: ${article.title}
Categoria: ${article.category}
Software: ${article.softwareName ?? 'N/A'} v${article.versionMin ?? '*'}-${article.versionMax ?? '*'}
Problema: ${article.problemDescription}
Solução: ${article.solutionSteps}
Observações: ${article.notes ?? 'N/A'}
Tags: ${article.tags.join(', ')}
Taxa de sucesso: ${article.successRate}%`;
    });

    return `[KNOWLEDGE_BASE_MATCHES]
Os seguintes artigos da base de conhecimento foram encontrados como relevantes:

${sections.join('\n\n')}`;
  }

  buildHistorySection(
    similarTickets: ResolvedTicketSummary[],
    attemptedSolutions: string[]
  ): string {
    let section = '';

    if (attemptedSolutions.length > 0) {
      section += `[SOLUTIONS_ALREADY_ATTEMPTED]
O cliente/atendente já tentou as seguintes soluções sem sucesso:
${attemptedSolutions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

`;
    }

    if (similarTickets.length > 0) {
      section += `[SIMILAR_RESOLVED_TICKETS]
Tickets similares resolvidos anteriormente:
${similarTickets
  .map(
    (t) =>
      `- ${t.ticketNumber}: ${t.summary} → Solução: ${t.resolutionNotes ?? 'N/A'} (confiança: ${t.aiConfidence ?? 'N/A'})`
  )
  .join('\n')}`;
    }

    return section;
  }

  buildFullPrompt(
    tenant: Tenant,
    ticket: Ticket,
    query: string,
    kbArticles: KnowledgeBaseArticle[],
    similarTickets: ResolvedTicketSummary[],
    attemptedSolutions: string[]
  ): { system: string; user: string } {
    const settings = getTenantSettings(tenant);

    const systemPrompt = this.buildSystemPrompt(tenant);

    const userParts: string[] = [];

    userParts.push(`[TICKET_CONTEXT]\n${this.buildContext(ticket)}`);

    const kbSection = this.buildKnowledgeSection(kbArticles);
    if (kbSection) userParts.push(kbSection);

    const historySection = this.buildHistorySection(similarTickets, attemptedSolutions);
    if (historySection) userParts.push(historySection);

    userParts.push(`[ATTENDANT_QUERY]\n${query}`);

    return {
      system: systemPrompt,
      user: userParts.join('\n\n'),
    };
  }
}
