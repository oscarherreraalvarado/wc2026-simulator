import { createClient, SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import ws from 'ws';

/** Cliente Supabase compatible con Node.js 20 (sin WebSocket nativo). */
export function createSupabaseClient(
  url: string,
  key: string,
  options?: SupabaseClientOptions<'public'>,
): SupabaseClient {
  return createClient(url, key, {
    ...options,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      ...options?.auth,
    },
    realtime: {
      transport: ws as unknown as typeof WebSocket,
      ...options?.realtime,
    },
  });
}
