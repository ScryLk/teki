import { Header } from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <Header showChatControls={false} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
