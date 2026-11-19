// Esqueletos de carregamento: usam só tokens do design system (bg-neutral, line, rounded-*).
// A animação some sozinha com prefers-reduced-motion (regra global em globals.css).

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Bloco base. Passe largura e altura por className (ex.: "h-4 w-1/2"). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-pulse rounded-xl bg-neutral", className)}
    />
  );
}

/** Envolve uma tela inteira: avisa leitores de tela e esconde o conteúdo falso. */
export function TelaCarregando({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">Carregando</span>
      {children}
    </div>
  );
}

/** Eyebrow, título e subtítulo opcional. */
export function SkeletonCabecalho({ subtitulo = false }: { subtitulo?: boolean }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-2/3 max-w-md" />
      {subtitulo && <Skeleton className="h-4 w-full max-w-lg" />}
    </div>
  );
}

/** Cartão claro com título e algumas linhas. */
export function SkeletonCartao({
  linhas = 3,
  className,
}: {
  linhas?: number;
  className?: string;
}) {
  return (
    <div className={cx("rounded-2xl border bg-surface p-5 sm:p-6", className)}>
      <Skeleton className="h-5 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: linhas }).map((_, i) => (
          <Skeleton key={i} className={cx("h-4", i === linhas - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** Lista de linhas (cartões estreitos), como Fila de hoje e documentos. */
export function SkeletonLista({ itens = 4 }: { itens?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: itens }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-xl border bg-surface p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

/** Grade de números (4 no desktop, 2 no celular). */
export function SkeletonNumeros({ itens = 4 }: { itens?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: itens }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-surface p-4">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-3 h-8 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** Quadro de vagas: 4 colunas com cartões. */
export function SkeletonKanban() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, c) => (
        <div key={c} className="rounded-2xl border bg-surface p-3">
          <Skeleton className="mb-3 h-4 w-1/2" />
          <div className="space-y-2">
            {Array.from({ length: c === 0 ? 3 : c === 1 ? 2 : 1 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tabela simples (cabeçalho e linhas). */
export function SkeletonTabela({ linhas = 6 }: { linhas?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-surface">
      <div className="border-b p-4">
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
