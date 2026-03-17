import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xyegrzqazawquesjmapq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWdyenFhemF3cXVlc2ptYXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTk4NzcsImV4cCI6MjA4OTI5NTg3N30.rFWKl3uLLQuabgkk8vKcmck1M3To71RMzUMVugEy0ew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const adminId = 'ea955454-e644-477a-a4d2-459195ce878e';
  const guruId = 'a61ad7de-9357-4918-8dcc-a7612155d1f2';

  console.log("Creating Admin Profile...");
  const { error: adminErr } = await supabase.from('profiles').insert([
      { id: adminId, nip: '000000000', nama: 'Administrator', role: 'admin' }
  ]);
  if (adminErr) console.log("Admin Profile Error:", adminErr.message);
  else console.log("Admin Profile Inserted - Success");

  console.log("\nCreating Guru Profile...");
  const { error: guruErr } = await supabase.from('profiles').insert([
      { id: guruId, nip: '199001012020121001', nama: 'I Kadek Sukarsa, S.Pd., M.Pd.', role: 'guru' }
  ]);
  if (guruErr) console.log("Guru Profile Error:", guruErr.message);
  else console.log("Guru Profile Inserted - Success");
  
  // also setting up the singleton sekolah settings since we are at it
  console.log("\nSetting Up Sekolah Settings...");
  const { error: sekolahErr } = await supabase.from('sekolah').insert([
      { id: 1, nama_sekolah: 'SMK Negeri 1 Contoh', npsn: '12345678', alamat: 'Jl. Pendidikan No. 1, Denpasar', kota: 'Denpasar' }
  ]);
  if (sekolahErr) console.log("Sekolah Error:", sekolahErr.message);
  else console.log("Sekolah Inserted - Success");
}

seed();
