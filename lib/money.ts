export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function centsFromDecimal(value: number): number {
  return Math.round(value * 100);
}
