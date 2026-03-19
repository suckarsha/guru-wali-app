import { journalService } from './src/services/journalService.js';

async function testService() {
  try {
    const res = await journalService.create({
      student_id: 'eac31b1f-8f35-431b-b863-a3421f9ef827', // existing UUID from earlier
      tanggal: '2026-03-19',
      waktu: '10:00',
      jenis: 'Pendampingan Akademik',
      topik: 'Test Direct Call',
      tindakLanjut: 'Direct test',
      guru_id: null
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Failed:', err);
  }
}

testService();
