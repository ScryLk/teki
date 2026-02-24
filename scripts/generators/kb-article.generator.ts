export interface SeedArticle {
  title: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  content: string;
}

const ARTICLE_TEMPLATES = [
  {
    titlePattern: 'Error {code} SEFAZ — {description}',
    category: 'Fiscal',
    tags: ['sefaz', 'nfce', 'fiscal-error'],
    codes: ['656', '301', '302', '999', '100', '202', '215', '598'],
    descriptions: [
      'Blocked A1 Certificate',
      'Undue Consumption Rejection',
      'Denied Use',
      'Webservice Timeout',
      'Invalid Schema',
      'NF-e Duplicity',
    ],
  },
  {
    titlePattern: 'Printer {model} — {problem}',
    category: 'Printing',
    tags: ['printer', 'fiscal-receipt'],
    models: ['Bematech MP-4200', 'Epson TM-T20X', 'Elgin i9', 'Daruma DR800'],
    problems: [
      'Not printing receipt',
      'Stuck guillotine',
      'Strange characters',
      'Partial cut',
      'Paper rolling',
    ],
  },
  {
    titlePattern: '{software} — {issue}',
    category: 'Installation',
    tags: ['installation', 'configuration'],
    software: ['JPosto', 'JNotas', 'JFiscal', 'JRetaguarda'],
    issues: [
      'Installation on Windows 11',
      'Database migration to new server',
      'Version update failure',
      'Digital certificate configuration',
      'Expired license',
    ],
  },
  {
    titlePattern: 'PostgreSQL — {problem}',
    category: 'Database',
    tags: ['postgresql', 'database', 'backup'],
    problems: [
      'Auto backup stopped',
      'Table corrupted after power outage',
      'Connection refused after update',
      'Slow query on sales table',
      'Backup .dump restore',
      'ID sequence desynchronized',
    ],
  },
  {
    titlePattern: 'Network — {problem}',
    category: 'Network',
    tags: ['connectivity', 'vpn', 'firewall'],
    problems: [
      'VPN connection drops intermittently',
      'Firewall blocking SEFAZ port',
      'DHCP not assigning IP',
      'DNS resolution failing',
      'Proxy authentication error',
    ],
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateContent(title: string, category: string): string {
  return [
    `## Problem`,
    ``,
    `${title}`,
    ``,
    `This issue occurs when the ${category.toLowerCase()} system encounters an unexpected state.`,
    `The error has been reported by multiple clients in the field.`,
    ``,
    `## Solution`,
    ``,
    `1. Verify the current configuration settings`,
    `2. Check system logs for related errors`,
    `3. Apply the recommended fix described below`,
    `4. Restart the affected service`,
    `5. Confirm the issue is resolved`,
    ``,
    `## Notes`,
    ``,
    `- This solution applies to version 4.x and above`,
    `- For older versions, contact the support team`,
    `- Always backup before applying changes`,
  ].join('\n');
}

export function generateArticle(index: number): SeedArticle {
  const template = ARTICLE_TEMPLATES[index % ARTICLE_TEMPLATES.length];
  let title = template.titlePattern;

  // Replace placeholders with random values
  const fields = title.match(/\{(\w+)\}/g) || [];
  for (const field of fields) {
    const key = field.slice(1, -1);
    const values = (template as Record<string, unknown>)[key + 's'] as
      | string[]
      | undefined;
    if (values) {
      title = title.replace(field, pickRandom(values));
    }
  }

  const statuses: SeedArticle['status'][] = [
    'published',
    'published',
    'published',
    'draft',
    'archived',
  ];

  return {
    title,
    category: template.category,
    tags: template.tags,
    status: pickRandom(statuses),
    content: generateContent(title, template.category),
  };
}

export function generateArticles(count: number): SeedArticle[] {
  return Array.from({ length: count }, (_, i) => generateArticle(i));
}
