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
import { VerMais } from "@/components/ui/ver-mais";
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

  const [{ data: shazam }, { data: autoconhecimento }, { data: pdi }, { count: linhasMestra }] =
    await Promise.all([
      supabase.from("exercicio_shazam").select("status").eq("candidato_id", id).maybeSingle(),
      supabase.from("exercicio_autoconhecimento").select("status").eq("candidato_id", id).maybeSingle(),
      supabase.from("exercicio_pdi_status").select("status").eq("candidato_id", id).maybeSingle(),
      supabase.from("exercicio_lista_mestra_linhas").select("id", { count: "exact", head: true }).eq("candidato_id", id),
    ]);
  const exercicios = [
    { nome: "Lista Mestra", status: (linhasMestra ?? 0) > 0 ? `${linhasMestra} experiência(s)` : "nao_iniciado" },
    { nome: "Ferramenta Shazam", status: shazam?.status ?? "nao_iniciado" },
    { nome: "Autoconhecimento", status: autoconhecimento?.status ?? "nao_iniciado" },
    { nome: "PDI", status: pdi?.status ?? "nao_iniciado" },
  ];
  const ROTULO_EX: Record<string, string> = {
    nao_iniciado: "Não iniciado",
    em_andamento: "Em andamento",
    concluido: "Concluído",
  };
  const ROTULO_DOC: Record<string, string> = {
    liberado: "Liberado",
    nao_liberado: "Não liberado",
    pendente_assinatura: "Pendente de assinatura",
    assinado: "Assinado",
    vencido: "Vencido",
  };

  const nivel = nivelAtual(pontos);
  const docsPendentes = documentos.filter(
    (d) => d.status === "pendente_assinatura",
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">{candidato.nome}</h1>
        <RelatorioButton candidatoId={id} />
      </div>
      <p className="mb-6 text-sm text-foreground/60">{candidato.email}</p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Plano contratado</p>
          <div className="mt-1">
            <AtribuirPlano
              candidatoId={id}
              planoAtual={planoAtivo?.plano ?? null}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Nível / pontos</p>
          <p className="text-lg font-semibold">
            {nivel.nome} ({pontos} pts)
          </p>
        </div>
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-sm text-foreground/60">Documentos pendentes</p>
          <p className="text-lg font-semibold">{docsPendentes.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Candidaturas ({candidaturas.length})
          </h2>
          <ul className="space-y-2">
            <VerMais inicial={5} passo={10}>
            {candidaturas.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border bg-surface p-3 text-sm"
              >
                <p className="font-medium">
                  {c.cargo} — {c.empresa}
                </p>
                <p className="text-xs text-foreground/60">
                  {CANDIDATURA_STATUS_LABELS[c.status]}
                </p>
              </li>
            ))}
            </VerMais>
            {candidaturas.length === 0 && (
              <p className="text-sm text-foreground/60">Nenhuma candidatura.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Exercícios
          </h2>
          <ul className="space-y-2">
            {exercicios.map((e) => (
              <li key={e.nome} className="flex items-center justify-between rounded-lg border bg-surface p-3 text-sm">
                <span>{e.nome}</span>
                <span className="text-foreground/60">{ROTULO_EX[e.status] ?? e.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Documentos ({documentos.length})
          </h2>
          <ul className="space-y-2">
            <VerMais inicial={5} passo={10}>
            {documentos.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border bg-surface p-3 text-sm">
                <span className="min-w-0 truncate">{d.titulo}</span>
                <span className="shrink-0 text-foreground/60">{ROTULO_DOC[d.status] ?? d.status}</span>
              </li>
            ))}
            </VerMais>
            {documentos.length === 0 && (
              <p className="text-sm text-foreground/60">Nenhum documento enviado.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Análises de currículo ({analises.length})
          </h2>
          <ul className="space-y-2">
            <VerMais inicial={5} passo={10}>
            {analises.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border bg-surface p-3 text-sm"
              >
                {a.sucesso ? `Score ${a.score_geral}` : "Falha na análise"} —{" "}
                {new Date(a.created_at).toLocaleDateString("pt-BR")}
              </li>
            ))}
            </VerMais>
            {analises.length === 0 && (
              <p className="text-sm text-foreground/60">Nenhuma análise.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Linha do tempo de pontuação
          </h2>
          <ul className="space-y-1">
            <VerMais inicial={6} passo={10}>
            {eventos.map((e) => (
              <li key={e.id} className="text-sm">
                <span className="text-foreground/60">
                  {new Date(e.created_at).toLocaleDateString("pt-BR")}
                </span>{" "}
                — {e.acao} (+{e.pontos})
              </li>
            ))}
            </VerMais>
            {eventos.length === 0 && (
              <p className="text-sm text-foreground/60">Sem eventos ainda.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">
            Anotações privadas
          </h2>
          <Anotacoes candidatoId={id} anotacoes={anotacoes} />
        </section>
      </div>
    </div>
  );
}
