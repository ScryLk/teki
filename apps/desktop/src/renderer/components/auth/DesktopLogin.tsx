import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/app-store';

type AuthState = 'idle' | 'device_flow';

const DesktopLogin: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userCode, setUserCode] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const setAuth = useAppStore((s) => s.setAuth);

  // Listen for auth status from main process
  useEffect(() => {
    if (!window.tekiAPI) return;

    const cleanup = window.tekiAPI.onAuthStatus?.((data: {
      status: string;
      email?: string;
      name?: string;
    }) => {
      if (data.status === 'authorized') {
        setAuth(true, data.email || null, data.name || null);
      } else if (data.status === 'expired') {
        setError('Codigo expirado. Tente novamente.');
        setAuthState('idle');
      } else if (data.status === 'denied') {
        setError('Acesso negado.');
        setAuthState('idle');
      }
    });

    return cleanup;
  }, [setAuth]);

  // Countdown timer for device flow
  useEffect(() => {
    if (authState !== 'device_flow') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [authState]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      const result = await window.tekiAPI.loginWithCredentials(email, password);
      if (result.success) {
        const status = await window.tekiAPI.getAuthStatus();
        setAuth(true, status.email, status.name);
      } else {
        setError(result.error || 'Email ou senha incorretos.');
      }
    } catch {
      setError('Erro de conexao. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceFlow = async () => {
    setError(null);
    setAuthState('device_flow');
    setCountdown(600);

    try {
      const result = await window.tekiAPI.startDeviceAuth();
      setUserCode(result.userCode);
    } catch {
      setError('Erro ao iniciar autenticacao. Verifique sua conexao.');
      setAuthState('idle');
    }
  };

  const handleApiKey = async () => {
    setError(null);
    if (!apiKeyInput.trim()) return;

    try {
      const success = await window.tekiAPI.setApiKey(apiKeyInput.trim());
      if (success) {
        const status = await window.tekiAPI.getAuthStatus();
        setAuth(true, status.email, status.name);
      } else {
        setError('API key invalida. Verifique e tente novamente.');
      }
    } catch {
      setError('Erro ao validar API key.');
    }
  };

  const handleCancel = () => {
    window.tekiAPI.cancelDeviceAuth?.();
    setAuthState('idle');
    setUserCode('');
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-bg p-8">
      <div className="max-w-sm w-full space-y-6 text-center">
        {/* Logo */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">Teki</h1>
          <p className="text-sm text-text-secondary">
            Assistente IA para Suporte Tecnico
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* Idle state */}
        {authState === 'idle' && (
          <div className="space-y-4">
            {/* Email + Password form (primary) */}
            <form onSubmit={handleCredentialsLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-11 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg px-2 text-text-secondary">ou</span>
              </div>
            </div>

            {/* Browser auth button */}
            <button
              onClick={handleDeviceFlow}
              className="w-full h-10 bg-surface border border-border text-text-primary rounded-lg text-sm font-medium hover:border-accent transition-colors"
            >
              Entrar via navegador
            </button>

            {/* Advanced: API key */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {showAdvanced ? 'Ocultar API key' : 'Usar API key'}
              </button>

              {showAdvanced && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="tk_live_..."
                    className="flex-1 h-9 px-3 text-sm bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleApiKey}
                    disabled={!apiKeyInput.trim()}
                    className="h-9 px-4 text-sm bg-surface border border-border rounded-md text-text-primary hover:border-accent disabled:opacity-50 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Device flow state */}
        {authState === 'device_flow' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Codigo de acesso:</p>

            <div className="flex items-center justify-center gap-1 text-3xl font-mono font-bold text-text-primary tracking-widest">
              {userCode ? (
                <>
                  {userCode.split('-')[0]?.split('').map((char, i) => (
                    <span
                      key={`a${i}`}
                      className="w-10 h-12 flex items-center justify-center bg-surface border border-border rounded-lg"
                    >
                      {char}
                    </span>
                  ))}
                  <span className="text-text-muted mx-1">-</span>
                  {userCode.split('-')[1]?.split('').map((char, i) => (
                    <span
                      key={`b${i}`}
                      className="w-10 h-12 flex items-center justify-center bg-surface border border-border rounded-lg"
                    >
                      {char}
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-base text-text-muted">
                  Gerando codigo...
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text-secondary">
                Abra{' '}
                <span className="text-accent font-medium">
                  teki.com.br/auth/device
                </span>{' '}
                no navegador e digite este codigo.
              </p>
              <p className="text-xs text-text-muted animate-pulse">
                Aguardando autorizacao...
              </p>
              <p className="text-xs text-text-muted">
                Expira em {formatTime(countdown)}
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopLogin;
