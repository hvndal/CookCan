import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  getActiveSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';
import {
  FREE_TRIAL_DAYS,
  PLANS,
  PRO_MONTHLY_PRODUCT_ID,
  PRO_PRODUCT_IDS,
  PRO_YEARLY_PRODUCT_ID,
  isProProductId,
  periodForProductId,
  productIdForPeriod,
  type BillingPeriod,
} from '../constants/billing';
import { storage } from '../lib/storage';
import type { SubscriptionState } from '../types';

type BillingContextValue = {
  ready: boolean;
  isPro: boolean;
  subscription: SubscriptionState;
  localizedPrice: string;
  localizedYearlyPrice: string;
  currencyCode: string | null;
  products: ProductSubscription[];
  purchasing: boolean;
  freeTrialDays: number;
  refresh: () => Promise<void>;
  purchasePro: (period?: BillingPeriod) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  activateProMock: (period?: BillingPeriod) => Promise<void>;
  deactivateProMock: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

const defaultSub: SubscriptionState = {
  planId: 'free',
  productId: null,
  billingPeriod: null,
  expiresAt: null,
  isActive: false,
  localizedPrice: null,
  localizedYearlyPrice: null,
  currencyCode: null,
  storeCountry: null,
};

function findProduct(
  products: ProductSubscription[],
  productId: string
): ProductSubscription | undefined {
  return products.find((p) => {
    const id = (p as { id?: string; productId?: string }).id || (p as { productId?: string }).productId;
    return id === productId;
  });
}

function pickLocalizedPrice(
  product: ProductSubscription | null | undefined,
  period: BillingPeriod
): { label: string; currency: string | null } {
  const fallback =
    period === 'yearly' ? PLANS.pro.fallbackYearlyLabel : PLANS.pro.fallbackMonthlyLabel;
  const suffix = period === 'yearly' ? '/yr' : '/mo';

  if (!product) return { label: fallback, currency: null };

  const anyProduct = product as ProductSubscription & {
    displayPrice?: string;
    currency?: string;
    subscriptionOfferDetailsAndroid?: Array<{
      pricingPhases?: {
        pricingPhaseList?: Array<{ formattedPrice?: string; priceCurrencyCode?: string }>;
      };
    }>;
  };

  if (anyProduct.displayPrice) {
    const raw = anyProduct.displayPrice;
    const label = raw.includes('/') ? raw : `${raw}${suffix}`;
    return { label, currency: anyProduct.currency ?? null };
  }

  const phase =
    anyProduct.subscriptionOfferDetailsAndroid?.[0]?.pricingPhases?.pricingPhaseList?.[0];
  if (phase?.formattedPrice) {
    return {
      label: `${phase.formattedPrice}${suffix}`,
      currency: phase.priceCurrencyCode ?? null,
    };
  }

  return { label: fallback, currency: null };
}

function offerTokenFor(product?: ProductSubscription | null): string | undefined {
  return (product as ProductSubscription & {
    subscriptionOfferDetailsAndroid?: Array<{ offerToken?: string }>;
  })?.subscriptionOfferDetailsAndroid?.[0]?.offerToken;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSub);
  const [products, setProducts] = useState<ProductSubscription[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [storeConnected, setStoreConnected] = useState(false);
  const subscriptionRef = useRef(subscription);
  subscriptionRef.current = subscription;

  const persist = useCallback(async (next: SubscriptionState) => {
    setSubscription(next);
    await storage.setSubscription(next);
  }, []);

  const applyActive = useCallback(
    async (
      active: boolean,
      extras: Partial<SubscriptionState> & { billingPeriod?: BillingPeriod | null } = {}
    ) => {
      const current = subscriptionRef.current;
      const period = extras.billingPeriod ?? current.billingPeriod ?? 'monthly';
      const productId = active ? productIdForPeriod(period) : null;
      const durationMs =
        period === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

      await persist({
        planId: active ? 'pro' : 'free',
        productId,
        billingPeriod: active ? period : null,
        expiresAt: active ? Date.now() + durationMs : null,
        isActive: active,
        localizedPrice: extras.localizedPrice ?? current.localizedPrice,
        localizedYearlyPrice: extras.localizedYearlyPrice ?? current.localizedYearlyPrice,
        currencyCode: extras.currencyCode ?? current.currencyCode,
        storeCountry: extras.storeCountry ?? current.storeCountry,
      });
    },
    [persist]
  );

  const refresh = useCallback(async () => {
    const saved = await storage.getSubscription();
    setSubscription({
      ...defaultSub,
      ...saved,
      billingPeriod: saved.billingPeriod ?? periodForProductId(saved.productId),
      localizedYearlyPrice: saved.localizedYearlyPrice ?? null,
    });

    try {
      if (Platform.OS === 'web') {
        setReady(true);
        return;
      }

      const connected = await initConnection();
      setStoreConnected(Boolean(connected));

      const subs = (await fetchProducts({
        skus: [...PRO_PRODUCT_IDS],
        type: 'subs',
      })) as ProductSubscription[] | null;

      const list = subs ?? [];
      setProducts(list);

      const monthly = pickLocalizedPrice(findProduct(list, PRO_MONTHLY_PRODUCT_ID), 'monthly');
      const yearly = pickLocalizedPrice(findProduct(list, PRO_YEARLY_PRODUCT_ID), 'yearly');

      let activeProductId: string | null = null;
      try {
        const actives = await getActiveSubscriptions([...PRO_PRODUCT_IDS]);
        if (Array.isArray(actives) && actives.length > 0) {
          const first = actives[0] as { productId?: string; id?: string };
          activeProductId = first.productId || first.id || null;
        }
      } catch {
        activeProductId =
          saved.isActive && saved.planId === 'pro' ? saved.productId : null;
      }

      const isPro =
        Boolean(activeProductId && isProProductId(activeProductId)) ||
        (saved.isActive && saved.planId === 'pro');
      const period =
        periodForProductId(activeProductId) ??
        saved.billingPeriod ??
        periodForProductId(saved.productId) ??
        'monthly';

      await persist({
        planId: isPro ? 'pro' : 'free',
        productId: isPro ? activeProductId ?? productIdForPeriod(period) : null,
        billingPeriod: isPro ? period : null,
        expiresAt: isPro
          ? saved.expiresAt ??
            Date.now() + (period === 'yearly' ? 365 : 30) * 86400000
          : null,
        isActive: isPro,
        localizedPrice: monthly.label,
        localizedYearlyPrice: yearly.label,
        currencyCode: monthly.currency ?? yearly.currency,
        storeCountry: saved.storeCountry,
      });
    } catch {
      setStoreConnected(false);
    } finally {
      setReady(true);
    }
  }, [persist]);

  useEffect(() => {
    void refresh();

    const purchaseSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        const productId =
          purchase.productId || (purchase as { id?: string }).id || '';
        if (isProProductId(productId)) {
          await applyActive(true, {
            billingPeriod: periodForProductId(productId) ?? 'monthly',
            productId,
          });
          await finishTransaction({ purchase, isConsumable: false });
        }
      } catch (e) {
        console.warn('finishTransaction failed', e);
      } finally {
        setPurchasing(false);
      }
    });

    const errorSub = purchaseErrorListener((err) => {
      setPurchasing(false);
      if (err?.code !== 'user-cancelled') {
        Alert.alert('Purchase error', err?.message ?? 'Something went wrong');
      }
    });

    return () => {
      purchaseSub.remove();
      errorSub.remove();
      endConnection().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchasePro = useCallback(
    async (period: BillingPeriod = 'monthly') => {
      setPurchasing(true);
      const sku = productIdForPeriod(period);
      try {
        if (!storeConnected || Platform.OS === 'web') {
          Alert.alert(
            'Store unavailable',
            'Google Play Billing needs a development build and Play Console subscriptions. Use “Unlock Pro (dev)” on the paywall for local testing.'
          );
          setPurchasing(false);
          return false;
        }

        const product = findProduct(products, sku);
        const offerToken = offerTokenFor(product);

        await requestPurchase({
          request: {
            google: {
              skus: [sku],
              ...(offerToken
                ? { subscriptionOffers: [{ sku, offerToken }] }
                : {}),
            },
            apple: { sku },
          },
          type: 'subs',
        });
        return true;
      } catch (e) {
        setPurchasing(false);
        Alert.alert('Purchase failed', e instanceof Error ? e.message : 'Unknown error');
        return false;
      }
    },
    [products, storeConnected]
  );

  const restorePurchases = useCallback(async () => {
    try {
      const actives = await getActiveSubscriptions([...PRO_PRODUCT_IDS]);
      const first = Array.isArray(actives) && actives.length > 0
        ? (actives[0] as { productId?: string; id?: string })
        : null;
      const productId = first?.productId || first?.id || null;
      const active = Boolean(productId && isProProductId(productId));
      await applyActive(active, {
        billingPeriod: periodForProductId(productId) ?? 'monthly',
        productId,
      });
      Alert.alert(
        active ? 'Pro restored' : 'No subscription found',
        active
          ? 'Your CookCan Pro plan is active again.'
          : 'We could not find an active Play subscription for this account.'
      );
      return active;
    } catch (e) {
      Alert.alert('Restore failed', e instanceof Error ? e.message : 'Unknown error');
      return false;
    }
  }, [applyActive]);

  const activateProMock = useCallback(
    async (period: BillingPeriod = 'yearly') => {
      await applyActive(true, {
        billingPeriod: period,
        localizedPrice:
          subscriptionRef.current.localizedPrice ?? PLANS.pro.fallbackMonthlyLabel,
        localizedYearlyPrice:
          subscriptionRef.current.localizedYearlyPrice ?? PLANS.pro.fallbackYearlyLabel,
      });
    },
    [applyActive]
  );

  const deactivateProMock = useCallback(async () => {
    await applyActive(false);
  }, [applyActive]);

  const monthly = pickLocalizedPrice(findProduct(products, PRO_MONTHLY_PRODUCT_ID), 'monthly');
  const yearly = pickLocalizedPrice(findProduct(products, PRO_YEARLY_PRODUCT_ID), 'yearly');
  const displayMonthly = subscription.localizedPrice ?? monthly.label;
  const displayYearly = subscription.localizedYearlyPrice ?? yearly.label;

  const value = useMemo(
    () => ({
      ready,
      isPro: subscription.isActive && subscription.planId === 'pro',
      subscription,
      localizedPrice: displayMonthly,
      localizedYearlyPrice: displayYearly,
      currencyCode: subscription.currencyCode,
      products,
      purchasing,
      freeTrialDays: FREE_TRIAL_DAYS,
      refresh,
      purchasePro,
      restorePurchases,
      activateProMock,
      deactivateProMock,
    }),
    [
      ready,
      subscription,
      displayMonthly,
      displayYearly,
      products,
      purchasing,
      refresh,
      purchasePro,
      restorePurchases,
      activateProMock,
      deactivateProMock,
    ]
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used within BillingProvider');
  return ctx;
}
