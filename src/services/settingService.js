import { supabase } from '../lib/supabase';

export const settingService = {
  async getSettings() {
    const { data, error } = await supabase.from('school_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    
    if (!data) {
      return {
        nama_sekolah: '',
        npsn: '',
        kop_surat_1: '',
        kop_surat_2: '',
        alamat: '',
        kota: '',
        logo_url: null,
        app_name: 'Guru Wali App.',
        app_logo_url: null
      };
    }
    
    return data;
  },

  async updateSettings(settings) {
    const { data: existing } = await supabase.from('school_settings').select('id').limit(1).maybeSingle();
    
    let result;
    if (existing) {
      const { data, error } = await supabase.from('school_settings').update(settings).eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase.from('school_settings').insert([settings]).select().single();
      if (error) throw error;
      result = data;
    }
    return result;
  },

  async clearAllDatabase() {
    // Delete in sequence to avoid foreign key constraints
    await supabase.from('attendance_records').delete().not('id', 'is', null);
    await supabase.from('student_guidance').delete().not('id', 'is', null);
    await supabase.from('guidance_journals').delete().not('id', 'is', null);
    await supabase.from('students').delete().not('id', 'is', null);
    await supabase.from('classes').delete().not('id', 'is', null);
    await supabase.from('announcements').delete().not('id', 'is', null);
  }
};
