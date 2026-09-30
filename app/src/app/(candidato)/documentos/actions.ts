"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import {
  criarUrlAssinadaParaUpload,
  criarUrlAssinadaParaVisualizacao,
  enviarDocumentoAssinado,
} from "@/lib/data/documentos";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";

export async function obterUrlVisualizacaoAction(storagePath: string) {
  await requireProfile();
  return criarUrlAssinadaParaVisualizacao(storagePath);
}

export async function obterUrlUploadAssinaturaAction(documentoId: string) {
  const profile = await requireProfile();
  const path = `${profile.id}/assinados/${documentoId}-${Date.now()}.pdf`;
  return criarUrlAssinadaParaUpload(path);
}

export async function confirmarUploadAssinaturaAction(
  documentoId: string,
  storagePathAssinado: string,
) {
  const profile = await requireProfile();
  await enviarDocumentoAssinado(documentoId, storagePathAssinado);
  await registrarEventoPontuacao(profile.id, "documento_assinado_no_prazo", {
    tipo: "documento",
    id: documentoId,
  });
  revalidatePath("/documentos");
}
