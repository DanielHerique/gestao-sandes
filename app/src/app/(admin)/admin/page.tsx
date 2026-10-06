import Link from "next/link";
import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth/session";
import { resumoDaCarteira } from "@/lib/data/admin";
import { PLANO_LABELS } from "@/lib/types/database";

function Numero({ rotulo, valor, tom }: { rotulo: string; valor: number; tom?: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-5">
      <p className="eyebrow !text-foreground/50">{rotulo}</p>
      <p className={`num mt-3 font-display text-5xl font-semibold leading-none ${tom ?? ""}`}>{valor}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const r = await resumoDaCarteira();
  const engajados = Math.max(0, r.total - r.risco);

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Visão geral</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Dashboard de carteira</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Numero rotulo="Total de candidatos" valor={r.total} />
        <Numero rotulo="Engajados" valor={engajados} tom="text-emerald-600" />
        <Numero rotulo="Risco de evasão" valor={r.risco} tom="text-rose-600" />
        <Numero rotulo="Documentos pendentes" valor={r.comDocumentoPendente} tom="text-amber-600" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground/60">Alertas de risco de evasão</h2>
          <Link href="/admin/candidatos?situacao=risco" className="text-sm font-medium text-brand-strong hover:underline">
            Ver todos
          </Link>
        </div>
        {r.emRisco.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/60">
            Nenhum candidato com sinais de baixo engajamento no momento.
          </p>
        ) : (
          <ul className="space-y-2">
            {r.emRisco.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/candidatos/${c.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-4 text-sm transition-colors hover:bg-rose-500/10 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">
                    {c.nome}
                    {c.plano && (
                      <span className="ml-2 font-normal text-foreground/55">
                        {PLANO_LABELS[c.plano as keyof typeof PLANO_LABELS]}
                      </span>
                    )}
                  </span>
                  <span className="text-foreground/60">
                    {c.diasSemAtividade === null ? "Sem atividade registrada" : `${c.diasSemAtividade} dias sem atividade`}
                    {c.documentosPendentes > 0 && ` · ${c.documentosPendentes} documento(s) pendente(s)`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/admin/candidatos"
        className="group flex items-center justify-between rounded-2xl bg-ink p-5 text-ink-fg"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <span>
          <span className="eyebrow !text-brand">Carteira</span>
          <span className="mt-1 block font-display text-2xl font-semibold">Ver todos os candidatos</span>
          <span className="mt-0.5 block text-sm text-ink-muted">Busca, filtros por plano e situação, ordenação.</span>
        </span>
        <Icon name="seta" className="h-6 w-6 text-brand transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
