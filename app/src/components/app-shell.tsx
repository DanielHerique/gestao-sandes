"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, Marca } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Mobile-first: barra superior + menu em tela cheia no celular;
// menu lateral escuro e fixo a partir de `lg`.
export function AppShell({
  nav,
  subtitulo,
  usuario,
  logoutSlot,
  children,
}: {
  nav: NavItem[];
  subtitulo: string;
  usuario: { nome: string; email: string };
  logoutSlot: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const iniciais = usuario.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const marca = (
    <div className="flex items-center gap-3">
      <Marca />
      <span className="leading-tight">
        <span className="block font-display text-[17px] font-semibold tracking-tight text-ink-fg">
          Sandes
        </span>
        <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {subtitulo}
        </span>
      </span>
    </div>
  );

  const links = (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const ativo =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAberto(false)}
            aria-current={ativo ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
              ativo
                ? "bg-white/[0.07] font-medium text-ink-fg"
                : "text-ink-muted hover:bg-white/[0.04] hover:text-ink-fg"
            }`}
          >
            {ativo && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand" />
            )}
            <Icon
              name={item.icon}
              className={`h-[18px] w-[18px] ${ativo ? "text-brand" : ""}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const rodape = (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-ink-fg">
          {iniciais}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-medium text-ink-fg">
            {usuario.nome}
          </span>
          <span className="block truncate text-xs text-ink-muted">
            {usuario.email}
          </span>
        </span>
      </div>
      {logoutSlot}
    </div>
  );

  return (
    <div className="min-h-dvh lg:flex">
      {/* Barra superior (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        {marca}
        <button
          type="button"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          onClick={() => setAberto((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-ink-fg"
        >
          <Icon name={aberto ? "fechar" : "menu"} />
        </button>
      </header>

      {/* Menu em tela cheia (mobile) */}
      {aberto && (
        <div className="fixed inset-x-0 bottom-0 top-[65px] z-20 flex flex-col justify-between overflow-y-auto bg-ink p-4 lg:hidden">
          {links}
          <div className="mt-8">{rodape}</div>
        </div>
      )}

      {/* Menu lateral (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-ink p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div>
          <div className="mb-10 px-1 pt-1">{marca}</div>
          {links}
        </div>
        {rodape}
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
