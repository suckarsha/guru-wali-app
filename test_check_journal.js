import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: journals, error: err } = await supabase.from('guidance_journals').select();
  console.log('Journals:', journals);
}

check();
