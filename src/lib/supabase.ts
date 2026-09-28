import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://emfkfllgdihkhjermmmo.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZmtmbGxnZGloa2hqZXJtbW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NDgxOTksImV4cCI6MjEwNjEyNDE5OX0.F6JHZmZDWOK5D4_j04MKTD2dEUf-61sJJ1kPtfVIGo8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
