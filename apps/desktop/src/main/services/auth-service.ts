import { BrowserWindow, shell } from 'electron';
import settingsStore from './settings-store';

const API_BASE =
  process.env.TEKI_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://teki.com.br');

console.log('[AUTH] NODE_ENV:', process.env.NODE_ENV, '| API_BASE:', API_BASE);

interface DeviceCodeResponse {
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  expiresIn: number;
}

interface PollResponse {
  status: 'pending' | 'authorized' | 'expired' | 'denied';
  apiKey?: string;
  email?: string;
  name?: string;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export async function startDeviceFlow(
  mainWindow: BrowserWindow,
): Promise<{ userCode: string; deviceCode: string }> {
  // Cancel any existing flow
  cancelDeviceFlow();

  const res = await fetch(`${API_BASE}/api/auth/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAgent: `Teki Desktop/${process.env.npm_package_version || '0.1.0'}`,
    }),
  });

  if (!res.ok) {
    throw new Error('Falha ao iniciar autenticacao');
  }

  const data: DeviceCodeResponse = await res.json();

  // Open browser for authorization
  shell.openExternal(`${data.verificationUrl}`);

  // Start polling every 3 seconds
  pollingInterval = setInterval(async () => {
    try {
      const pollRes = await fetch(
        `${API_BASE}/api/auth/device/poll?deviceCode=${data.deviceCode}`,
      );

      if (!pollRes.ok) return;

      const pollData: PollResponse = await pollRes.json();

      switch (pollData.status) {
        case 'authorized': {
          cancelDeviceFlow();

          if (pollData.apiKey) {
            await saveAuth(pollData.apiKey);
          }

          mainWindow.webContents.send('auth:device:status', {
            status: 'authorized',
            email: settingsStore.get('authEmail' as never),
            name: settingsStore.get('authName' as never),
          });
          break;
        }
        case 'expired':
        case 'denied': {
          cancelDeviceFlow();
          mainWindow.webContents.send('auth:device:status', {
            status: pollData.status,
          });
          break;
        }
        // 'pending' — continue polling
      }
    } catch {
      // Network error — continue polling
    }
  }, 3000);

  return {
    userCode: data.userCode,
    deviceCode: data.deviceCode,
  };
}

export function cancelDeviceFlow(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/desktop-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error?.message || 'Erro ao autenticar.' };
    }

    if (data.apiKey) {
      const saved = await saveAuth(data.apiKey);
      if (!saved) {
        return { success: false, error: 'Erro ao salvar credenciais.' };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Erro de conexao. Verifique se o servidor esta rodando.' };
  }
}

export async function setApiKeyManually(key: string): Promise<boolean> {
  if (!key.startsWith('tk_live_') && !key.startsWith('tk_test_')) {
    throw new Error('Formato de API key invalido. Deve comecar com tk_live_ ou tk_test_');
  }

  return saveAuth(key);
}

async function saveAuth(apiKey: string): Promise<boolean> {
  // Validate key by fetching user profile
  try {
    const res = await fetch(`${API_BASE}/api/v1/user`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error('API key invalida ou expirada');
    }

    const profile: UserProfile = await res.json();

    settingsStore.set('authApiKey' as never, apiKey as never);
    settingsStore.set('authEmail' as never, profile.email as never);
    settingsStore.set(
      'authName' as never,
      (profile.displayName || profile.firstName) as never,
    );
    settingsStore.set('authAuthenticatedAt' as never, new Date().toISOString() as never);

    return true;
  } catch {
    return false;
  }
}

export function logout(): void {
  settingsStore.set('authApiKey' as never, null as never);
  settingsStore.set('authEmail' as never, null as never);
  settingsStore.set('authName' as never, null as never);
  settingsStore.set('authAuthenticatedAt' as never, null as never);
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  email: string | null;
  name: string | null;
}> {
  const apiKey = settingsStore.get('authApiKey' as never) as string | null;

  if (!apiKey) {
    return { isAuthenticated: false, email: null, name: null };
  }

  // Verify key is still valid
  try {
    const res = await fetch(`${API_BASE}/api/v1/user`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      return {
        isAuthenticated: true,
        email: settingsStore.get('authEmail' as never) as string | null,
        name: settingsStore.get('authName' as never) as string | null,
      };
    }

    // Key revoked/expired — clear auth
    logout();
    return { isAuthenticated: false, email: null, name: null };
  } catch {
    // Network error — assume still authenticated (offline mode)
    return {
      isAuthenticated: true,
      email: settingsStore.get('authEmail' as never) as string | null,
      name: settingsStore.get('authName' as never) as string | null,
    };
  }
}
