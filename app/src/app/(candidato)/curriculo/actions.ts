"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  CURRICULOS_BUCKET,
  LIMITE_ANALISES,
  contarAnalisesBemSucedidas,
  registrarAnalise,
} from "@/lib/data/curriculo";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import { IaNaoConfiguradaError, analisarCurriculo } from "@/lib/data/analise-ia";

export async function enviarCurriculoParaAnaliseAction(
  formData: FormData,
): Promise<{ ok: boolean; mensagem: string }> {
  const profile = await requireProfile();

  const usadas = await contarAnalisesBemSucedidas(profile.id);
  if (usadas >= LIMITE_ANALISES) {
    return {
      ok: false,
      mensagem: `Você já usou suas ${LIMITE_ANALISES} análises disponíveis.`,
    };
  }

  const file = formData.get("curriculo") as File | null;
  const vagaComparada = String(formData.get("vaga_comparada") ?? "") || undefined;

  if (!file || file.size === 0) {
    return { ok: false, mensagem: "Selecione um arquivo de currículo." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, mensagem: "Envie o currículo em PDF." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, mensagem: "O arquivo passa de 10 MB." };
  }

  const supabase = await createClient();
  const storagePath = `${profile.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from(CURRICULOS_BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    return { ok: false, mensagem: "Falha ao enviar o arquivo. Tente novamente." };
  }

  try {
    const pdfBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const resultado = await analisarCurriculo(pdfBase64, vagaComparada);

    await registrarAnalise(profile.id, storagePath, {
      sucesso: true,
      scoreGeral: resultado.scoreGeral,
      sugestoesCargos: resultado.sugestoesCargos,
      pontosMelhoria: resultado.pontosMelhoria,
      vagaComparada,
      aderenciaVaga: resultado.aderenciaVaga,
    });

    await registrarEventoPontuacao(profile.id, "analise_curriculo_concluida", {
      tipo: "analise_curriculo",
      id: storagePath,
    });

    revalidatePath("/curriculo");
    return { ok: true, mensagem: "Análise concluída." };
  } catch (erro) {
    // Falha técnica não consome a cota (só sucesso=true conta) — PRD 3.3.
    const naoConfigurada = erro instanceof IaNaoConfiguradaError;
    await registrarAnalise(profile.id, storagePath, {
      sucesso: false,
      erroMensagem: naoConfigurada
        ? "Analisador ainda não ativado neste ambiente"
        : "Não foi possível analisar o arquivo",
    });
    revalidatePath("/curriculo");
    return {
      ok: false,
      mensagem: naoConfigurada
        ? "O analisador de IA ainda não foi ativado neste ambiente. Seu arquivo foi salvo e a cota não foi usada."
        : "Não foi possível analisar o arquivo agora. Tente novamente — a cota não foi usada.",
    };
  }
}
