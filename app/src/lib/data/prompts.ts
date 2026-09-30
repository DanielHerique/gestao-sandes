import { createClient } from "@/lib/supabase/server";
import type { PromptIA } from "@/lib/types/database";

export async function listarPrompts(): Promise<PromptIA[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts_ia")
    .select("*")
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PromptIA[];
}

export interface NovoPromptInput {
  titulo: string;
  categoria: string;
  texto_prompt: string;
  destaque?: boolean;
  novo?: boolean;
}

export async function criarPrompt(
  autorId: string,
  input: NovoPromptInput,
): Promise<PromptIA> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts_ia")
    .insert({ ...input, criado_por: autorId })
    .select()
    .single();

  if (error) throw error;
  return data as PromptIA;
}

export async function excluirPrompt(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("prompts_ia").delete().eq("id", id);
  if (error) throw error;
}
