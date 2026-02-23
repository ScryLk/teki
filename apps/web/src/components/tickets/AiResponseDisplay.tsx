'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Wrench,
  Database,
  Settings,
  Code,
  RotateCcw,
} from 'lucide-react';

interface AiResponse {
  confidence?: string;
  source?: string;
  diagnosis?: {
    summary?: string;
    root_cause?: string;
    technical_detail?: string;
  };
  solution?: {
    steps?: {
      order: number;
      title: string;
      action: string;
      type?: string;
      detail?: string;
      risk_level?: string;
      warning?: string;
    }[];
    requires_restart?: boolean;
    requires_downtime?: boolean;
  };
  prevention?: {
    description?: string;
    recommended_actions?: string[];
  };
  follow_up?: {
    needs_more_info?: boolean;
    questions?: string[];
    escalation_needed?: boolean;
    escalation_reason?: string;
    escalation_level?: string;
  };
}

interface AiResponseDisplayProps {
  response: Record<string, unknown>;
  confidence: string | null;
  source: string | null;
  onFeedback?: (helpful: boolean) => void;
}

const confidenceColors: Record<string, string> = {
  high: 'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const confidenceLabels: Record<string, string> = {
  high: 'Alta confiança',
  medium: 'Média confiança',
  low: 'Baixa confiança',
};

const sourceColors: Record<string, string> = {
  knowledge_base: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ai_inference: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hybrid: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const sourceLabels: Record<string, string> = {
  knowledge_base: 'BASE LOCAL',
  ai_inference: 'INFERIDO',
  hybrid: 'HÍBRIDO',
};

const stepTypeIcons: Record<string, React.ReactNode> = {
  manual: <Wrench className="w-4 h-4" />,
  sql: <Database className="w-4 h-4" />,
  command: <Terminal className="w-4 h-4" />,
  config: <Settings className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  restart: <RotateCcw className="w-4 h-4" />,
};

export function AiResponseDisplay({ response, confidence, source, onFeedback }: AiResponseDisplayProps) {
  const [showPrevention, setShowPrevention] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const data = response as unknown as AiResponse;
  const conf = data.confidence ?? confidence ?? 'medium';
  const src = data.source ?? source ?? 'ai_inference';

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful);
    onFeedback?.(helpful);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Resposta da IA
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className={confidenceColors[conf]}>
              {confidenceLabels[conf] ?? conf}
            </Badge>
            <Badge variant="outline" className={sourceColors[src]}>
              {sourceLabels[src] ?? src}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Diagnosis */}
        {data.diagnosis && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Diagnóstico
            </h4>
            <div className="bg-accent/50 rounded-lg p-3 space-y-2">
              {data.diagnosis.summary && (
                <p className="text-sm font-medium">{data.diagnosis.summary}</p>
              )}
              {data.diagnosis.root_cause && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Causa raiz: </span>
                  {data.diagnosis.root_cause}
                </p>
              )}
              {data.diagnosis.technical_detail && (
                <p className="text-xs text-muted-foreground">{data.diagnosis.technical_detail}</p>
              )}
            </div>
          </div>
        )}

        {/* Solution Steps */}
        {data.solution?.steps && data.solution.steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Solução
            </h4>
            <div className="space-y-3">
              {data.solution.steps.map((step) => (
                <div key={step.order} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {step.order}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.title}</span>
                      {step.type && (
                        <span className="text-muted-foreground">
                          {stepTypeIcons[step.type] ?? null}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.action}</p>
                    {step.detail && (
                      <pre className="text-xs bg-background rounded p-2 overflow-x-auto border">
                        {step.detail}
                      </pre>
                    )}
                    {step.warning && (
                      <div className="flex items-start gap-2 text-xs bg-red-500/10 text-red-400 rounded p-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{step.warning}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(data.solution.requires_restart || data.solution.requires_downtime) && (
              <div className="flex gap-2 mt-2">
                {data.solution.requires_restart && (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
                    Requer reinício
                  </Badge>
                )}
                {data.solution.requires_downtime && (
                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                    Requer downtime
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Escalation */}
        {data.follow_up?.escalation_needed && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Escalação necessária</span>
              {data.follow_up.escalation_level && (
                <Badge variant="outline" className="text-xs">{data.follow_up.escalation_level}</Badge>
              )}
            </div>
            {data.follow_up.escalation_reason && (
              <p className="text-sm text-orange-300">{data.follow_up.escalation_reason}</p>
            )}
          </div>
        )}

        {/* Need More Info */}
        {data.follow_up?.needs_more_info && data.follow_up.questions && data.follow_up.questions.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-400 mb-2">A IA precisa de mais informações:</p>
            <ul className="list-disc list-inside text-sm text-blue-300 space-y-1">
              {data.follow_up.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Prevention (collapsible) */}
        {data.prevention && (data.prevention.description || (data.prevention.recommended_actions && data.prevention.recommended_actions.length > 0)) && (
          <div>
            <button
              onClick={() => setShowPrevention(!showPrevention)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPrevention ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Prevenção
            </button>
            {showPrevention && (
              <div className="mt-2 bg-accent/30 rounded-lg p-3 space-y-2">
                {data.prevention.description && (
                  <p className="text-sm">{data.prevention.description}</p>
                )}
                {data.prevention.recommended_actions && data.prevention.recommended_actions.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {data.prevention.recommended_actions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <span className="text-xs text-muted-foreground">Esta resposta foi útil?</span>
          <Button
            variant={feedbackGiven === true ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleFeedback(true)}
            disabled={feedbackGiven !== null}
          >
            <ThumbsUp className="w-3 h-3 mr-1" />
            Útil
          </Button>
          <Button
            variant={feedbackGiven === false ? 'destructive' : 'ghost'}
            size="sm"
            onClick={() => handleFeedback(false)}
            disabled={feedbackGiven !== null}
          >
            <ThumbsDown className="w-3 h-3 mr-1" />
            Não útil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
