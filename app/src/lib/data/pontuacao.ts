import { createClient } from "@/lib/supabase/server";
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
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PontuacaoEvento[];
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
): Promise<PontuacaoEvento | null> {
  const supabase = await createClient();

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
