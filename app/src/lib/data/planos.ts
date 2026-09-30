import { createClient } from "@/lib/supabase/server";
import type { PlanoContratado, PlanoModulos } from "@/lib/types/database";

export async function obterPlanoAtivo(
  candidatoId: string,
): Promise<PlanoContratado | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planos_contratados")
    .select("*")
    .eq("candidato_id", candidatoId)
    .eq("ativo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PlanoContratado | null;
}

export async function obterModulosDoPlano(
  plano: PlanoContratado["plano"],
): Promise<PlanoModulos | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plano_modulos")
    .select("*")
    .eq("plano", plano)
    .single();

  if (error) throw error;
  return data as PlanoModulos;
}

export async function atribuirPlano(
  candidatoId: string,
  plano: PlanoContratado["plano"],
  adminId: string,
): Promise<void> {
  const supabase = await createClient();

  // desativa plano anterior, se houver (v1: um plano ativo por vez)
  await supabase
    .from("planos_contratados")
    .update({ ativo: false })
    .eq("candidato_id", candidatoId)
    .eq("ativo", true);

  const { error } = await supabase.from("planos_contratados").insert({
    candidato_id: candidatoId,
    plano,
    ativo: true,
    criado_por: adminId,
  });

  if (error) throw error;
}
