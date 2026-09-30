import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { diasDesde, listarCarteira, temRiscoEvasao } from "@/lib/data/admin";
import { PLANO_LABELS } from "@/lib/types/database";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const carteira = await listarCarteira();

  const emRisco = carteira.filter(temRiscoEvasao);
  const engajados = carteira.length - emRisco.length;
  const comDocPendente = carteira.filter((c) => c.documentosPendentes > 0);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Dashboard de carteira</h1>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total de candidatos</p>
          <p className="text-2xl font-semibold">{carteira.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Engajados</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {engajados}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Risco de evasão</p>
          <p className="text-2xl font-semibold text-rose-600">
            {emRisco.length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Documentos pendentes</p>
          <p className="text-2xl font-semibold text-amber-600">
            {comDocPendente.length}
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-neutral-500">
        Alertas de risco de evasão
      </h2>
      {emRisco.length === 0 ? (
        <p className="mb-6 text-sm text-neutral-500">
          Nenhum candidato com sinais de baixo engajamento no momento.
        </p>
      ) : (
        <ul className="mb-6 space-y-2">
          {emRisco.map((c) => {
            const dias = diasDesde(c.ultimaAtividade);
            return (
              <li
                key={c.profile.id}
                className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/20"
              >
                <Link
                  href={`/admin/candidatos/${c.profile.id}`}
                  className="font-medium hover:underline"
                >
                  {c.profile.nome}
                </Link>
                <span className="text-neutral-500">
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

      <h2 className="mb-3 text-sm font-semibold text-neutral-500">
        Toda a carteira
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-neutral-500">
            <th className="py-2">Nome</th>
            <th className="py-2">Plano</th>
            <th className="py-2">Candidaturas ativas</th>
            <th className="py-2">Pontos</th>
            <th className="py-2">Última atividade</th>
          </tr>
        </thead>
        <tbody>
          {carteira.map((c) => (
            <tr key={c.profile.id} className="border-b last:border-0">
              <td className="py-2">
                <Link
                  href={`/admin/candidatos/${c.profile.id}`}
                  className="hover:underline"
                >
                  {c.profile.nome}
                </Link>
              </td>
              <td className="py-2">
                {c.planoAtivo
                  ? PLANO_LABELS[c.planoAtivo as keyof typeof PLANO_LABELS]
                  : "—"}
              </td>
              <td className="py-2">{c.candidaturasAtivas}</td>
              <td className="py-2">{c.pontos}</td>
              <td className="py-2">
                {diasDesde(c.ultimaAtividade) === null
                  ? "—"
                  : `${diasDesde(c.ultimaAtividade)}d atrás`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
