import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vusjcfushwxwksfuszjv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1c2pjZnVzaHd4d2tzZnVzemp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzIzMjgsImV4cCI6MjA4MzgwODMyOH0.-sBIz04nAimMUGA7yVS2st80z_rIRvGcvI9qYTT7Ozg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceKey) return supabase;
  return createClient(supabaseUrl, serviceKey);
}
