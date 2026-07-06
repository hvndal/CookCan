import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oczdxcayqkwvriwolclh.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-awaiting-user-input';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
