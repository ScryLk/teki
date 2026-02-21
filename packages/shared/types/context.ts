export interface SupportContext {
  sistema?: string;
  versao?: string;
  ambiente?: 'producao' | 'homologacao' | 'dev';
  sistemaOperacional?: string;
  mensagemErro?: string;
  nivelTecnico?: 'basico' | 'intermediario' | 'avancado';
}

export interface AutoContext {
  screenshot?: string;
  activeWindow?: ActiveWindowInfo;
  detectedErrors?: string[];
  systemMetrics?: SystemMetrics;
}

export interface ActiveWindowInfo {
  title: string;
  processName: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
}

export interface WindowSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string;
}

export interface WindowFrame {
  sourceId: string;
  windowName: string;
  image: string;
  timestamp: number;
}
