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

export interface CaptureFrame {
  image: string;
  timestamp: number;
  source: string;
  activeWindow: ActiveWindowInfo;
}
