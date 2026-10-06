import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LIMITE_DIARIO_POR_ACAO,
  PONTOS_POR_ACAO,
  type AcaoPontuavel,
} from "@/lib/gamification/pontos";
import type { PontuacaoEvento } from "@/lib/types/database";

export async function listarEventosPontuacao(
  candidatoId: string,
): Promise<PontuacaoEvento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pontuacao_eventos")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as PontuacaoEvento[];
}

export async function listarEventosPaginados(
  candidatoId: string,
  { pagina = 1, tamanho = 10 }: { pagina?: number; tamanho?: number } = {},
): Promise<{ itens: PontuacaoEvento[]; total: number }> {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  const { data, error, count } = await supabase
    .from("pontuacao_eventos")
    .select("*", { count: "exact" })
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false })
    .range(de, de + tamanho - 1);
  if (error) throw error;
  return { itens: (data ?? []) as PontuacaoEvento[], total: count ?? 0 };
}

export async function totalPontos(candidatoId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pontuacao_eventos")
    .select("pontos")
    .eq("candidato_id", candidatoId);

  if (error) throw error;
  return (data ?? []).reduce((total, row) => total + row.pontos, 0);
}

/**
 * Registra um evento de pontuação, respeitando o limite diário por ação
 * (PRD 6.1 "regras de integridade" — evita pontuar volume/spam).
 * Retorna null se o limite diário já foi atingido (evento não registrado).
 */
export async function registrarEventoPontuacao(
  candidatoId: string,
  acao: AcaoPontuavel,
  referencia?: { tipo: string; id: string },
  opcoes?: { unico?: boolean },
): Promise<PontuacaoEvento | null> {
  // A regra de segurança do banco só deixa o sistema gravar pontos. Quem chama
  // (server action) já validou o usuário; aqui gravamos com a chave de serviço.
  const supabase = createAdminClient();

  // Ações "únicas": a mesma ação sobre a mesma referência pontua só uma vez
  // (evita ganhar pontos arrastando um card de um lado para o outro).
  if (opcoes?.unico && referencia) {
    const { count: jaPontuou, error: unicoError } = await supabase
      .from("pontuacao_eventos")
      .select("id", { count: "exact", head: true })
      .eq("candidato_id", candidatoId)
      .eq("acao", acao)
      .eq("referencia_tipo", referencia.tipo)
      .eq("referencia_id", referencia.id);
    if (unicoError) throw unicoError;
    if ((jaPontuou ?? 0) > 0) return null;
  }

  const limite = LIMITE_DIARIO_POR_ACAO[acao];
  if (limite !== undefined) {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("pontuacao_eventos")
      .select("id", { count: "exact", head: true })
      .eq("candidato_id", candidatoId)
      .eq("acao", acao)
      .gte("created_at", inicioHoje.toISOString());

    if (countError) throw countError;
    if ((count ?? 0) >= limite) return null;
  }

  const { data, error } = await supabase
    .from("pontuacao_eventos")
    .insert({
      candidato_id: candidatoId,
      acao,
      pontos: PONTOS_POR_ACAO[acao],
      referencia_tipo: referencia?.tipo ?? null,
      referencia_id: referencia?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PontuacaoEvento;
}
