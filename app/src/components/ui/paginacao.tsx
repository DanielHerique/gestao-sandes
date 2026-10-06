import Link from "next/link";

// Paginação por link (?pagina=N): funciona no servidor, sem carregar a lista inteira.
export function Paginacao({
  pagina,
  totalPaginas,
  caminho,
  extra,
}: {
  pagina: number;
  totalPaginas: number;
  caminho: string;
  extra?: Record<string, string | undefined>;
}) {
  if (totalPaginas <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(extra ?? {})) if (v) qs.set(k, v);
    qs.set("pagina", String(p));
    return `${caminho}?${qs.toString()}`;
  };

  // Janela curta de números: 1 … 4 5 6 … 12
  const nums: (number | "…")[] = [];
  for (let p = 1; p <= totalPaginas; p++) {
    if (p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  const base = "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm";
  return (
    <nav aria-label="Paginação" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      {pagina > 1 ? (
        <Link href={href(pagina - 1)} className={`${base} hover:bg-brand-soft`}>
          Anterior
        </Link>
      ) : (
        <span className={`${base} opacity-40`}>Anterior</span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="px-1 text-foreground/40">…</span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === pagina ? "page" : undefined}
            className={`${base} num ${n === pagina ? "border-transparent bg-ink text-ink-fg" : "hover:bg-brand-soft"}`}
          >
            {n}
          </Link>
        ),
      )}
      {pagina < totalPaginas ? (
        <Link href={href(pagina + 1)} className={`${base} hover:bg-brand-soft`}>
          Próxima
        </Link>
      ) : (
        <span className={`${base} opacity-40`}>Próxima</span>
      )}
    </nav>
  );
}

export function lerPagina(valor: string | string[] | undefined): number {
  const n = Number(Array.isArray(valor) ? valor[0] : valor);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}
