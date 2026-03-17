import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 ease-out translate-y-0 opacity-100 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
              'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
            {toast.type === 'error' && <XCircle className="text-red-500 shrink-0" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-500 shrink-0" size={20} />}
            
            <p className="text-sm font-medium">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
