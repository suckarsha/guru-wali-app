import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xyegrzqazawquesjmapq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew');

async function runTest() {
  console.log('Testing Select from students...');
  const { data: students, error: err1 } = await supabase.from('students').select('*').limit(2);
  console.log('Students Select:', err1 ? err1 : `Got ${students.length} students`);

  console.log('Testing Insert into students...');
  const { data: newStudent, error: err2 } = await supabase.from('students').insert([{
    name: 'Test Student X',
    gender: 'L',
    nisn: null
  }]);
  console.log('Students Insert Error:', err2);
  console.log('Students Insert Data:', newStudent);

  console.log('Testing Settings...');
  const { data: st, error: err3 } = await supabase.from('school_settings').select('id').limit(1).maybeSingle();
  console.log('Settings Exist:', st);

  if (st) {
    const { error: err4 } = await supabase.from('school_settings').update({
      nama_sekolah: 'Updated Test Name'
    }).eq('id', st.id);
    console.log('Settings Update Error:', err4);
  } else {
    const { error: err5 } = await supabase.from('school_settings').insert([{ nama_sekolah: 'Test Insert' }]);
    console.log('Settings Insert Error:', err5);
  }
}

runTest();
