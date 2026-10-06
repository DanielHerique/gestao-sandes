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

// ---------- Carteira paginada (filtros e ordenação no banco) ----------
export interface FiltrosCarteira {
  busca?: string;
  plano?: string;
  situacao?: string;
  ordem?: string;
  pagina: number;
  tamanho: number;
}

export interface LinhaCarteiraDados {
  id: string;
  nome: string;
  email: string;
  plano: string | null;
  candidaturasAtivas: number;
  totalCandidaturas: number;
  pontos: number;
  diasSemAtividade: number | null;
  documentosPendentes: number;
  risco: boolean;
  entrouEm: string;
}

interface LinhaView {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  plano: string | null;
  total_candidaturas: number;
  candidaturas_ativas: number;
  pontos: number;
  documentos_pendentes: number;
  ultima_atividade: string | null;
  risco: boolean;
}

function deLinhaView(l: LinhaView): LinhaCarteiraDados {
  return {
    id: l.id,
    nome: l.nome,
    email: l.email,
    plano: l.plano,
    candidaturasAtivas: l.candidaturas_ativas,
    totalCandidaturas: l.total_candidaturas,
    pontos: l.pontos,
    diasSemAtividade: diasDesde(l.ultima_atividade),
    documentosPendentes: l.documentos_pendentes,
    risco: l.risco,
    entrouEm: l.created_at,
  };
}

export async function carteiraPaginada(
  f: FiltrosCarteira,
): Promise<{ linhas: LinhaCarteiraDados[]; total: number }> {
  const supabase = await createClient();
  const de = (f.pagina - 1) * f.tamanho;

  let q = supabase.from("carteira_resumo").select("*", { count: "exact" });
  const busca = f.busca?.trim().replace(/[%,()]/g, " ");
  if (busca) q = q.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`);
  if (f.plano === "sem_plano") q = q.is("plano", null);
  else if (f.plano) q = q.eq("plano", f.plano);
  if (f.situacao === "risco") q = q.eq("risco", true);
  if (f.situacao === "engajado") q = q.eq("risco", false);
  if (f.situacao === "doc_pendente") q = q.gt("documentos_pendentes", 0);
  if (f.situacao === "sem_candidaturas") q = q.eq("total_candidaturas", 0);

  if (f.ordem === "pontos") q = q.order("pontos", { ascending: false });
  else if (f.ordem === "atividade")
    q = q.order("ultima_atividade", { ascending: true, nullsFirst: true });
  else if (f.ordem === "entrada") q = q.order("created_at", { ascending: false });
  else q = q.order("nome", { ascending: true });

  const { data, error, count } = await q.range(de, de + f.tamanho - 1);

  if (!error) {
    return { linhas: ((data ?? []) as LinhaView[]).map(deLinhaView), total: count ?? 0 };
  }

  // Alternativa enquanto a migration 0005 não foi aplicada: calcula em memória.
  const todas = paraLinhasCarteira(await listarCarteira());
  const termo = f.busca?.trim().toLowerCase();
  const filtradas = todas.filter((l) => {
    if (termo && !`${l.nome} ${l.email}`.toLowerCase().includes(termo)) return false;
    if (f.plano === "sem_plano" && l.plano) return false;
    if (f.plano && f.plano !== "sem_plano" && l.plano !== f.plano) return false;
    if (f.situacao === "risco" && !l.risco) return false;
    if (f.situacao === "engajado" && l.risco) return false;
    if (f.situacao === "doc_pendente" && l.documentosPendentes === 0) return false;
    if (f.situacao === "sem_candidaturas" && l.totalCandidaturas > 0) return false;
    return true;
  });
  filtradas.sort((a, b) => {
    if (f.ordem === "pontos") return b.pontos - a.pontos;
    if (f.ordem === "atividade") return (b.diasSemAtividade ?? 9999) - (a.diasSemAtividade ?? 9999);
    if (f.ordem === "entrada") return b.entrouEm.localeCompare(a.entrouEm);
    return a.nome.localeCompare(b.nome);
  });
  return { linhas: filtradas.slice(de, de + f.tamanho), total: filtradas.length };
}

export async function resumoDaCarteira(): Promise<{
  total: number;
  risco: number;
  comDocumentoPendente: number;
  emRisco: LinhaCarteiraDados[];
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carteira_resumo")
    .select("*")
    .or("risco.eq.true,documentos_pendentes.gt.0")
    .order("ultima_atividade", { ascending: true, nullsFirst: true })
    .limit(200);
  const { count: total } = await supabase
    .from("carteira_resumo")
    .select("id", { count: "exact", head: true });

  if (!error) {
    const linhas = ((data ?? []) as LinhaView[]).map(deLinhaView);
    return {
      total: total ?? 0,
      risco: linhas.filter((l) => l.risco).length,
      comDocumentoPendente: linhas.filter((l) => l.documentosPendentes > 0).length,
      emRisco: linhas.filter((l) => l.risco).slice(0, 8),
    };
  }

  const todas = paraLinhasCarteira(await listarCarteira());
  return {
    total: todas.length,
    risco: todas.filter((l) => l.risco).length,
    comDocumentoPendente: todas.filter((l) => l.documentosPendentes > 0).length,
    emRisco: todas.filter((l) => l.risco).slice(0, 8),
  };
}
