import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  privacyPolicyUrl?: string;
  termsUrl?: string;
  supportEmail?: string;
};

export const LEGAL = {
  privacyUrl: extra.privacyPolicyUrl || 'https://cookcan.app/privacy',
  termsUrl: extra.termsUrl || 'https://cookcan.app/terms',
  supportEmail: extra.supportEmail || 'support@cookcan.app',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
};
