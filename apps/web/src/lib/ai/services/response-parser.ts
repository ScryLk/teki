export interface AiStructuredResponse {
  confidence: 'high' | 'medium' | 'low';
  source: 'knowledge_base' | 'ai_inference' | 'hybrid';
  diagnosis: {
    summary: string;
    root_cause: string;
    technical_detail: string;
  };
  solution: {
    steps: {
      order: number;
      title: string;
      action: string;
      type: string;
      detail: string;
      risk_level: string;
      warning: string | null;
    }[];
    estimated_time_minutes?: number;
    requires_restart: boolean;
    requires_downtime: boolean;
  };
  prevention: {
    description: string;
    recommended_actions: string[];
  };
  additional_info?: {
    related_articles: string[];
    similar_tickets: string[];
    documentation_links: string[];
  };
  follow_up: {
    needs_more_info: boolean;
    questions: string[];
    escalation_needed: boolean;
    escalation_reason: string | null;
    escalation_level: string | null;
  };
  metadata: {
    tags: string[];
    category_suggestion: string | null;
    should_add_to_kb: boolean;
    kb_article_draft: string | null;
  };
}

export class AiResponseParser {
  parse(rawResponse: string): AiStructuredResponse {
    // Try to extract JSON from the response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return this.buildFallbackResponse(rawResponse);
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return this.validate(parsed);
    } catch {
      return this.buildFallbackResponse(rawResponse);
    }
  }

  private validate(data: Record<string, unknown>): AiStructuredResponse {
    return {
      confidence: this.validateEnum(data.confidence as string, ['high', 'medium', 'low'], 'medium') as AiStructuredResponse['confidence'],
      source: this.validateEnum(data.source as string, ['knowledge_base', 'ai_inference', 'hybrid'], 'ai_inference') as AiStructuredResponse['source'],
      diagnosis: {
        summary: this.getString(data.diagnosis, 'summary', 'Diagnóstico não disponível'),
        root_cause: this.getString(data.diagnosis, 'root_cause', ''),
        technical_detail: this.getString(data.diagnosis, 'technical_detail', ''),
      },
      solution: {
        steps: this.parseSteps(data.solution),
        estimated_time_minutes: this.getNumber(data.solution, 'estimated_time_minutes'),
        requires_restart: this.getBool(data.solution, 'requires_restart', false),
        requires_downtime: this.getBool(data.solution, 'requires_downtime', false),
      },
      prevention: {
        description: this.getString(data.prevention, 'description', ''),
        recommended_actions: this.getStringArray(data.prevention, 'recommended_actions'),
      },
      additional_info: {
        related_articles: this.getStringArray(data.additional_info, 'related_articles'),
        similar_tickets: this.getStringArray(data.additional_info, 'similar_tickets'),
        documentation_links: this.getStringArray(data.additional_info, 'documentation_links'),
      },
      follow_up: {
        needs_more_info: this.getBool(data.follow_up, 'needs_more_info', false),
        questions: this.getStringArray(data.follow_up, 'questions'),
        escalation_needed: this.getBool(data.follow_up, 'escalation_needed', false),
        escalation_reason: this.getStringOrNull(data.follow_up, 'escalation_reason'),
        escalation_level: this.getStringOrNull(data.follow_up, 'escalation_level'),
      },
      metadata: {
        tags: this.getStringArray(data.metadata, 'tags'),
        category_suggestion: this.getStringOrNull(data.metadata, 'category_suggestion'),
        should_add_to_kb: this.getBool(data.metadata, 'should_add_to_kb', false),
        kb_article_draft: this.getStringOrNull(data.metadata, 'kb_article_draft'),
      },
    };
  }

  private buildFallbackResponse(rawText: string): AiStructuredResponse {
    return {
      confidence: 'low',
      source: 'ai_inference',
      diagnosis: {
        summary: rawText.slice(0, 200),
        root_cause: '',
        technical_detail: rawText,
      },
      solution: {
        steps: [{
          order: 1,
          title: 'Resposta da IA',
          action: rawText,
          type: 'manual',
          detail: '',
          risk_level: 'none',
          warning: null,
        }],
        requires_restart: false,
        requires_downtime: false,
      },
      prevention: { description: '', recommended_actions: [] },
      follow_up: {
        needs_more_info: false,
        questions: [],
        escalation_needed: false,
        escalation_reason: null,
        escalation_level: null,
      },
      metadata: {
        tags: [],
        category_suggestion: null,
        should_add_to_kb: false,
        kb_article_draft: null,
      },
    };
  }

  private validateEnum(value: string | undefined, allowed: string[], defaultVal: string): string {
    if (value && allowed.includes(value)) return value;
    return defaultVal;
  }

  private getString(obj: unknown, key: string, defaultVal: string): string {
    if (obj && typeof obj === 'object' && key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      return typeof val === 'string' ? val : defaultVal;
    }
    return defaultVal;
  }

  private getStringOrNull(obj: unknown, key: string): string | null {
    if (obj && typeof obj === 'object' && key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      return typeof val === 'string' ? val : null;
    }
    return null;
  }

  private getBool(obj: unknown, key: string, defaultVal: boolean): boolean {
    if (obj && typeof obj === 'object' && key in obj) {
      return !!(obj as Record<string, unknown>)[key];
    }
    return defaultVal;
  }

  private getNumber(obj: unknown, key: string): number | undefined {
    if (obj && typeof obj === 'object' && key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      return typeof val === 'number' ? val : undefined;
    }
    return undefined;
  }

  private getStringArray(obj: unknown, key: string): string[] {
    if (obj && typeof obj === 'object' && key in obj) {
      const val = (obj as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
    }
    return [];
  }

  private parseSteps(solution: unknown): AiStructuredResponse['solution']['steps'] {
    if (!solution || typeof solution !== 'object') return [];
    const steps = (solution as Record<string, unknown>).steps;
    if (!Array.isArray(steps)) return [];

    return steps.map((step, i) => {
      if (typeof step !== 'object' || !step) {
        return {
          order: i + 1,
          title: `Passo ${i + 1}`,
          action: String(step),
          type: 'manual',
          detail: '',
          risk_level: 'none',
          warning: null,
        };
      }
      const s = step as Record<string, unknown>;
      return {
        order: typeof s.order === 'number' ? s.order : i + 1,
        title: typeof s.title === 'string' ? s.title : `Passo ${i + 1}`,
        action: typeof s.action === 'string' ? s.action : '',
        type: typeof s.type === 'string' ? s.type : 'manual',
        detail: typeof s.detail === 'string' ? s.detail : '',
        risk_level: typeof s.risk_level === 'string' ? s.risk_level : 'none',
        warning: typeof s.warning === 'string' ? s.warning : null,
      };
    });
  }
}
