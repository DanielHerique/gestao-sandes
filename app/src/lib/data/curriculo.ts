import { createClient } from "@/lib/supabase/server";
import type { AnaliseCurriculo } from "@/lib/types/database";

export const CURRICULOS_BUCKET = "curriculos";
export const LIMITE_ANALISES = 3;

export async function listarAnalises(
  candidatoId: string,
): Promise<AnaliseCurriculo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analises_curriculo")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AnaliseCurriculo[];
}

export async function contarAnalisesBemSucedidas(
  candidatoId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("analises_curriculo")
    .select("id", { count: "exact", head: true })
    .eq("candidato_id", candidatoId)
    .eq("sucesso", true);

  if (error) throw error;
  return count ?? 0;
}

export async function registrarAnalise(
  candidatoId: string,
  storagePath: string,
  resultado: {
    sucesso: boolean;
    erroMensagem?: string;
    scoreGeral?: number;
    sugestoesCargos?: string[];
    pontosMelhoria?: string[];
    vagaComparada?: string;
    aderenciaVaga?: number;
  },
): Promise<AnaliseCurriculo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analises_curriculo")
    .insert({
      candidato_id: candidatoId,
      storage_path: storagePath,
      sucesso: resultado.sucesso,
      erro_mensagem: resultado.erroMensagem ?? null,
      score_geral: resultado.scoreGeral ?? null,
      sugestoes_cargos: resultado.sugestoesCargos ?? null,
      pontos_melhoria: resultado.pontosMelhoria ?? null,
      vaga_comparada: resultado.vagaComparada ?? null,
      aderencia_vaga: resultado.aderenciaVaga ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AnaliseCurriculo;
}
