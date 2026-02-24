export interface SeedUser {
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
}

const FIRST_NAMES = [
  'Lucas',
  'Maria',
  'Joao',
  'Ana',
  'Pedro',
  'Julia',
  'Carlos',
  'Fernanda',
  'Rafael',
  'Beatriz',
  'Gabriel',
  'Camila',
  'Thiago',
  'Larissa',
  'Marcos',
];

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Mendes',
  'Costa',
  'Oliveira',
  'Pereira',
  'Souza',
  'Lima',
  'Almeida',
  'Ferreira',
  'Ribeiro',
  'Gomes',
  'Martins',
  'Rocha',
  'Araujo',
];

export function generateUser(index: number): SeedUser {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  const roles: SeedUser['role'][] = [
    'owner',
    'admin',
    'agent',
    'agent',
    'viewer',
  ];

  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dev.teki`,
    role: index === 0 ? 'owner' : roles[index % roles.length],
  };
}

export function generateUsers(count: number): SeedUser[] {
  return Array.from({ length: count }, (_, i) => generateUser(i));
}
