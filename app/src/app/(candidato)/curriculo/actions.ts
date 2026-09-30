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
import { analisarCurriculo } from "@/lib/data/analise-ia";

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

  const supabase = await createClient();
  const storagePath = `${profile.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(CURRICULOS_BUCKET)
    .upload(storagePath, file);

  if (uploadError) {
    return { ok: false, mensagem: "Falha ao enviar o arquivo. Tente novamente." };
  }

  try {
    // PENDENTE: extração de texto do PDF/DOCX ainda não implementada
    // (depende do provedor de IA escolhido — ver documentos/PENDENCIAS.md).
    const resultado = await analisarCurriculo("", vagaComparada);

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
  } catch {
    // Falha técnica (ex: parsing) não deve consumir a cota — PRD 3.3, nota de produto.
    await registrarAnalise(profile.id, storagePath, {
      sucesso: false,
      erroMensagem: "Provedor de IA não configurado",
    });
    revalidatePath("/curriculo");
    return {
      ok: false,
      mensagem:
        "O analisador de IA ainda não está configurado neste ambiente. O arquivo foi salvo, mas a análise não pôde ser gerada.",
    };
  }
}
