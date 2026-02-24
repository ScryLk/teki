export interface SeedTicket {
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string | null;
  messageCount: number;
}

const TICKET_SUBJECTS = [
  'NF-e rejection error 656 — client cannot emit invoices',
  'Printer Bematech MP-4200 not printing receipts',
  'PostgreSQL backup stopped working after server update',
  'Cannot install JPosto on Windows 11',
  'VPN drops connection every 15 minutes',
  'System running very slow after update to v4.2',
  'Certificate A1 expired — cannot access SEFAZ',
  'Firewall blocking port 443 to SEFAZ servers',
  'Customer reports wrong values in sales report',
  'Barcode reader not recognized by the system',
  'Email notifications not being sent',
  'User cannot login after password reset',
  'Automatic backup fails with "disk full" error',
  'Slow query causing timeouts on checkout page',
  'Integration with payment gateway returning 500',
  'Mobile app crashes when scanning QR code',
  'Cannot export report to PDF — blank pages',
  'Duplicate entries in inventory after sync',
  'Database connection pool exhausted during peak hours',
  'Client requesting custom report format',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateTicket(index: number): SeedTicket {
  const statuses: SeedTicket['status'][] = [
    'open',
    'in_progress',
    'resolved',
    'closed',
  ];
  const priorities: SeedTicket['priority'][] = [
    'low',
    'medium',
    'medium',
    'high',
    'urgent',
  ];
  const assignees = [
    'Lucas Silva',
    'Maria Santos',
    'Joao Mendes',
    'Ana Costa',
    null,
  ];

  return {
    title: TICKET_SUBJECTS[index % TICKET_SUBJECTS.length],
    status: pickRandom(statuses),
    priority: pickRandom(priorities),
    assignee: pickRandom(assignees),
    messageCount: Math.floor(Math.random() * 8) + 1,
  };
}

export function generateTickets(count: number): SeedTicket[] {
  return Array.from({ length: count }, (_, i) => generateTicket(i));
}
