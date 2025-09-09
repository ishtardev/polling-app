import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables to provide better error messages
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create and configure the Supabase client with retry options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Add retry logic for network failures
    fetch: (url, options) => {
      const MAX_RETRIES = 3;
      let retries = 0;
      
      const fetchWithRetry = async (): Promise<Response> => {
        try {
          return await fetch(url, options);
        } catch (error) {
          if (retries < MAX_RETRIES) {
            retries++;
            // Exponential backoff: 1s, 2s, 4s
            const delay = 1000 * Math.pow(2, retries - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry();
          }
          throw error;
        }
      };
      
      return fetchWithRetry();
    }
  }
});

// Helper function to check if Supabase is available
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('polls').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
