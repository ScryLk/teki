export function cleanTaxId(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateTaxId(
  value: string
): { type: 'cpf' | 'cnpj'; clean: string } | null {
  const clean = cleanTaxId(value);

  if (clean.length === 11 && isValidCPF(clean)) {
    return { type: 'cpf', clean };
  }

  if (clean.length === 14 && isValidCNPJ(clean)) {
    return { type: 'cnpj', clean };
  }

  return null;
}

export function formatTaxId(clean: string): string {
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }
  return clean;
}

export function maskTaxId(clean: string): string {
  if (clean.length === 11) {
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  }
  if (clean.length === 14) {
    return `**.***.${clean.slice(5, 8)}/${clean.slice(8, 12)}-**`;
  }
  return clean;
}

function isValidCPF(cpf: string): boolean {
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cpf[10]);
}

function isValidCNPJ(cnpj: string): boolean {
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cnpj[i]) * weights1[i];
  let remainder = sum % 11;
  const d1 = remainder < 2 ? 0 : 11 - remainder;
  if (d1 !== parseInt(cnpj[12])) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(cnpj[i]) * weights2[i];
  remainder = sum % 11;
  const d2 = remainder < 2 ? 0 : 11 - remainder;
  return d2 === parseInt(cnpj[13]);
}
