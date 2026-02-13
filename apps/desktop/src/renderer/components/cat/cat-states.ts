export type CatState = 'idle' | 'watching' | 'thinking' | 'happy' | 'alert' | 'sleeping';

export interface CatStateConfig {
  label: string;
  eyeStyle: 'semiclosed' | 'open' | 'blinking' | 'closed-happy' | 'wide' | 'closed';
  eyeColor: string;
  tailAnimation: 'none' | 'slow' | 'fast';
  bodyAnimation: 'sitting' | 'attentive' | 'paw-chin' | 'smiling' | 'ears-up' | 'lying';
  bubble?: string;
}

export const CAT_STATES: Record<CatState, CatStateConfig> = {
  idle: {
    label: 'Relaxando',
    eyeStyle: 'semiclosed',
    eyeColor: '#17c964',
    tailAnimation: 'none',
    bodyAnimation: 'sitting',
  },
  watching: {
    label: 'Observando',
    eyeStyle: 'open',
    eyeColor: '#17c964',
    tailAnimation: 'slow',
    bodyAnimation: 'attentive',
  },
  thinking: {
    label: 'Pensando',
    eyeStyle: 'blinking',
    eyeColor: '#17c964',
    tailAnimation: 'none',
    bodyAnimation: 'paw-chin',
    bubble: '...',
  },
  happy: {
    label: 'Feliz',
    eyeStyle: 'closed-happy',
    eyeColor: '#17c964',
    tailAnimation: 'fast',
    bodyAnimation: 'smiling',
  },
  alert: {
    label: 'Alerta',
    eyeStyle: 'wide',
    eyeColor: '#f5a524',
    tailAnimation: 'none',
    bodyAnimation: 'ears-up',
    bubble: '!',
  },
  sleeping: {
    label: 'Dormindo',
    eyeStyle: 'closed',
    eyeColor: '#17c964',
    tailAnimation: 'none',
    bodyAnimation: 'lying',
    bubble: 'zzz',
  },
};
