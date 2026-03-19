import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGuidance() {
  const { data: students } = await supabase.from('students').select('id').limit(1);
  if (!students || students.length === 0) return;

  const payload = {
    guru_id: 'a8e932b1-0960-4927-aa1d-1518f8cbe075',
    student_id: students[0].id
  };

  const { data, error } = await supabase.from('student_guidance').insert([payload]);
  
  if (error) {
    console.log('Guidance Error details:', error);
  } else {
    console.log('Guidance Success!', data);
  }
}

testGuidance();
