import { useState, useEffect, useRef } from 'react';
import {
  IconSearch,
  IconRefresh,
  IconPlayerStop,
  IconMessagePlus,
  IconMessage,
  IconSettings,
  IconLogout,
  IconDeviceDesktop,
} from '@tabler/icons-react';

interface MenuState {
  status: 'idle' | 'watching' | 'alert';
  windowName: string;
  elapsed: string;
  lastDuration: string;
  version: string;
}

declare global {
  interface Window {
    trayApi: {
      onMenuState: (cb: (state: MenuState) => void) => void;
      sendAction: (action: string) => void;
      setHeight: (height: number) => void;
    };
  }
}

export function TrayMenu() {
  const [state, setState] = useState<MenuState>({
    status: 'idle',
    windowName: '',
    elapsed: '0s',
    lastDuration: '',
    version: '0.1.0',
  });

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.trayApi.onMenuState((newState) => {
      setState(newState);
    });

    // Close on Escape
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.trayApi.sendAction('close');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Report height to main after every render so the window resizes
  useEffect(() => {
    if (rootRef.current) {
      window.trayApi.setHeight(rootRef.current.scrollHeight);
    }
  });

  const act = (action: string) => () => window.trayApi.sendAction(action);

  const statusLabel =
    state.status === 'watching' ? 'Observando' :
    state.status === 'alert'    ? 'Janela fechada' :
                                  'Descansando';

  return (
    <div className="tray-menu" ref={rootRef}>

      {/* ── Header ── */}
      <div className="menu-header">
        <div className="status-row">
          <span className={`status-dot ${state.status}`} />
          <span className="status-label">{statusLabel}</span>
          <span className="app-version">v{state.version}</span>
        </div>

        {state.status === 'watching' && (
          <div className="status-details">
            <div className="window-name">
              <IconDeviceDesktop size={12} stroke={1.5} />
              <span>{state.windowName}</span>
            </div>
            <div className="elapsed">{state.elapsed}</div>
          </div>
        )}

        {state.status === 'alert' && (
          <div className="status-details">
            <div className="window-name closed">
              <IconDeviceDesktop size={12} stroke={1.5} />
              <span>{state.windowName} (encerrado)</span>
            </div>
            <div className="elapsed faded">Monitorou por {state.lastDuration}</div>
          </div>
        )}
      </div>

      <div className="sep" />

      {/* ── Watch actions ── */}
      {state.status === 'idle' && (
        <MenuItem icon={<IconSearch size={16} stroke={1.5} />} label="Escolher janela para observar" onClick={act('select-window')} />
      )}
      {state.status === 'watching' && (
        <>
          <MenuItem icon={<IconRefresh size={16} stroke={1.5} />} label="Trocar janela" onClick={act('select-window')} />
          <MenuItem icon={<IconPlayerStop size={16} stroke={1.5} />} label="Parar monitoramento" onClick={act('stop-watching')} />
        </>
      )}
      {state.status === 'alert' && (
        <MenuItem icon={<IconSearch size={16} stroke={1.5} />} label="Escolher nova janela" onClick={act('select-window')} />
      )}

      <div className="sep" />

      {/* ── Chat ── */}
      <MenuItem icon={<IconMessagePlus size={16} stroke={1.5} />} label="Nova conversa" onClick={act('new-conversation')} />
      <MenuItem icon={<IconMessage size={16} stroke={1.5} />} label="Continuar última conversa" onClick={act('continue-conversation')} />

      <div className="sep" />

      {/* ── Footer ── */}
      <MenuItem icon={<IconSettings size={16} stroke={1.5} />} label="Configurações" onClick={act('open-settings')} />
      <MenuItem icon={<IconLogout size={16} stroke={1.5} />} label="Sair do Teki" onClick={act('quit')} danger />
    </div>
  );
}

// ── MenuItem ──────────────────────────────────────────────────────────────────

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button className={`menu-item${danger ? ' danger' : ''}`} onClick={onClick}>
      <span className="menu-item-icon">{icon}</span>
      <span className="menu-item-label">{label}</span>
    </button>
  );
}
