/**
 * Abbreviates large RWF amounts (299999999998 -> "RWF 300.0B") instead of spelling out every
 * digit. Some seeded test data has values in the hundreds of billions — a full `.toLocaleString()`
 * digit string at that size reliably overflows a fixed-width card. Real RWF amounts also tend to
 * run into the millions/billions routinely (low unit value), so this isn't just a test-data
 * workaround — it's how currency should be displayed at this scale generally.
 */
export function formatRwf(amount: string | number): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return `RWF ${amount}`;

  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `RWF ${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `RWF ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `RWF ${(value / 1_000).toFixed(0)}K`;
  return `RWF ${value.toLocaleString()}`;
}
