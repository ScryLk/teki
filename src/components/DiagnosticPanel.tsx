'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Wrench,
  AlertTriangle,
  FileText,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface DiagnosticPanelProps {
  lastResponse: string;
}

export function DiagnosticPanel({ lastResponse }: DiagnosticPanelProps) {
  const diagnostic = lastResponse ? parseDiagnostic(lastResponse) : null;
  const hasSections =
    diagnostic &&
    (diagnostic.diagnostico ||
      diagnostic.passos.length > 0 ||
      diagnostic.alertas.length > 0 ||
      diagnostic.referencias.length > 0 ||
      diagnostic.perguntas.length > 0);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {!hasSections ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Search size={16} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Envie uma mensagem para ver o diagnostico
            </p>
          </div>
        ) : (
          <>
            {diagnostic.diagnostico && (
              <DiagnosticSection
                icon={<Search size={14} />}
                title="Diagnostico"
                badgeLabel="info"
                badgeVariant="default"
                borderColor="border-l-blue-500"
                defaultOpen
              >
                <p className="text-sm text-card-foreground/80 leading-relaxed">
                  {diagnostic.diagnostico}
                </p>
              </DiagnosticSection>
            )}

            {diagnostic.passos.length > 0 && (
              <DiagnosticSection
                icon={<Wrench size={14} />}
                title="Procedimento"
                badgeLabel={`${diagnostic.passos.length} passos`}
                badgeVariant="secondary"
                borderColor="border-l-emerald-500"
                defaultOpen
              >
                <ol className="space-y-2">
                  {diagnostic.passos.map((passo, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-card-foreground/80">
                        {passo}
                      </span>
                    </li>
                  ))}
                </ol>
              </DiagnosticSection>
            )}

            {diagnostic.alertas.length > 0 && (
              <DiagnosticSection
                icon={<AlertTriangle size={14} />}
                title="Alertas"
                badgeLabel={`${diagnostic.alertas.length}`}
                badgeVariant="destructive"
                borderColor="border-l-amber-500"
                defaultOpen
              >
                <ul className="space-y-1.5">
                  {diagnostic.alertas.map((alerta, i) => (
                    <li
                      key={i}
                      className="text-sm text-card-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">
                        *
                      </span>
                      <span>{alerta}</span>
                    </li>
                  ))}
                </ul>
              </DiagnosticSection>
            )}

            {diagnostic.referencias.length > 0 && (
              <DiagnosticSection
                icon={<FileText size={14} />}
                title="Fontes"
                badgeLabel="refs"
                badgeVariant="outline"
                borderColor="border-l-zinc-500"
                defaultOpen
              >
                <ul className="space-y-1">
                  {diagnostic.referencias.map((ref, i) => (
                    <li key={i} className="text-sm text-primary">
                      {ref}
                    </li>
                  ))}
                </ul>
              </DiagnosticSection>
            )}

            {diagnostic.perguntas.length > 0 && (
              <DiagnosticSection
                icon={<HelpCircle size={14} />}
                title="Perguntar ao Usuario"
                badgeLabel={`${diagnostic.perguntas.length}`}
                badgeVariant="secondary"
                borderColor="border-l-purple-500"
                defaultOpen
              >
                <ul className="space-y-1.5">
                  {diagnostic.perguntas.map((pergunta, i) => (
                    <li
                      key={i}
                      className="text-sm text-card-foreground/80"
                    >
                      {pergunta}
                    </li>
                  ))}
                </ul>
              </DiagnosticSection>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
}

function DiagnosticSection({
  icon,
  title,
  badgeLabel,
  badgeVariant,
  borderColor,
  defaultOpen = true,
  children,
}: {
  icon: ReactNode;
  title: string;
  badgeLabel: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  borderColor: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={`border-l-4 ${borderColor}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <CardTitle className="text-xs font-medium uppercase tracking-wide">
                  {title}
                </CardTitle>
                <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                  {badgeLabel}
                </Badge>
              </div>
              <ChevronDown
                size={14}
                className={`text-muted-foreground transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-3 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function parseDiagnostic(content: string) {
  const sections = {
    diagnostico: '',
    passos: [] as string[],
    alertas: [] as string[],
    referencias: [] as string[],
    perguntas: [] as string[],
  };

  const diagMatch = content.match(
    /###\s*(?:🔍\s*)?Diag[nó]stic[oa]?\s*\n([\s\S]*?)(?=\n###|$)/i
  );
  if (diagMatch) sections.diagnostico = diagMatch[1].trim();

  const passosMatch = content.match(
    /###\s*(?:🛠️\s*)?(?:Procedimento|Passos|Solu[cç][aã]o|Recommended).*?\n([\s\S]*?)(?=\n###|$)/i
  );
  if (passosMatch) {
    sections.passos = passosMatch[1]
      .split('\n')
      .filter((line) => line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim())
      .filter(Boolean);
  }

  const alertasMatch = content.match(
    /###\s*(?:⚠️\s*)?Alert[aes]*\s*\n([\s\S]*?)(?=\n###|$)/i
  );
  if (alertasMatch) {
    sections.alertas = alertasMatch[1]
      .split('\n')
      .filter(
        (line) => line.trim().startsWith('-') || line.trim().startsWith('*')
      )
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  const refMatch = content.match(
    /###\s*(?:📋\s*)?(?:Refer[eê]ncias|Fontes|References).*?\n([\s\S]*?)(?=\n###|$)/i
  );
  if (refMatch) {
    sections.referencias = refMatch[1]
      .split('\n')
      .filter(
        (line) => line.trim().startsWith('-') || line.trim().startsWith('*')
      )
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  const perguntasMatch = content.match(
    /###\s*(?:❓\s*)?(?:Perguntas|Questions).*?\n([\s\S]*?)(?=\n###|$)/i
  );
  if (perguntasMatch) {
    sections.perguntas = perguntasMatch[1]
      .split('\n')
      .filter(
        (line) => line.trim().startsWith('-') || line.trim().startsWith('*')
      )
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  return sections;
}
