/**
 * Google Play subscription product.
 * Create ONE monthly subscription in Play Console with ID below,
 * then set regional prices (Play handles dynamic/localized pricing).
 *
 * Target regional prices (configure in Play Console → Monetize → Products):
 * - United States:  USD 2.99
 * - Canada:         CAD 2.99
 * - Eurozone:       EUR 1.99
 * - India:          INR 100
 * - LATAM (e.g. MX, BR, AR, CL, CO): local equivalent of ~USD 1.99–2.99
 *
 * The app always displays the store-localized price from BillingClient.
 */
export const PRO_PRODUCT_ID = 'cookcan_pro_monthly';

export const FREE_SCANS_PER_MONTH = 5;

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
    fallbackPriceLabel: '$2.99/mo',
    features: [
      'Unlimited ingredient scans',
      'AI Chef kitchen assistant',
      'Meal planner',
      'Priority recipe generation',
    ],
  },
} as const;

/** Reference map for docs / paywall copy (actual charged price comes from Play). */
export const REGIONAL_PRICE_TARGETS = [
  { region: 'United States', currency: 'USD', amount: '2.99', symbol: '$' },
  { region: 'Canada', currency: 'CAD', amount: '2.99', symbol: 'CA$' },
  { region: 'Eurozone', currency: 'EUR', amount: '1.99', symbol: '€' },
  { region: 'India', currency: 'INR', amount: '100', symbol: '₹' },
  { region: 'Mexico', currency: 'MXN', amount: '49', symbol: 'MX$' },
  { region: 'Brazil', currency: 'BRL', amount: '14.99', symbol: 'R$' },
  { region: 'Argentina', currency: 'ARS', amount: '2499', symbol: 'AR$' },
  { region: 'Colombia', currency: 'COP', amount: '9900', symbol: 'COL$' },
  { region: 'Chile', currency: 'CLP', amount: '2490', symbol: 'CLP$' },
] as const;
