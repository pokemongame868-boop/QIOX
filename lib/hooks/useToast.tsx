'use client';
// lib/hooks/useToast.tsx
// Global toast notification system using React Context

import {
  createContext, useContext, useState, useCallback,
  ReactNode, useEffect, useRef,
} from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
  duration?: number; // ms, default 3500
}

interface ToastContextValue {
  toasts:  Toast[];
  toast:   (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ── Context ───────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5

    const duration = opts.duration ?? 3500;
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) =>
    toast({ type: 'success', title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) =>
    toast({ type: 'error', title, message, duration: 5000 }), [toast]);
  const warning = useCallback((title: string, message?: string) =>
    toast({ type: 'warning', title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) =>
    toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Toast Item ────────────────────────────────────────────
const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-brand-green/30 bg-brand-green/10',
  error:   'border-red-500/30    bg-red-500/10',
  warning: 'border-amber-500/30  bg-amber-500/10',
  info:    'border-brand-blue/30 bg-brand-blue/10',
};

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-brand-green',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-brand-blue-light',
};

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const progressRef = useRef<HTMLDivElement>(null);
  const duration = toast.duration ?? 3500;

  useEffect(() => {
    if (!progressRef.current) return;
    progressRef.current.style.transition = `width ${duration}ms linear`;
    progressRef.current.style.width = '0%';
  }, [duration]);

  return (
    <div className={cn(
      'relative flex items-start gap-3 px-4 py-3.5 rounded-xl border',
      'shadow-card backdrop-blur-md bg-dark-surface/95',
      'animate-slide-in min-w-[280px] max-w-sm overflow-hidden',
      STYLES[toast.type]
    )}>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-dark-border">
        <div
          ref={progressRef}
          className={cn('h-full w-full transition-all', ICON_COLORS[toast.type], 'bg-current')}
        />
      </div>

      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', ICON_COLORS[toast.type])} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => dismiss(toast.id)}
        className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Container ─────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}
