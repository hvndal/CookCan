import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oczdxcayqkwvriwolclh.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-awaiting-user-input';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured =
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'dummy-key-awaiting-user-input';
