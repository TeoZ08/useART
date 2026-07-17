export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits;
  throw new Error('Telefone inválido.');
}

export function normalizeEmail(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}
