import { createClient } from "@/lib/supabase/server";
import type { AnotacaoAdmin } from "@/lib/types/database";

export async function listarAnotacoes(
  candidatoId: string,
): Promise<AnotacaoAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anotacoes_admin")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AnotacaoAdmin[];
}

export async function criarAnotacao(
  candidatoId: string,
  autorId: string,
  texto: string,
): Promise<AnotacaoAdmin> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anotacoes_admin")
    .insert({ candidato_id: candidatoId, autor_id: autorId, texto })
    .select()
    .single();

  if (error) throw error;
  return data as AnotacaoAdmin;
}
