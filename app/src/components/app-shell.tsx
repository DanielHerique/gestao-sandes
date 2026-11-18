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

function estaAtivo(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
}

// Celular: barra superior + barra inferior com até 5 itens (o último é "Mais").
// Desktop: cabeçalho superior com a navegação principal e o menu da pessoa.
export function AppShell({
  nav,
  mais = [],
  subtitulo,
  usuario,
  sino,
  logoutSlot,
  children,
}: {
  /** Itens principais. No celular, só os 4 primeiros ficam na barra inferior. */
  nav: NavItem[];
  /** Itens secundários: ficam em "Mais". */
  mais?: NavItem[];
  subtitulo: string;
  usuario: { nome: string; email: string };
  /** Rota das notificações (mostra o sino). */
  sino?: string;
  logoutSlot: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Cada menu guarda a rota em que foi aberto: ao navegar, ele fecha sozinho.
  const [maisEm, setMaisEm] = useState<string | null>(null); // "Mais"
  const [pessoaEm, setPessoaEm] = useState<string | null>(null); // menu da pessoa (desktop)
  const menuAberto = maisEm === pathname;
  const pessoaAberta = pessoaEm === pathname;
  const setMenuAberto = (v: boolean | ((a: boolean) => boolean)) =>
    setMaisEm((atual) => ((typeof v === "function" ? v(atual === pathname) : v) ? pathname : null));
  const setPessoaAberta = (v: boolean | ((a: boolean) => boolean)) =>
    setPessoaEm((atual) => ((typeof v === "function" ? v(atual === pathname) : v) ? pathname : null));

  const iniciais = usuario.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const principaisCelular = nav.slice(0, 4);
  const noMais = [...nav.slice(4), ...mais];
  const maisAtivo = noMais.some((i) => estaAtivo(pathname, i.href));
  const maisAtivoDesktop = mais.some((i) => estaAtivo(pathname, i.href));

  const marca = (
    <Link href={nav[0]?.href ?? "/"} className="flex items-center gap-3" aria-label="Início">
      <Marca />
      <span className="leading-tight">
        <span className="block text-base font-bold">Sandes</span>
        <span className="block text-xs text-foreground/60">{subtitulo}</span>
      </span>
    </Link>
  );

  const botaoSino = sino && (
    <Link
      href={sino}
      aria-label="Notificações"
      className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-brand-soft"
    >
      <Icon name="notificacoes" />
    </Link>
  );

  const linkMais = (item: NavItem) => {
    const ativo = estaAtivo(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={ativo ? "page" : undefined}
        className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-sm ${
          ativo ? "bg-brand-soft font-semibold" : "hover:bg-neutral"
        }`}
      >
        <Icon name={item.icon} className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-dvh pb-20 lg:pb-0">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 border-b bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          {marca}

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const ativo = estaAtivo(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-full px-4 text-sm ${
                    ativo ? "bg-brand-soft font-bold" : "text-foreground/70 hover:bg-neutral"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {mais.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={menuAberto}
                  onClick={() => setMenuAberto((v) => !v)}
                  className={`flex min-h-12 items-center gap-1 rounded-full px-4 text-sm ${
                    maisAtivoDesktop ? "bg-brand-soft font-bold" : "text-foreground/70 hover:bg-neutral"
                  }`}
                >
                  Mais
                </button>
                {menuAberto && (
                  <>
                    <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuAberto(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 space-y-1 rounded-2xl border bg-surface p-2" style={{ boxShadow: "var(--shadow-float)" }}>
                      {mais.map(linkMais)}
                    </div>
                  </>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {botaoSino}
            <div className="relative hidden lg:block">
              <button
                type="button"
                aria-label="Menu da conta"
                aria-expanded={pessoaAberta}
                onClick={() => setPessoaAberta((v) => !v)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-fg"
              >
                {iniciais}
              </button>
              {pessoaAberta && (
                <>
                  <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setPessoaAberta(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl bg-ink p-3 text-ink-fg" style={{ boxShadow: "var(--shadow-overlay)" }}>
                    <p className="truncate px-3.5 pt-1 text-sm font-semibold">{usuario.nome}</p>
                    <p className="truncate px-3.5 pb-2 text-xs text-ink-muted">{usuario.email}</p>
                    {logoutSlot}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Barra inferior (celular): no máximo 5 itens, o ativo ganha fundo e peso */}
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t bg-surface lg:hidden">
        <ul className="mx-auto flex max-w-md">
          {principaisCelular.map((item) => {
            const ativo = estaAtivo(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className="flex min-h-16 flex-col items-center justify-center gap-0.5 py-2 text-xs"
                >
                  <span className={`flex h-8 w-14 items-center justify-center rounded-full ${ativo ? "bg-brand-soft" : ""}`}>
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <span className={ativo ? "font-bold" : "text-foreground/70"}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((v) => !v)}
              className="flex min-h-16 w-full flex-col items-center justify-center gap-0.5 py-2 text-xs"
            >
              <span className={`flex h-8 w-14 items-center justify-center rounded-full ${menuAberto || maisAtivo ? "bg-brand-soft" : ""}`}>
                <Icon name="menu" className="h-5 w-5" />
              </span>
              <span className={menuAberto || maisAtivo ? "font-bold" : "text-foreground/70"}>Mais</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Folha "Mais" (celular) */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setMenuAberto(false)}>
          <div className="max-h-[85dvh] w-full space-y-1 overflow-y-auto rounded-t-2xl bg-surface p-3 pb-6" style={{ boxShadow: "var(--shadow-overlay)" }}>
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{usuario.nome}</p>
                <p className="truncate text-xs text-foreground/60">{usuario.email}</p>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setMenuAberto(false)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-neutral">
                <Icon name="fechar" />
              </button>
            </div>
            {noMais.map(linkMais)}
            <div className="mt-2 rounded-2xl bg-ink p-2 text-ink-fg">{logoutSlot}</div>
          </div>
        </div>
      )}
    </div>
  );
}
