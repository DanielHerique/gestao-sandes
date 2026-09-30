import { CANDIDATURA_STATUS_LABELS, PLANO_LABELS } from "@/lib/types/database";
import { listarCandidaturas } from "./candidaturas";
import { obterPlanoAtivo } from "./planos";
import { listarDocumentos } from "./documentos";
import { listarEventosPontuacao, totalPontos } from "./pontuacao";
import { nivelAtual } from "@/lib/gamification/pontos";
import { createClient } from "@/lib/supabase/server";

export interface RelatorioEngajamento {
  candidatoNome: string;
  candidatoEmail: string;
  plano: string;
  nivel: string;
  pontos: number;
  totalCandidaturas: number;
  candidaturasPorStatus: Record<string, number>;
  documentosPendentes: number;
  totalEventosPontuacao: number;
  ultimosEventos: { acao: string; pontos: number; data: string }[];
  geradoEm: string;
}

/** Relatório de engajamento exportável — PRD 4.1 item 4 */
export async function gerarRelatorioEngajamento(
  candidatoId: string,
): Promise<RelatorioEngajamento> {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("nome, email")
    .eq("id", candidatoId)
    .single();

  if (error || !profile) throw new Error("Candidato não encontrado");

  const [candidaturas, planoAtivo, documentos, pontos, eventos] =
    await Promise.all([
      listarCandidaturas(candidatoId),
      obterPlanoAtivo(candidatoId),
      listarDocumentos(candidatoId),
      totalPontos(candidatoId),
      listarEventosPontuacao(candidatoId),
    ]);

  const candidaturasPorStatus: Record<string, number> = {};
  for (const status of Object.keys(CANDIDATURA_STATUS_LABELS)) {
    candidaturasPorStatus[CANDIDATURA_STATUS_LABELS[status as keyof typeof CANDIDATURA_STATUS_LABELS]] =
      candidaturas.filter((c) => c.status === status).length;
  }

  const nivel = nivelAtual(pontos);

  return {
    candidatoNome: profile.nome,
    candidatoEmail: profile.email,
    plano: planoAtivo ? PLANO_LABELS[planoAtivo.plano] : "Nenhum plano atribuído",
    nivel: nivel.nome,
    pontos,
    totalCandidaturas: candidaturas.length,
    candidaturasPorStatus,
    documentosPendentes: documentos.filter(
      (d) => d.status === "pendente_assinatura",
    ).length,
    totalEventosPontuacao: eventos.length,
    ultimosEventos: eventos.slice(0, 15).map((e) => ({
      acao: e.acao,
      pontos: e.pontos,
      data: e.created_at,
    })),
    geradoEm: new Date().toISOString(),
  };
}
