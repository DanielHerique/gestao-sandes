import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import {
  diasDesde,
  listarCarteira,
  paraLinhasCarteira,
  temRiscoEvasao,
} from "@/lib/data/admin";
import { CarteiraComFiltros } from "@/components/admin/carteira";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const carteira = await listarCarteira();

  const emRisco = carteira.filter(temRiscoEvasao);
  const engajados = carteira.length - emRisco.length;
  const comDocPendente = carteira.filter((c) => c.documentosPendentes > 0);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Dashboard de carteira</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Total de candidatos</p>
          <p className="text-2xl font-semibold">{carteira.length}</p>
        </div>
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Engajados</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {engajados}
          </p>
        </div>
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Risco de evasão</p>
          <p className="text-2xl font-semibold text-rose-600">
            {emRisco.length}
          </p>
        </div>
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Documentos pendentes</p>
          <p className="text-2xl font-semibold text-amber-600">
            {comDocPendente.length}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-foreground/60">
        Alertas de risco de evasão
      </h2>
      {emRisco.length === 0 ? (
        <p className="mb-6 text-sm text-foreground/60">
          Nenhum candidato com sinais de baixo engajamento no momento.
        </p>
      ) : (
        <ul className="mb-6 space-y-2">
          {emRisco.map((c) => {
            const dias = diasDesde(c.ultimaAtividade);
            return (
              <li
                key={c.profile.id}
                className="flex flex-col gap-1 rounded-lg border border-rose-200 sm:flex-row sm:items-center sm:justify-between bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/20"
              >
                <Link
                  href={`/admin/candidatos/${c.profile.id}`}
                  className="font-medium hover:underline"
                >
                  {c.profile.nome}
                </Link>
                <span className="text-foreground/60">
                  {dias === null
                    ? "Sem atividade registrada"
                    : `${dias} dias sem atividade`}
                  {c.documentosPendentes > 0 &&
                    ` · ${c.documentosPendentes} documento(s) pendente(s)`}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mb-3 text-sm font-semibold text-foreground/60">
        Toda a carteira
      </h2>
      <CarteiraComFiltros linhas={paraLinhasCarteira(carteira)} />
    </div>
  );
}
