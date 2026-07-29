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
import { PLANS, PRO_PRODUCT_ID } from '../constants/billing';
import { storage } from '../lib/storage';
import type { SubscriptionState } from '../types';

type BillingContextValue = {
  ready: boolean;
  isPro: boolean;
  subscription: SubscriptionState;
  localizedPrice: string;
  currencyCode: string | null;
  products: ProductSubscription[];
  purchasing: boolean;
  refresh: () => Promise<void>;
  purchasePro: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  activateProMock: () => Promise<void>;
  deactivateProMock: () => Promise<void>;
};

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

const defaultSub: SubscriptionState = {
  planId: 'free',
  productId: null,
  expiresAt: null,
  isActive: false,
  localizedPrice: null,
  currencyCode: null,
  storeCountry: null,
};

function pickLocalizedPrice(product?: ProductSubscription | null): {
  label: string;
  currency: string | null;
} {
  if (!product) return { label: PLANS.pro.fallbackPriceLabel, currency: null };
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
    return {
      label: `${anyProduct.displayPrice}/mo`,
      currency: anyProduct.currency ?? null,
    };
  }

  const phase =
    anyProduct.subscriptionOfferDetailsAndroid?.[0]?.pricingPhases?.pricingPhaseList?.[0];
  if (phase?.formattedPrice) {
    return {
      label: `${phase.formattedPrice}/mo`,
      currency: phase.priceCurrencyCode ?? null,
    };
  }

  return { label: PLANS.pro.fallbackPriceLabel, currency: null };
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
    async (active: boolean, extras: Partial<SubscriptionState> = {}) => {
      const current = subscriptionRef.current;
      await persist({
        planId: active ? 'pro' : 'free',
        productId: active ? PRO_PRODUCT_ID : null,
        expiresAt: active ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
        isActive: active,
        localizedPrice: extras.localizedPrice ?? current.localizedPrice,
        currencyCode: extras.currencyCode ?? current.currencyCode,
        storeCountry: extras.storeCountry ?? current.storeCountry,
      });
    },
    [persist]
  );

  const refresh = useCallback(async () => {
    const saved = await storage.getSubscription();
    setSubscription(saved);

    try {
      if (Platform.OS === 'web') {
        setReady(true);
        return;
      }

      const connected = await initConnection();
      setStoreConnected(Boolean(connected));

      const subs = (await fetchProducts({
        skus: [PRO_PRODUCT_ID],
        type: 'subs',
      })) as ProductSubscription[] | null;

      const list = subs ?? [];
      setProducts(list);
      const { label, currency } = pickLocalizedPrice(list[0]);

      let active = false;
      try {
        const actives = await getActiveSubscriptions([PRO_PRODUCT_ID]);
        active = Array.isArray(actives) && actives.length > 0;
      } catch {
        active = saved.isActive && saved.planId === 'pro';
      }

      const isPro = active || (saved.isActive && saved.planId === 'pro');
      await persist({
        planId: isPro ? 'pro' : 'free',
        productId: isPro ? PRO_PRODUCT_ID : null,
        expiresAt: isPro ? saved.expiresAt ?? Date.now() + 30 * 86400000 : null,
        isActive: isPro,
        localizedPrice: label,
        currencyCode: currency,
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
        if (productId === PRO_PRODUCT_ID) {
          await applyActive(true);
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
    // Mount once — refresh/applyActive are stable via refs + persist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchasePro = useCallback(async () => {
    setPurchasing(true);
    try {
      if (!storeConnected || Platform.OS === 'web') {
        Alert.alert(
          'Store unavailable',
          'Google Play Billing needs a development build and a Play Console subscription. Use “Unlock Pro (dev)” on the paywall for local testing.'
        );
        setPurchasing(false);
        return false;
      }

      const product = products[0];
      const offerToken =
        (product as ProductSubscription & {
          subscriptionOfferDetailsAndroid?: Array<{ offerToken?: string }>;
        })?.subscriptionOfferDetailsAndroid?.[0]?.offerToken;

      await requestPurchase({
        request: {
          google: {
            skus: [PRO_PRODUCT_ID],
            ...(offerToken
              ? { subscriptionOffers: [{ sku: PRO_PRODUCT_ID, offerToken }] }
              : {}),
          },
          apple: { sku: PRO_PRODUCT_ID },
        },
        type: 'subs',
      });
      return true;
    } catch (e) {
      setPurchasing(false);
      Alert.alert('Purchase failed', e instanceof Error ? e.message : 'Unknown error');
      return false;
    }
  }, [products, storeConnected]);

  const restorePurchases = useCallback(async () => {
    try {
      const actives = await getActiveSubscriptions([PRO_PRODUCT_ID]);
      const active = Array.isArray(actives) && actives.length > 0;
      await applyActive(active);
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

  const activateProMock = useCallback(async () => {
    await applyActive(true, {
      localizedPrice: subscriptionRef.current.localizedPrice ?? PLANS.pro.fallbackPriceLabel,
    });
  }, [applyActive]);

  const deactivateProMock = useCallback(async () => {
    await applyActive(false);
  }, [applyActive]);

  const { label: localizedPrice } = pickLocalizedPrice(products[0]);
  const displayPrice = subscription.localizedPrice ?? localizedPrice;

  const value = useMemo(
    () => ({
      ready,
      isPro: subscription.isActive && subscription.planId === 'pro',
      subscription,
      localizedPrice: displayPrice,
      currencyCode: subscription.currencyCode,
      products,
      purchasing,
      refresh,
      purchasePro,
      restorePurchases,
      activateProMock,
      deactivateProMock,
    }),
    [
      ready,
      subscription,
      displayPrice,
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
