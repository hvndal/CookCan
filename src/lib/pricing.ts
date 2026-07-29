import {
  REGIONAL_PRICE_TARGETS_MONTHLY,
  REGIONAL_PRICE_TARGETS_YEARLY,
  type BillingPeriod,
} from '../constants/billing';
import type { CountryCode } from './locale';

type PriceRow = {
  region: string;
  currency: string;
  amount: string;
  symbol: string;
  note?: 'full' | 'latam';
};

function rowForCountry(
  country: CountryCode,
  table: readonly PriceRow[]
): PriceRow {
  const byRegion: Record<string, string> = {
    US: 'United States',
    CA: 'Canada',
    GB: 'Eurozone', // use EUR table as nearest; UK often separate — use Eurozone row for EU-like
    IN: 'India',
    DE: 'Eurozone',
    FR: 'Eurozone',
    ES: 'Eurozone',
    IT: 'Eurozone',
    OTHER_EU: 'Eurozone',
    MX: 'Mexico',
    BR: 'Brazil',
    AR: 'Argentina',
    CO: 'Colombia',
    CL: 'Chile',
    PE: 'Peru',
    OTHER_LATAM: 'Mexico',
    OTHER: 'United States',
  };

  // UK: show GBP-style using a dedicated soft label from US amount isn't ideal.
  // Prefer Eurozone for DE/FR/ES; for GB use United States row but we'll override currency label below.
  const regionName = byRegion[country] ?? 'United States';
  const found = table.find((r) => r.region === regionName);
  if (found) return found;

  // LATAM fallback ~ USD 1.50 Mexico row
  if (country === 'OTHER_LATAM' || country === 'BR' || country === 'MX') {
    return table.find((r) => r.region === 'Mexico') ?? table[0];
  }
  return table[0];
}

/** Format like R$8.99/mês from country targets when Play price isn't available yet. */
export function formatLocalPrice(
  country: CountryCode,
  period: BillingPeriod,
  periodSuffix: { monthly: string; yearly: string }
): { label: string; currency: string; amount: string; symbol: string; region: string } {
  const table =
    period === 'yearly' ? REGIONAL_PRICE_TARGETS_YEARLY : REGIONAL_PRICE_TARGETS_MONTHLY;
  let row = rowForCountry(country, table as unknown as PriceRow[]);

  // United Kingdom: approximate with £2.49 / £24.99 (not in table) — keep EUR for EU, for GB invent soft GBP
  if (country === 'GB') {
    row =
      period === 'yearly'
        ? { region: 'United Kingdom', currency: 'GBP', amount: '24.99', symbol: '£' }
        : { region: 'United Kingdom', currency: 'GBP', amount: '2.49', symbol: '£' };
  }

  const suffix = period === 'yearly' ? periodSuffix.yearly : periodSuffix.monthly;
  return {
    label: `${row.symbol}${row.amount}${suffix}`,
    currency: row.currency,
    amount: row.amount,
    symbol: row.symbol,
    region: row.region,
  };
}

export function isPlayPriceForCurrency(
  playCurrency: string | null | undefined,
  expectedCurrency: string
): boolean {
  if (!playCurrency) return false;
  return playCurrency.toUpperCase() === expectedCurrency.toUpperCase();
}
