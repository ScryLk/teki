'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ContextPanel, type SupportContext } from '@/components/ContextPanel';
import { ChatArea, type Message } from '@/components/ChatArea';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Search } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

const DEFAULT_CONTEXT: SupportContext = {
  sistema: '',
  versao: '',
  ambiente: 'producao',
  sistemaOperacional: 'Windows 11',
  mensagemErro: '',
  nivelTecnico: 'intermediario',
};

export default function Teki() {
  const [context, setContext] = useState<SupportContext>({ ...DEFAULT_CONTEXT });
  const [lastResponse, setLastResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

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
      />

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
    </div>
  );
}
