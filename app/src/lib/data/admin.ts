import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { totalPontos } from "./pontuacao";

export interface CandidatoResumo {
  profile: Profile;
  planoAtivo: string | null;
  totalCandidaturas: number;
  candidaturasAtivas: number; // não fechadas/retorno_negativo
  pontos: number;
  documentosPendentes: number;
  ultimaAtividade: string | null;
}

export async function listarCarteira(): Promise<CandidatoResumo[]> {
  const supabase = await createClient();

  const { data: candidatos, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "candidato")
    .order("nome", { ascending: true });

  if (error) throw error;

  const resumos = await Promise.all(
    (candidatos ?? []).map(async (profile: Profile) => {
      const [{ data: plano }, { data: candidaturas }, pontos, { data: docs }] =
        await Promise.all([
          supabase
            .from("planos_contratados")
            .select("plano")
            .eq("candidato_id", profile.id)
            .eq("ativo", true)
            .maybeSingle(),
          supabase
            .from("candidaturas")
            .select("status, updated_at")
            .eq("candidato_id", profile.id),
          totalPontos(profile.id),
          supabase
            .from("documentos")
            .select("id")
            .eq("candidato_id", profile.id)
            .eq("status", "pendente_assinatura"),
        ]);

      const candidaturasAtivas = (candidaturas ?? []).filter(
        (c) => c.status === "indefinido" || c.status === "entrevista",
      ).length;

      const ultimaAtividade = (candidaturas ?? [])
        .map((c) => c.updated_at)
        .sort()
        .reverse()[0] ?? null;

      return {
        profile,
        planoAtivo: plano?.plano ?? null,
        totalCandidaturas: candidaturas?.length ?? 0,
        candidaturasAtivas,
        pontos,
        documentosPendentes: docs?.length ?? 0,
        ultimaAtividade,
      };
    }),
  );

  return resumos;
}

export function diasDesde(dataISO: string | null): number | null {
  if (!dataISO) return null;
  const diff = Date.now() - new Date(dataISO).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Sinais de risco de evasão (PRD 4.1 item 6 / 6.3): mais de 7 dias sem
 * atividade. Quem ainda não registrou nada só entra em risco depois de
 * 7 dias de conta. Documento pendente é sinalizado à parte, não é risco.
 */
export function temRiscoEvasao(resumo: CandidatoResumo): boolean {
  const dias = diasDesde(resumo.ultimaAtividade);
  if (dias === null) {
    return (diasDesde(resumo.profile.created_at) ?? 0) > 7;
  }
  return dias > 7;
}

export function paraLinhasCarteira(carteira: CandidatoResumo[]) {
  return carteira.map((c) => ({
    id: c.profile.id,
    nome: c.profile.nome,
    email: c.profile.email,
    plano: c.planoAtivo,
    candidaturasAtivas: c.candidaturasAtivas,
    totalCandidaturas: c.totalCandidaturas,
    pontos: c.pontos,
    diasSemAtividade: diasDesde(c.ultimaAtividade),
    documentosPendentes: c.documentosPendentes,
    risco: temRiscoEvasao(c),
    entrouEm: c.profile.created_at,
  }));
}
