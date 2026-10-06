"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";

// Folha deslizante no celular, caixa centralizada no computador.
// O conteúdo rola na vertical dentro do modal; a página nunca rola para o lado.
export function Modal({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = anterior;
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface sm:rounded-3xl"
        style={{ boxShadow: "var(--shadow-lift)", animation: "toast-in .22s ease-out" }}
      >
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h2 className="text-2xl leading-tight">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 truncate text-sm text-foreground/60">{subtitulo}</p>}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border hover:bg-brand-soft"
          >
            <Icon name="fechar" className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-7">{children}</div>
        {rodape && <footer className="border-t px-5 py-4 sm:px-7">{rodape}</footer>}
      </div>
    </div>
  );
}
