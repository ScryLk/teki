import { Header } from '@/components/Header';

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header showChatControls={false} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
