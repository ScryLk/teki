import type { MemberRole, UserStatus, AuthProvider } from '@teki/shared';

export interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  role: MemberRole;
  authProvider?: AuthProvider;
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

const DEPARTMENTS = [
  'Suporte N1',
  'Suporte N2',
  'Engenharia',
  'Produto',
  'Comercial',
  'Financeiro',
  'RH',
];

const JOB_TITLES = [
  'Analista de Suporte',
  'Coordenador de TI',
  'Desenvolvedor',
  'Gerente de Produto',
  'Atendente',
  'Supervisor',
  'Diretor de Operacoes',
];

export function generateUser(index: number): SeedUser {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  const roles: MemberRole[] = [
    'owner',
    'admin',
    'agent',
    'agent',
    'viewer',
    'billing',
  ];

  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dev.teki`,
    status: 'active',
    role: index === 0 ? 'owner' : roles[index % roles.length],
  };
}

export function generateUsers(count: number): SeedUser[] {
  return Array.from({ length: count }, (_, i) => generateUser(i));
}

export function generateUserWithAuth(index: number): SeedUser & {
  department: string;
  jobTitle: string;
} {
  const user = generateUser(index);
  return {
    ...user,
    authProvider: index % 3 === 0 ? 'google' : undefined,
    department: DEPARTMENTS[index % DEPARTMENTS.length],
    jobTitle: JOB_TITLES[index % JOB_TITLES.length],
  };
}
