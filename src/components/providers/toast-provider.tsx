"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error";
};

type ToastContextValue = {
  pushToast: (message: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "glass-card pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-2xl",
              toast.type === "error" ? "border-rose-400/40" : "border-emerald-300/30",
            )}
          >
            {toast.type === "error" ? (
              <XCircle className="mt-0.5 h-5 w-5 text-rose-300" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            )}
            <p className="text-white/90">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
