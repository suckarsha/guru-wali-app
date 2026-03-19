import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBulk() {
  const payload = [
    { nisn: '9999991', name: 'Bulk Student 1', gender: 'L', class_id: null },
    { nisn: '9999992', name: 'Bulk Student 2', gender: 'P', class_id: null }
  ];

  console.log('Attempting bulk insert...');
  const { data, error } = await supabase.from('students').insert(payload).select();
  
  console.log('Result Data:', data);
  console.log('Result Error:', error);
}

testBulk();
