import { useState, useCallback } from 'react';
import type { AiProviderId, ApiKeyValidationResult, ApiKeyStatus } from '@teki/shared';

interface UseApiKeyValidationReturn {
  status: ApiKeyStatus;
  result: ApiKeyValidationResult | null;
  isValidating: boolean;
  validate: (key: string) => Promise<ApiKeyValidationResult>;
  clear: () => Promise<void>;
}

const SETTINGS_KEY: Record<AiProviderId, string> = {
  gemini:    'geminiApiKey',
  openai:    'openaiApiKey',
  anthropic: 'anthropicApiKey',
  ollama:    'ollamaBaseUrl',
};

const STATUS_KEY: Record<AiProviderId, string> = {
  gemini:    'geminiKeyStatus',
  openai:    'openaiKeyStatus',
  anthropic: 'anthropicKeyStatus',
  ollama:    'ollamaKeyStatus',
};

/**
 * Hook that validates and persists an AI provider API key via IPC.
 *
 * Usage:
 *   const { status, result, isValidating, validate, clear } = useApiKeyValidation('anthropic');
 *   await validate('sk-ant-...');
 */
export function useApiKeyValidation(
  provider: AiProviderId,
  initialStatus: ApiKeyStatus = 'unconfigured'
): UseApiKeyValidationReturn {
  const [status, setStatus] = useState<ApiKeyStatus>(initialStatus);
  const [result, setResult] = useState<ApiKeyValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (key: string): Promise<ApiKeyValidationResult> => {
    if (!key.trim()) {
      const empty: ApiKeyValidationResult = {
        valid: false,
        provider,
        error: 'Chave não pode ser vazia.',
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
      };
      setStatus('invalid');
      setResult(empty);
      return empty;
    }

    setIsValidating(true);
    setStatus('validating');

    try {
      const res = await window.tekiAPI.validateApiKey(provider, key);

      if (res.valid) {
        await window.tekiAPI.setSetting(SETTINGS_KEY[provider], key);
        await window.tekiAPI.setSetting(STATUS_KEY[provider], 'valid');
        setStatus('valid');
      } else {
        await window.tekiAPI.setSetting(STATUS_KEY[provider], 'invalid');
        setStatus('invalid');
      }

      setResult(res);
      return res;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro na validação.';
      const errRes: ApiKeyValidationResult = {
        valid: false,
        provider,
        error: msg,
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
      };
      setStatus('invalid');
      setResult(errRes);
      return errRes;
    } finally {
      setIsValidating(false);
    }
  }, [provider]);

  const clear = useCallback(async () => {
    await window.tekiAPI.setSetting(SETTINGS_KEY[provider], '');
    await window.tekiAPI.setSetting(STATUS_KEY[provider], 'unconfigured');
    setStatus('unconfigured');
    setResult(null);
  }, [provider]);

  return { status, result, isValidating, validate, clear };
}
