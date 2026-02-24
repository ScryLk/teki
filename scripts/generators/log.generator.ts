export interface SeedLog {
  category: 'audit' | 'ai' | 'security' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
}

const LOG_MESSAGES: Record<string, string[]> = {
  audit: [
    'User logged in successfully',
    'User updated profile settings',
    'Agent configuration changed',
    'API key created',
    'API key revoked',
    'Document uploaded to knowledge base',
    'Document deleted from knowledge base',
    'Plan upgraded from free to starter',
    'Channel connected: WhatsApp',
    'Webhook endpoint created',
  ],
  ai: [
    'AI response generated successfully',
    'Token limit reached for request',
    'Provider switched from anthropic to gemini (fallback)',
    'Streaming response completed',
    'AI suggestion accepted by user',
    'AI suggestion rejected by user',
    'Embedding generation completed for document',
    'Knowledge base search returned 5 results',
    'Chat completion cost: $0.003',
    'Rate limit approaching: 80% of daily quota',
  ],
  security: [
    'Failed login attempt (wrong password)',
    'Failed login attempt from suspicious IP',
    'Account locked after 5 failed attempts',
    'API key used from new IP address',
    'CORS violation detected',
    'Rate limit exceeded for IP 192.168.1.100',
  ],
  system: [
    'Database connection pool at 80% capacity',
    'Scheduled backup completed successfully',
    'Memory usage above threshold: 85%',
    'Slow query detected: 2.5s on documents table',
    'Cache cleared for tenant dev-tenant-001',
    'Application restarted',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateLog(daysBack: number): SeedLog {
  const categories = Object.keys(LOG_MESSAGES) as SeedLog['category'][];
  const category = pickRandom(categories);
  const severities: SeedLog['severity'][] = [
    'info',
    'info',
    'info',
    'warning',
    'error',
  ];

  const timestamp = new Date();
  timestamp.setTime(
    timestamp.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000
  );

  return {
    category,
    severity: pickRandom(severities),
    message: pickRandom(LOG_MESSAGES[category]),
    timestamp,
  };
}

export function generateLogs(count: number, daysBack = 30): SeedLog[] {
  return Array.from({ length: count }, () => generateLog(daysBack)).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}
