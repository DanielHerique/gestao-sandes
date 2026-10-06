"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Mobile-first: barra superior + menu deslizante no celular;
// menu lateral fixo a partir de `lg`.
export function AppShell({
  nav,
  subtitulo,
  logoutSlot,
  children,
}: {
  nav: NavItem[];
  subtitulo: string;
  logoutSlot: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const marca = (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-base font-bold text-brand-fg">
        S
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Sandes</span>
        <span className="block text-xs text-foreground/60">{subtitulo}</span>
      </span>
    </div>
  );

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const ativo =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAberto(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              ativo
                ? "bg-brand-soft font-medium text-brand-strong"
                : "hover:bg-brand-soft/60"
            }`}
          >
            <span aria-hidden className="w-5 text-center text-base">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh lg:flex">
      {/* Barra superior (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-surface px-4 py-3 lg:hidden">
        {marca}
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={aberto}
          onClick={() => setAberto((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border text-lg"
        >
          {aberto ? "✕" : "☰"}
        </button>
      </header>

      {/* Menu deslizante (mobile) */}
      {aberto && (
        <div className="fixed inset-x-0 bottom-0 top-[65px] z-20 flex flex-col justify-between overflow-y-auto bg-surface p-4 lg:hidden">
          {links}
          <div className="mt-6 border-t pt-4">{logoutSlot}</div>
        </div>
      )}

      {/* Menu lateral (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r bg-surface p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div>
          <div className="mb-8 px-1">{marca}</div>
          {links}
        </div>
        <div>{logoutSlot}</div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
