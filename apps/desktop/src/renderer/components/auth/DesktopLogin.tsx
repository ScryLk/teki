import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/app-store';
import { CatMascot } from '../cat/CatMascot';

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
  const [logoHappy, setLogoHappy] = useState(false);
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
        setLogoHappy(true);
        setTimeout(() => setAuth(true, data.email || null, data.name || null), 600);
      } else if (data.status === 'expired') {
        setError('Código expirado. Tente novamente.');
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
        setLogoHappy(true);
        const status = await window.tekiAPI.getAuthStatus();
        setTimeout(() => setAuth(true, status.email, status.name), 600);
      } else {
        setError(result.error || 'Email ou senha incorretos.');
      }
    } catch {
      setError('Erro de conexão. Verifique se o servidor está rodando.');
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
      setError('Erro ao iniciar autenticação. Verifique sua conexão.');
      setAuthState('idle');
    }
  };

  const handleApiKey = async () => {
    setError(null);
    if (!apiKeyInput.trim()) return;

    try {
      const success = await window.tekiAPI.setApiKey(apiKeyInput.trim());
      if (success) {
        setLogoHappy(true);
        const status = await window.tekiAPI.getAuthStatus();
        setTimeout(() => setAuth(true, status.email, status.name), 600);
      } else {
        setError('API key inválida. Verifique e tente novamente.');
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
    <div className="relative flex items-center justify-center h-full bg-bg p-4 select-none overflow-hidden">
      {/* Cat mascot - bottom right */}
      <div className="absolute bottom-4 right-4 pointer-events-none opacity-80">
        <CatMascot state={logoHappy ? 'happy' : 'idle'} size="md" />
      </div>

      <div className="relative max-w-sm w-full space-y-3">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Teki</h1>
          <p className="text-xs text-text-muted">
            Assistente IA para Suporte Técnico
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            className="flex items-center gap-2.5 text-red-400 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Idle state */}
          {authState === 'idle' && (
            <>
              {/* Email + Password form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary ml-0.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full h-11 px-4 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-all"
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary ml-0.5">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full h-11 px-4 text-sm bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-11 bg-accent text-white rounded-xl font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Entrando...
                    </span>
                  ) : 'Entrar'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-text-muted">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Browser auth button */}
              <button
                onClick={handleDeviceFlow}
                className="w-full h-10 bg-bg border border-border text-text-secondary rounded-xl text-sm font-medium hover:text-text-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Entrar via navegador
              </button>

              {/* Advanced: API key */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showAdvanced ? 'Ocultar' : 'Usar API key'}
                </button>

                {showAdvanced && (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="tk_live_..."
                      className="flex-1 h-9 px-3 text-xs bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none font-mono transition-all"
                    />
                    <button
                      onClick={handleApiKey}
                      disabled={!apiKeyInput.trim()}
                      className="h-9 px-4 text-xs rounded-lg text-accent disabled:opacity-40 transition-all"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
                    >
                      Validar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Device flow state */}
          {authState === 'device_flow' && (
            <div className="space-y-5 py-2">
              <p className="text-sm text-text-secondary text-center">
                Seu código de acesso:
              </p>

              <div className="flex items-center justify-center gap-1.5">
                {userCode ? (
                  <>
                    {userCode.split('-')[0]?.split('').map((char, i) => (
                      <span
                        key={`a${i}`}
                        className="w-10 h-12 flex items-center justify-center text-xl font-mono font-bold text-text-primary bg-bg border border-border rounded-xl"
                      >
                        {char}
                      </span>
                    ))}
                    <span className="text-text-muted opacity-50 mx-1 text-xl font-light">-</span>
                    {userCode.split('-')[1]?.split('').map((char, i) => (
                      <span
                        key={`b${i}`}
                        className="w-10 h-12 flex items-center justify-center text-xl font-mono font-bold text-text-primary bg-bg border border-border rounded-xl"
                      >
                        {char}
                      </span>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Gerando código...
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Acesse{' '}
                  <span className="text-accent font-semibold">
                    teki.com.br/auth/device
                  </span>
                  <br />
                  e digite este código.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Aguardando autorização
                  <span className="text-text-muted opacity-50">
                    ({formatTime(countdown)})
                  </span>
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="w-full text-xs text-text-muted hover:text-text-secondary transition-colors py-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-text-muted opacity-40">
          v1.0 &middot; teki.com.br
        </p>
      </div>
    </div>
  );
};

export default DesktopLogin;
