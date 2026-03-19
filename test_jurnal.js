import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJournal() {
  // First, get a valid student
  const { data: students } = await supabase.from('students').select('id').limit(1);
  if (!students || students.length === 0) {
    console.log('No students found, cannot test journal insert.');
    return;
  }
  
  const student = students[0];

  const payload = {
    student_id: student.id,
    tanggal: '2026-03-19',
    waktu: '10:00',
    jenis: 'Pendampingan Akademik',
    topik: 'Test',
    tindak_lanjut: 'Test',
    guru_id: null
  };

  console.log('Testing insert with payload:', payload);

  const { data, error } = await supabase.from('guidance_journals').insert([payload]);
  
  console.log('Result Data:', data);
  console.log('Result Error:', error);
}

testJournal();
