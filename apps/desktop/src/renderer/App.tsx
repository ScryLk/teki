import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import TitleBar from './components/layout/TitleBar';
import StatusBar from './components/layout/StatusBar';
import SplitLayout from './components/layout/SplitLayout';
import ChatPanel from './components/chat/ChatPanel';
import ScreenViewer from './components/screen/ScreenViewer';
import CommandPalette from './components/command-palette/CommandPalette';
import SettingsModal from './components/settings/SettingsModal';
import DesktopLogin from './components/auth/DesktopLogin';
import ConnectionAlert from './components/connection/ConnectionAlert';
import { useConnectionHealth } from './hooks/useConnectionHealth';

const App: React.FC = () => {
  const layout = useAppStore((s) => s.layout);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setAuth = useAppStore((s) => s.setAuth);
  const setLayout = useAppStore((s) => s.setLayout);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);

  useConnectionHealth();

  const clearAuth = useAppStore((s) => s.clearAuth);

  // Check auth status on mount
  useEffect(() => {
    if (window.tekiAPI?.getAuthStatus) {
      window.tekiAPI.getAuthStatus().then((status) => {
        setAuth(status.isAuthenticated, status.email, status.name, status.plan);
      });
    }
  }, [setAuth]);

  // Listen for auth expiration — auto-redirect to login
  useEffect(() => {
    const unsub = window.tekiAPI?.onAuthExpired?.(() => {
      clearAuth();
    });
    return () => unsub?.();
  }, [clearAuth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === '1') {
        e.preventDefault();
        setLayout('split');
      } else if (isCtrl && e.key === '2') {
        e.preventDefault();
        setLayout('chat-only');
      } else if (isCtrl && e.key === '3') {
        e.preventDefault();
        setLayout('screen-only');
      } else if (isCtrl && e.key === '4') {
        e.preventDefault();
        setLayout('compact');
      } else if (isCtrl && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      } else if (isCtrl && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLayout, setSettingsOpen, toggleCommandPalette]);

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

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col bg-bg">
        <TitleBar />
        <main className="flex-1 overflow-hidden">
          <DesktopLogin />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      <TitleBar />
      <ConnectionAlert />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
      <StatusBar />
      {commandPaletteOpen && <CommandPalette />}
      {settingsOpen && <SettingsModal />}
    </div>
  );
};

export default App;
