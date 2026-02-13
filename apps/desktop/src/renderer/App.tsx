import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import TitleBar from './components/layout/TitleBar';
import StatusBar from './components/layout/StatusBar';
import SplitLayout from './components/layout/SplitLayout';
import ChatPanel from './components/chat/ChatPanel';
import ScreenViewer from './components/screen/ScreenViewer';
import CommandPalette from './components/command-palette/CommandPalette';

const App: React.FC = () => {
  const layout = useAppStore((s) => s.layout);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setLayout = useAppStore((s) => s.setLayout);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === '1') {
        e.preventDefault();
        setLayout('chat-only');
      } else if (isCtrl && e.key === '2') {
        e.preventDefault();
        setLayout('screen-only');
      } else if (isCtrl && e.key === '3') {
        e.preventDefault();
        setLayout('compact');
      } else if (isCtrl && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLayout, toggleCommandPalette]);

  const renderContent = () => {
    switch (layout) {
      case 'split':
        return (
          <SplitLayout
            leftPanel={<ScreenViewer />}
            rightPanel={<ChatPanel />}
          />
        );
      case 'chat-only':
        return <ChatPanel />;
      case 'screen-only':
        return <ScreenViewer />;
      case 'compact':
        return (
          <div className="flex h-full">
            <div className="w-[400px] border-r border-border">
              <ChatPanel />
            </div>
          </div>
        );
      default:
        return (
          <SplitLayout
            leftPanel={<ScreenViewer />}
            rightPanel={<ChatPanel />}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg">
      <TitleBar />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      <StatusBar />
      {commandPaletteOpen && <CommandPalette />}
    </div>
  );
};

export default App;
