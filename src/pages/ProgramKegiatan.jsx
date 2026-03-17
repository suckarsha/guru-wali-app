import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { ChevronDown, BookOpen, Trophy, Eye, Heart } from 'lucide-react';

const programData = [
  {
    title: 'Pendampingan Akademik',
    icon: <BookOpen size={20} />,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    items: [
      'Melakukan diskusi rutin bulanan dengan siswa bimbingan mengenai progres akademik.',
      'Memberikan saran strategi belajar yang efektif dan sesuai dengan gaya belajar siswa.',
      'Berkoordinasi dengan guru mata pelajaran terkait perkembangan akademik siswa.',
      'Membantu siswa menyusun jadwal belajar dan target pencapaian.',
    ],
  },
  {
    title: 'Pengembangan Kompetensi',
    icon: <Trophy size={20} />,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    items: [
      'Merekomendasikan kegiatan ekstrakurikuler atau lomba yang sesuai dengan minat dan bakat siswa.',
      'Mendorong siswa untuk aktif berorganisasi di lingkungan sekolah.',
      'Membantu siswa mengidentifikasi potensi diri dan mengembangkannya.',
      'Mengarahkan siswa dalam kegiatan pengembangan soft skills.',
    ],
  },
  {
    title: 'Pengembangan Keterampilan',
    icon: <Eye size={20} />,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    items: [
      'Melakukan observasi perilaku dan sikap siswa secara berkala.',
      'Memantau kehadiran siswa dan menindaklanjuti ketidakhadiran yang berulang.',
      'Mendampingi siswa dalam mengembangkan keterampilan komunikasi dan kerja sama.',
      'Memberikan umpan balik konstruktif terhadap perkembangan keterampilan siswa.',
    ],
  },
  {
    title: 'Pengembangan Karakter',
    icon: <Heart size={20} />,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    items: [
      'Mengadakan sesi diskusi atau konseling ringan dengan siswa secara berkala.',
      'Melakukan penanganan awal terhadap permasalahan siswa.',
      'Berkoordinasi dengan guru BK untuk penanganan kasus yang lebih serius.',
      'Menanamkan nilai-nilai karakter positif melalui keteladanan dan pembiasaan.',
    ],
  },
];

export default function ProgramKegiatan() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <PageHeader
        title="Program Kegiatan"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Program Kegiatan' },
        ]}
      />

      <div className="space-y-3">
        {programData.map((program, index) => (
          <div
            key={index}
            className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${program.color}`}>
                  {program.icon}
                </div>
                <h3 className="text-[16px] font-bold text-gray-800 dark:text-white">{program.title}</h3>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <ul className="space-y-3 ml-1">
                  {program.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
