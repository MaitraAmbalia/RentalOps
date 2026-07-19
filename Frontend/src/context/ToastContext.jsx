import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    bar: 'bg-emerald-500',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
  },
  error: {
    bar: 'bg-rose-500',
    icon: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
  info: {
    bar: 'bg-blue-500',
    icon: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
  },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error   = useCallback((msg, dur) => toast(msg, 'error', dur), [toast]);
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast]);
  const info    = useCallback((msg, dur) => toast(msg, 'info', dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: '380px', width: '100%' }}
      >
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.info;
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto relative flex items-start gap-3 rounded-2xl border px-4 py-3.5
                bg-white dark:bg-slate-900 shadow-xl shadow-black/10
                ${s.border} overflow-hidden
                transition-all duration-300 ease-out
                ${t.exiting ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}
              `}
              style={{ backdropFilter: 'blur(12px)' }}
            >
              {/* Left colour bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />

              {/* Icon */}
              <div className={`mt-0.5 shrink-0 ${s.icon}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Message */}
              <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug pr-2">
                {t.message}
              </p>

              {/* Close */}
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Progress bar */}
              <div
                className={`absolute bottom-0 left-1 right-0 h-0.5 ${s.bar} opacity-30 rounded-full`}
                style={{
                  animation: 'shrink 4s linear forwards',
                }}
              />
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
