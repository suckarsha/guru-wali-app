import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfilesRelational() {
  const { data: students } = await supabase.from('students').select('id').limit(1);
  if (!students || students.length === 0) return;

  const payload = {
    student_id: students[0].id,
    tanggal: '2026-03-19',
    waktu: '10:00',
    jenis: 'Pendampingan Akademik',
    topik: 'Test Profiles',
    tindak_lanjut: 'Test Profiles',
    guru_id: null
  };

  const { data, error } = await supabase.from('guidance_journals').insert([payload]).select(`*, profiles(nama)`).single();
  
  console.log('Result Data:', data);
  console.log('Result Error:', error);
}

testProfilesRelational();
