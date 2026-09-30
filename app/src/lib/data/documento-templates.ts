import { createClient } from "@/lib/supabase/server";
import type { DocumentoTemplate } from "@/lib/types/database";

export const TEMPLATES_BUCKET = "documento-templates";

export async function listarTemplates(): Promise<DocumentoTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documento_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DocumentoTemplate[];
}

export async function criarTemplate(input: {
  titulo: string;
  descricao?: string;
  storage_path: string;
  requer_assinatura: boolean;
}): Promise<DocumentoTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documento_templates")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as DocumentoTemplate;
}

export async function listarCandidatosAtivos(): Promise<
  { id: string; nome: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "candidato")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

/** Envia um template para múltiplos candidatos de uma vez — PRD 4.1 item 3. */
export async function enviarTemplateEmLote(
  templateId: string,
  candidatoIds: string[],
): Promise<void> {
  const supabase = await createClient();

  const { data: template, error: templateError } = await supabase
    .from("documento_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError) throw templateError;

  const inserts = candidatoIds.map((candidatoId) => ({
    candidato_id: candidatoId,
    template_id: templateId,
    titulo: template.titulo,
    storage_path: template.storage_path,
    requer_assinatura: template.requer_assinatura,
    status: "liberado" as const,
    liberado_em: new Date().toISOString(),
  }));

  const { error } = await supabase.from("documentos").insert(inserts);
  if (error) throw error;
}
