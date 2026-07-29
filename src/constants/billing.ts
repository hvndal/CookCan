/**
 * Google Play subscription product IDs (SKUs).
 * These are the catalog codes you create in Play Console → Monetize → Subscriptions.
 * The app asks Play for these IDs; Play returns the localized price for the user’s country.
 *
 * Create TWO subscription products (or one product with monthly + yearly base plans):
 * - cookcan_pro_monthly
 * - cookcan_pro_yearly
 *
 * Attach a 7-day free trial offer on both (Play Console → Offers / base plan free trial).
 */
export const PRO_MONTHLY_PRODUCT_ID = 'cookcan_pro_monthly';
export const PRO_YEARLY_PRODUCT_ID = 'cookcan_pro_yearly';

/** @deprecated use PRO_MONTHLY_PRODUCT_ID */
export const PRO_PRODUCT_ID = PRO_MONTHLY_PRODUCT_ID;

export const PRO_PRODUCT_IDS = [PRO_MONTHLY_PRODUCT_ID, PRO_YEARLY_PRODUCT_ID] as const;

export type BillingPeriod = 'monthly' | 'yearly';

export const FREE_SCANS_PER_MONTH = 5;
export const FREE_TRIAL_DAYS = 7;

/** Yearly ≈ 2 months free (~17% off vs paying monthly for 12). */
export const YEARLY_DISCOUNT_LABEL = '2 months free';

export const PLANS = {
  free: {
    id: 'free' as const,
    name: 'Free',
    scansPerMonth: FREE_SCANS_PER_MONTH,
    features: [
      '5 ingredient scans per month',
      'Pantry & grocery lists',
      'Saved recipes',
    ],
  },
  pro: {
    id: 'pro' as const,
    name: 'CookCan Pro',
    scansPerMonth: Infinity,
    fallbackMonthlyLabel: '$2.99/mo',
    fallbackYearlyLabel: '$29.99/yr',
    trialLabel: `${FREE_TRIAL_DAYS}-day free trial`,
    features: [
      'Unlimited ingredient scans',
      'AI Chef kitchen assistant (Pro only)',
      'Meal planner',
      'Priority recipe generation',
      `${FREE_TRIAL_DAYS}-day free trial on first subscribe`,
    ],
  },
} as const;

/** Monthly targets — configure on cookcan_pro_monthly in Play Console.
 *  LATAM countries target ~USD 1.50 equivalent (not US/CA/EU parity).
 */
export const REGIONAL_PRICE_TARGETS_MONTHLY = [
  { region: 'United States', currency: 'USD', amount: '2.99', symbol: '$', note: 'full' as const },
  { region: 'Canada', currency: 'CAD', amount: '2.99', symbol: 'CA$', note: 'full' as const },
  { region: 'Eurozone', currency: 'EUR', amount: '1.99', symbol: '€', note: 'full' as const },
  { region: 'India', currency: 'INR', amount: '100', symbol: '₹', note: 'full' as const },
  // LATAM ≈ USD 1.50
  { region: 'Mexico', currency: 'MXN', amount: '29', symbol: 'MX$', note: 'latam' as const },
  { region: 'Brazil', currency: 'BRL', amount: '8.99', symbol: 'R$', note: 'latam' as const },
  { region: 'Argentina', currency: 'ARS', amount: '1500', symbol: 'AR$', note: 'latam' as const },
  { region: 'Colombia', currency: 'COP', amount: '5990', symbol: 'COL$', note: 'latam' as const },
  { region: 'Chile', currency: 'CLP', amount: '1490', symbol: 'CLP$', note: 'latam' as const },
  { region: 'Peru', currency: 'PEN', amount: '5.99', symbol: 'S/', note: 'latam' as const },
] as const;

/**
 * Yearly targets (~2 months free vs 12× monthly).
 * LATAM yearly ≈ 10× the ~USD 1.50 monthly target.
 */
export const REGIONAL_PRICE_TARGETS_YEARLY = [
  { region: 'United States', currency: 'USD', amount: '29.99', symbol: '$', note: 'full' as const },
  { region: 'Canada', currency: 'CAD', amount: '29.99', symbol: 'CA$', note: 'full' as const },
  { region: 'Eurozone', currency: 'EUR', amount: '19.99', symbol: '€', note: 'full' as const },
  { region: 'India', currency: 'INR', amount: '999', symbol: '₹', note: 'full' as const },
  { region: 'Mexico', currency: 'MXN', amount: '290', symbol: 'MX$', note: 'latam' as const },
  { region: 'Brazil', currency: 'BRL', amount: '89.99', symbol: 'R$', note: 'latam' as const },
  { region: 'Argentina', currency: 'ARS', amount: '14999', symbol: 'AR$', note: 'latam' as const },
  { region: 'Colombia', currency: 'COP', amount: '59900', symbol: 'COL$', note: 'latam' as const },
  { region: 'Chile', currency: 'CLP', amount: '14900', symbol: 'CLP$', note: 'latam' as const },
  { region: 'Peru', currency: 'PEN', amount: '59.90', symbol: 'S/', note: 'latam' as const },
] as const;

/** @deprecated use REGIONAL_PRICE_TARGETS_MONTHLY */
export const REGIONAL_PRICE_TARGETS = REGIONAL_PRICE_TARGETS_MONTHLY;

export function productIdForPeriod(period: BillingPeriod): string {
  return period === 'yearly' ? PRO_YEARLY_PRODUCT_ID : PRO_MONTHLY_PRODUCT_ID;
}

export function periodForProductId(productId: string | null | undefined): BillingPeriod | null {
  if (productId === PRO_YEARLY_PRODUCT_ID) return 'yearly';
  if (productId === PRO_MONTHLY_PRODUCT_ID) return 'monthly';
  return null;
}

export function isProProductId(productId: string): boolean {
  return (
    productId === PRO_MONTHLY_PRODUCT_ID || productId === PRO_YEARLY_PRODUCT_ID
  );
}
