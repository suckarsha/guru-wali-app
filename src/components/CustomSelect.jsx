import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = '-- Pilih --', searchable = false, required = false, icon = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value));

  const filteredOptions = searchable && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (optValue) => {
    onChange({ target: { value: optValue } });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={ref}>
      {/* Hidden native select for form validation */}
      {required && (
        <select
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 h-0 w-0 pointer-events-none"
          tabIndex={-1}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}

      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800/50 border rounded-xl text-sm transition-all duration-200 shadow-sm outline-none ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-primary/60 flex-shrink-0">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-primary/60 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-primary/40 transition-colors placeholder-gray-400"
                />
              </div>
            </div>
          )}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ditemukan</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    String(option.value) === String(value)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    String(option.value) === String(value) ? 'bg-primary' : 'bg-transparent'
                  }`} />
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
