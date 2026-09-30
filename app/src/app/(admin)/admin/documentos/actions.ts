"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  TEMPLATES_BUCKET,
  criarTemplate,
  enviarTemplateEmLote,
} from "@/lib/data/documento-templates";

export async function criarTemplateAction(
  formData: FormData,
): Promise<{ ok: boolean; mensagem: string }> {
  await requireAdmin();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const requerAssinatura = formData.get("requer_assinatura") === "on";
  const file = formData.get("arquivo") as File | null;

  if (!titulo || !file || file.size === 0) {
    return { ok: false, mensagem: "Preencha o título e selecione um arquivo." };
  }

  const supabase = await createClient();
  const storagePath = `templates/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(TEMPLATES_BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    return { ok: false, mensagem: "Falha ao enviar o arquivo." };
  }

  await criarTemplate({
    titulo,
    descricao: descricao || undefined,
    storage_path: storagePath,
    requer_assinatura: requerAssinatura,
  });

  revalidatePath("/admin/documentos");
  return { ok: true, mensagem: "Template criado." };
}

export async function enviarTemplateEmLoteAction(
  templateId: string,
  candidatoIds: string[],
) {
  await requireAdmin();
  await enviarTemplateEmLote(templateId, candidatoIds);
  revalidatePath("/admin/documentos");
}
