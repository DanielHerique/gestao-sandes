import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listarCarteira, diasDesde, temRiscoEvasao } from "@/lib/data/admin";
import { PLANO_LABELS } from "@/lib/types/database";

export default async function CarteiraPage() {
  await requireAdmin();
  const carteira = await listarCarteira();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Carteira de candidatos</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-neutral-500">
            <th className="py-2">Nome</th>
            <th className="py-2">Plano</th>
            <th className="py-2">Candidaturas ativas</th>
            <th className="py-2">Pontos</th>
            <th className="py-2">Última atividade</th>
            <th className="py-2">Risco</th>
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
              <td className="py-2">
                {temRiscoEvasao(c) && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Risco
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
