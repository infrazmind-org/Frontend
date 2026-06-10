/** Display credit amounts without noisy trailing zeros (supports fractional burn). */
export function formatCredits(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return '—';
  return Number(n.toFixed(4)).toString();
}
