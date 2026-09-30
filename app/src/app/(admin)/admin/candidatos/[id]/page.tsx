import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listarCandidaturas } from "@/lib/data/candidaturas";
import { obterPlanoAtivo } from "@/lib/data/planos";
import { listarDocumentos } from "@/lib/data/documentos";
import { listarAnalises } from "@/lib/data/curriculo";
import { totalPontos, listarEventosPontuacao } from "@/lib/data/pontuacao";
import { listarAnotacoes } from "@/lib/data/anotacoes";
import {
  CANDIDATURA_STATUS_LABELS,
  type Profile,
} from "@/lib/types/database";
import { nivelAtual } from "@/lib/gamification/pontos";
import { AtribuirPlano } from "@/components/admin/atribuir-plano";
import { Anotacoes } from "@/components/admin/anotacoes";
import { RelatorioButton } from "@/components/admin/relatorio-button";

export default async function CandidatoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();
  const candidato = profile as Profile;

  const [candidaturas, planoAtivo, documentos, analises, pontos, eventos, anotacoes] =
    await Promise.all([
      listarCandidaturas(id),
      obterPlanoAtivo(id),
      listarDocumentos(id),
      listarAnalises(id),
      totalPontos(id),
      listarEventosPontuacao(id),
      listarAnotacoes(id),
    ]);

  const nivel = nivelAtual(pontos);
  const docsPendentes = documentos.filter(
    (d) => d.status === "pendente_assinatura",
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{candidato.nome}</h1>
        <RelatorioButton candidatoId={id} />
      </div>
      <p className="mb-6 text-sm text-neutral-500">{candidato.email}</p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Plano contratado</p>
          <div className="mt-1">
            <AtribuirPlano
              candidatoId={id}
              planoAtual={planoAtivo?.plano ?? null}
            />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Nível / pontos</p>
          <p className="text-lg font-semibold">
            {nivel.nome} ({pontos} pts)
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Documentos pendentes</p>
          <p className="text-lg font-semibold">{docsPendentes.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Candidaturas ({candidaturas.length})
          </h2>
          <ul className="space-y-2">
            {candidaturas.map((c) => (
              <li
                key={c.id}
                className="rounded-md border p-2 text-sm dark:border-neutral-800"
              >
                <p className="font-medium">
                  {c.cargo} — {c.empresa}
                </p>
                <p className="text-xs text-neutral-500">
                  {CANDIDATURA_STATUS_LABELS[c.status]}
                </p>
              </li>
            ))}
            {candidaturas.length === 0 && (
              <p className="text-sm text-neutral-500">Nenhuma candidatura.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Análises de currículo ({analises.length})
          </h2>
          <ul className="space-y-2">
            {analises.map((a) => (
              <li
                key={a.id}
                className="rounded-md border p-2 text-sm dark:border-neutral-800"
              >
                {a.sucesso ? `Score ${a.score_geral}` : "Falha na análise"} —{" "}
                {new Date(a.created_at).toLocaleDateString("pt-BR")}
              </li>
            ))}
            {analises.length === 0 && (
              <p className="text-sm text-neutral-500">Nenhuma análise.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Linha do tempo de pontuação
          </h2>
          <ul className="space-y-1">
            {eventos.slice(0, 10).map((e) => (
              <li key={e.id} className="text-sm">
                <span className="text-neutral-500">
                  {new Date(e.created_at).toLocaleDateString("pt-BR")}
                </span>{" "}
                — {e.acao} (+{e.pontos})
              </li>
            ))}
            {eventos.length === 0 && (
              <p className="text-sm text-neutral-500">Sem eventos ainda.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">
            Anotações privadas
          </h2>
          <Anotacoes candidatoId={id} anotacoes={anotacoes} />
        </section>
      </div>
    </div>
  );
}
