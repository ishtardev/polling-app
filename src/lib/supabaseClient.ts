// Use dynamic imports to avoid potential build/test environment issues
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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
    // Add retry logic for network failures with per-try timeout and status code check
    fetch: (url, options) => {
      const MAX_RETRIES = 3;
      const TIMEOUT_MS = 10000; // 10 seconds timeout per attempt
      let retries = 0;
      
      const fetchWithRetry = async (): Promise<Response> => {
        try {
          // Create an AbortController for timeout handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          // Add the signal to the fetch options
          const fetchOptions = {
            ...options,
            signal: controller.signal
          };
          
          // Attempt the fetch
          const response = await fetch(url, fetchOptions);
          clearTimeout(timeoutId);
          
          // Retry on specific status codes: 429 (Too Many Requests), 503 (Service Unavailable), etc.
          if ([429, 500, 502, 503, 504].includes(response.status) && retries < MAX_RETRIES) {
            retries++;
            const delay = 1000 * Math.pow(2, retries - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry();
          }
          
          return response;
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

// Helper function to check if Supabase is available using HEAD request to reduce payload
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Use HEAD request instead of a full SELECT query to minimize data transfer
    const response = await fetch(`${supabaseUrl}/rest/v1/polls?select=id&limit=1`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${supabaseAnonKey || ''}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}
