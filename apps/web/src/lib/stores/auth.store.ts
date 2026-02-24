import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
}

// BroadcastChannel for cross-tab session sync
let channel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel('teki-auth');
    } catch {
      // BroadcastChannel not supported
      return null;
    }
  }
  return channel;
}

export const useAuthStore = create<AuthState>((set) => {
  // Listen for auth events from other tabs
  if (typeof window !== 'undefined') {
    const ch = getBroadcastChannel();
    ch?.addEventListener('message', (event) => {
      const { type, payload } = event.data ?? {};
      switch (type) {
        case 'LOGIN':
          set({
            user: payload,
            isAuthenticated: true,
            sessionExpired: false,
          });
          break;
        case 'LOGOUT':
          set({
            user: null,
            isAuthenticated: false,
            sessionExpired: false,
          });
          break;
        case 'SESSION_EXPIRED':
          set({ sessionExpired: true });
          break;
      }
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    sessionExpired: false,

    setUser: (user) => {
      set({ user, isAuthenticated: true, sessionExpired: false });
      getBroadcastChannel()?.postMessage({ type: 'LOGIN', payload: user });
    },

    clearUser: () => {
      set({ user: null, isAuthenticated: false });
      getBroadcastChannel()?.postMessage({ type: 'LOGOUT' });
    },

    setLoading: (isLoading) => set({ isLoading }),

    setSessionExpired: (sessionExpired) => {
      set({ sessionExpired });
      if (sessionExpired) {
        getBroadcastChannel()?.postMessage({ type: 'SESSION_EXPIRED' });
      }
    },
  };
});
