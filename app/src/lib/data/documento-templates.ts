import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOCUMENTOS_BUCKET } from "@/lib/data/documentos";
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

  // O template fica no bucket de templates; cada candidato recebe uma cópia
  // na própria pasta do bucket de documentos (que ele tem permissão de ler).
  const admin = createAdminClient();
  const nomeArquivo = template.storage_path.split("/").pop() ?? "documento";
  const agora = new Date().toISOString();

  const inserts = [];
  for (const candidatoId of candidatoIds) {
    const destino = `${candidatoId}/${Date.now()}-${nomeArquivo}`;
    const { error: copyError } = await admin.storage
      .from(TEMPLATES_BUCKET)
      .copy(template.storage_path, destino, {
        destinationBucket: DOCUMENTOS_BUCKET,
      });
    if (copyError) throw copyError;

    inserts.push({
      candidato_id: candidatoId,
      template_id: templateId,
      titulo: template.titulo,
      storage_path: destino,
      requer_assinatura: template.requer_assinatura,
      status: template.requer_assinatura
        ? ("pendente_assinatura" as const)
        : ("liberado" as const),
      liberado_em: agora,
    });
  }

  const { error } = await supabase.from("documentos").insert(inserts);
  if (error) throw error;
}
