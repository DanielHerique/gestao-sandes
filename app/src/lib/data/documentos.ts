import { createClient } from "@/lib/supabase/server";
import type { Documento, DocumentoStatus } from "@/lib/types/database";

export const DOCUMENTOS_BUCKET = "documentos";

export async function listarDocumentos(
  candidatoId: string,
): Promise<Documento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Documento[];
}

export async function criarUrlAssinadaParaVisualizacao(
  storagePath: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTOS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10);

  if (error) return null;
  return data.signedUrl;
}

export async function criarUrlAssinadaParaUpload(
  storagePath: string,
): Promise<{ path: string; token: string; signedUrl: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTOS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) return null;
  return data;
}

export async function enviarDocumentoAssinado(
  documentoId: string,
  storagePathAssinado: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("documentos")
    .update({
      storage_path_assinado: storagePathAssinado,
      status: "assinado" as DocumentoStatus,
      assinado_em: new Date().toISOString(),
    })
    .eq("id", documentoId);

  if (error) throw error;
}

export interface NovoDocumentoInput {
  candidato_id: string;
  titulo: string;
  storage_path: string;
  requer_assinatura: boolean;
  status: DocumentoStatus;
  vencimento?: string;
}

export async function criarDocumento(
  input: NovoDocumentoInput,
): Promise<Documento> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Documento;
}
