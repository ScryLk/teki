import React, { useEffect, useState } from 'react';
import type { ConnectorPlatform, TestStep } from './types';
import { ERROR_MESSAGES, PLATFORM_META } from './types';
import { CatMascot } from '../cat/CatMascot';
import type { CatState } from '../cat/cat-states';

interface ConnectionTesterProps {
  platform: ConnectorPlatform;
  onSuccess: () => void;
  onError?: (errorKey: string) => void;
}

const TEST_STEPS: Record<ConnectorPlatform, string[]> = {
  glpi: [
    'Conectando ao servidor...',
    'Autenticando com API tokens...',
    'Detectando versão...',
    'Buscando tickets...',
    'Verificando permissões...',
    'Carregando categorias...',
    'Mapeando usuários...',
  ],
  zendesk: [
    'Conectando ao Zendesk...',
    'Autenticando...',
    'Verificando plano...',
    'Buscando tickets...',
    'Verificando permissões...',
    'Mapeando agentes...',
  ],
  freshdesk: [
    'Conectando ao Freshdesk...',
    'Validando API Key...',
    'Buscando tickets...',
    'Verificando permissões...',
    'Carregando categorias...',
    'Mapeando agentes...',
  ],
  otrs: [
    'Conectando ao OTRS...',
    'Autenticando...',
    'Detectando versão...',
    'Buscando tickets...',
    'Verificando permissões...',
    'Mapeando agentes...',
  ],
};

const SUCCESS_DETAILS: Record<ConnectorPlatform, Record<number, string>> = {
  glpi: {
    2: 'Versão detectada: GLPI 10.0.16',
    3: '47 tickets encontrados',
    4: 'Permissões OK (tickets, usuários, categorias)',
    5: '12 categorias carregadas',
    6: '8 técnicos mapeados por email',
  },
  zendesk: {
    2: 'Suite Professional detectado',
    3: '34 tickets encontrados',
    4: 'Permissões OK',
    5: '6 agentes mapeados',
  },
  freshdesk: {
    2: '28 tickets encontrados',
    3: 'Permissões OK',
    4: '8 categorias carregadas',
    5: '5 agentes mapeados',
  },
  otrs: {
    2: 'OTRS 6.0.42 detectado',
    3: '52 tickets encontrados',
    4: 'Permissões OK',
    5: '10 agentes mapeados',
  },
};

const CAT_STATE_MAP: Record<string, CatState> = {
  starting: 'thinking',
  connecting: 'watching',
  authenticating: 'thinking',
  running: 'watching',
  success: 'happy',
  error: 'alert',
};

type TestResult = 'running' | 'success' | 'error';

const ConnectionTester: React.FC<ConnectionTesterProps> = ({ platform, onSuccess, onError }) => {
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [result, setResult] = useState<TestResult>('running');
  const [catState, setCatState] = useState<CatState>('thinking');
  const [errorKey] = useState<string | null>(null);

  const stepLabels = TEST_STEPS[platform];

  useEffect(() => {
    // Initialize steps
    const initial: TestStep[] = stepLabels.map((label) => ({
      label,
      status: 'pending',
    }));
    setSteps(initial);
    setCurrentIdx(0);
    setResult('running');
    setCatState('thinking');
  }, [platform]);

  useEffect(() => {
    if (currentIdx < 0 || currentIdx >= stepLabels.length) return;

    // Mark current step as running
    setSteps((prev) => prev.map((s, i) => i === currentIdx ? { ...s, status: 'running' } : s));

    // Update cat state based on step
    if (currentIdx === 0) setCatState('watching');
    else if (currentIdx === 1) setCatState('thinking');
    else setCatState('watching');

    // Simulate step completion
    const delay = 400 + Math.random() * 600;
    const timer = setTimeout(() => {
      const time = Math.round(50 + Math.random() * 200);
      const detail = SUCCESS_DETAILS[platform]?.[currentIdx];

      setSteps((prev) => prev.map((s, i) =>
        i === currentIdx
          ? { ...s, status: 'success', time, detail: detail ?? s.label.replace('...', '') }
          : s
      ));

      if (currentIdx < stepLabels.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // All done
        setResult('success');
        setCatState('happy');
        onSuccess();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIdx, stepLabels.length, platform, onSuccess]);

  const platformMeta = PLATFORM_META.find((p) => p.id === platform);
  const errorGuide = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <div>
      {/* Cat mascot */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <CatMascot state={catState} size="md" className="!static" />
        </div>
      </div>

      {/* Test steps */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4 space-y-0">
        <h4 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-3">Teste de conexão</h4>
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 py-2 transition-all duration-300 ${
              step.status === 'pending' ? 'opacity-40' : 'opacity-100'
            }`}
            style={{
              animation: step.status !== 'pending' ? `slideDown 0.3s ease ${i * 0.1}s both` : undefined,
            }}
          >
            {/* Status icon */}
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {step.status === 'success' && (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#17c964" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {step.status === 'running' && (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#2A8F9D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {step.status === 'error' && (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f31260" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
              {step.status === 'pending' && (
                <span className="w-2 h-2 rounded-full bg-[#3f3f46]" />
              )}
            </span>

            {/* Label */}
            <span className={`flex-1 text-sm ${
              step.status === 'success' ? 'text-[#fafafa]'
                : step.status === 'running' ? 'text-[#fafafa]'
                  : step.status === 'error' ? 'text-[#f31260]'
                    : 'text-[#52525b]'
            }`}>
              {step.detail && step.status === 'success' ? step.detail : step.label}
            </span>

            {/* Timing */}
            {step.time != null && (
              <span className="text-xs text-[#52525b] flex-shrink-0">{step.time}ms</span>
            )}
          </div>
        ))}
      </div>

      {/* Success summary */}
      {result === 'success' && (
        <div className="mt-4 rounded-xl border border-[#27272a] bg-[#18181b] p-4">
          <h4 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-3">Resumo</h4>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#17c964]" />
              <span className="text-[#fafafa] font-medium">{platformMeta?.name} {platform === 'glpi' ? '10.0.16' : ''}</span>
            </span>
            <span className="text-[#52525b]">|</span>
            <span className="text-[#a1a1aa]">47 tickets</span>
            <span className="text-[#52525b]">|</span>
            <span className="text-[#a1a1aa]">12 categorias</span>
            <span className="text-[#52525b]">|</span>
            <span className="text-[#a1a1aa]">8 users</span>
          </div>
          <div className="mt-3 text-xs text-[#71717a]">
            <p>Field mappings: configuração padrão aplicada</p>
            <p className="mt-0.5">Você pode ajustar os mapeamentos depois em Integrações.</p>
          </div>
        </div>
      )}

      {/* Error guide */}
      {result === 'error' && errorGuide && (
        <div className="mt-4 rounded-xl border border-[#f31260]/30 bg-[#f31260]/5 p-4">
          <h4 className="text-sm font-medium text-[#f31260] mb-2">{errorGuide.title}</h4>
          <p className="text-xs text-[#a1a1aa] mb-2">Verifique se:</p>
          <ul className="space-y-1">
            {errorGuide.steps.map((step, i) => (
              <li key={i} className="text-xs text-[#a1a1aa] flex items-start gap-1.5">
                <span className="text-[#71717a] mt-0.5">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {errorKey && (
            <p className="text-[10px] text-[#52525b] font-mono mt-3">Erro: {errorKey}</p>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionTester;
