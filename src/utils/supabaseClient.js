import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://olokcmfocijqlsfueyuu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sb2tjbWZvY2lqcWxzZnVleXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTE4NzEsImV4cCI6MjA5NTYyNzg3MX0.NK7xZSwy6nvF3BcryB_rTQYjKIqM2N0eDPakRXBJOQM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
