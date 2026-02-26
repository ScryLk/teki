'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { ContextPanel, type SupportContext } from '@/components/ContextPanel';
import { ChatArea, type Message } from '@/components/ChatArea';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { OnboardingBanner } from '@/components/auth/OnboardingBanner';
import { UsageNudge } from '@/components/billing/UsageNudge';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Search } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { PlanTier } from '@prisma/client';

const DEFAULT_CONTEXT: SupportContext = {
  sistema: '',
  versao: '',
  ambiente: 'producao',
  sistemaOperacional: 'Windows 11',
  mensagemErro: '',
  nivelTecnico: 'intermediario',
};

interface UsageInfo {
  current: number;
  limit: number;
  status: string;
}

export default function Teki() {
  const { data: session } = useSession();
  const [context, setContext] = useState<SupportContext>({ ...DEFAULT_CONTEXT });
  const [lastResponse, setLastResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Billing state
  const [planId, setPlanId] = useState<PlanTier>('FREE');
  const [messageUsage, setMessageUsage] = useState<UsageInfo | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Fetch usage on mount
  useEffect(() => {
    fetch('/api/v1/billing/usage')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setPlanId(data.plan.id);
          setMessageUsage(data.usage.messages);
        }
      })
      .catch(() => {});
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setLastResponse('');
  }, []);

  const handleClearContext = useCallback(() => {
    setContext((prev) => ({ ...DEFAULT_CONTEXT, nivelTecnico: prev.nivelTecnico }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Determine nudge state
  const showNudge =
    messageUsage &&
    !nudgeDismissed &&
    (messageUsage.status === 'warning' ||
      messageUsage.status === 'critical' ||
      messageUsage.status === 'exceeded');
  const nudgeType =
    messageUsage?.status === 'exceeded' ? 'exceeded' : 'warning';

  const sidebarContent = (
    <Tabs defaultValue="contexto" className="flex flex-col h-full">
      <TabsList className="mx-4 mt-3 flex-shrink-0">
        <TabsTrigger value="contexto" className="flex-1 gap-1.5 text-xs">
          <ClipboardList size={14} />
          Contexto
        </TabsTrigger>
        <TabsTrigger value="diagnostico" className="flex-1 gap-1.5 text-xs">
          <Search size={14} />
          Diagnostico
        </TabsTrigger>
      </TabsList>
      <TabsContent value="contexto" className="flex-1 overflow-hidden mt-0">
        <ContextPanel context={context} onChange={setContext} />
      </TabsContent>
      <TabsContent value="diagnostico" className="flex-1 overflow-hidden mt-0">
        <DiagnosticPanel lastResponse={lastResponse} />
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <Header
        onNewChat={handleNewChat}
        onClearContext={handleClearContext}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        planId={planId}
      />

      {/* Progressive profiling banner */}
      <OnboardingBanner
        onboardingStep={(session?.user as any)?.onboardingStep ?? -1}
        messageCount={messages.length}
        userName={session?.user?.name}
      />

      {/* Usage nudge */}
      {showNudge && messageUsage && (
        <UsageNudge
          type={nudgeType}
          current={messageUsage.current}
          limit={messageUsage.limit}
          onUpgrade={() => setUpgradeOpen(true)}
          onDismiss={
            nudgeType === 'warning'
              ? () => setNudgeDismissed(true)
              : undefined
          }
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <ChatArea
          context={context}
          onResponse={setLastResponse}
          messages={messages}
          setMessages={setMessages}
        />

        {/* Desktop sidebar */}
        {sidebarOpen && isDesktop && (
          <aside className="w-80 border-l bg-card flex-shrink-0 flex flex-col">
            {sidebarContent}
          </aside>
        )}

        {/* Mobile Sheet */}
        <Sheet open={sidebarOpen && !isDesktop} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-80 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        trigger="message_limit"
        currentPlanId={planId}
      />
    </div>
  );
}
