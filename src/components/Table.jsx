export default function Table({ headers, data, renderRow }) {
  return (
    <div className="w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-soft-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${header.className || ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data && data.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
