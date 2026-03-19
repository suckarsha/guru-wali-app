import { supabase } from '../lib/supabase';

export const settingService = {
  async getSettings() {
    const { data, error } = await supabase.from('school_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    
    if (!data) {
      return {
        nama_sekolah: 'SMA NEGERI 1 DENPASAR',
        kop_surat_1: 'PEMERINTAH PROVINSI BALI',
        kop_surat_2: 'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA',
        alamat: 'Jl. Kamboja No.17, Dangin Puri Kangin, Denpasar Utara, Bali 80233\nTelepon: (0361) 222539 | Website: www.sman1denpasar.sch.id',
        kota: 'Denpasar',
        logo_url: null
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
  }
};
