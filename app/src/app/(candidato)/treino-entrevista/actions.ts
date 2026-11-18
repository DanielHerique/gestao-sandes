"use server";

import { requireProfile } from "@/lib/auth/session";
import { chamarClaude, type MensagemIa } from "@/lib/ai/claude";
import { IaNaoConfiguradaError } from "@/lib/data/analise-ia";
import { usarIa } from "@/lib/data/usos-ia";

import { PERGUNTAS_POR_TREINO } from "@/lib/ai/treino";

function sistema(cargo: string, rodada: number) {
  return `Você é um entrevistador experiente de RH no Brasil, treinando uma pessoa para a vaga de "${cargo}".
Regras:
- Faça UMA pergunta comportamental por vez. O treino tem ${PERGUNTAS_POR_TREINO} perguntas.
- Depois de cada resposta da pessoa, dê um feedback curto no método STAR (Situação, Tarefa, Ação, Resultado): o que ficou bom, o que faltou e como melhorar, em até 4 frases. Depois faça a próxima pergunta.
- ${rodada >= PERGUNTAS_POR_TREINO ? "Esta foi a última resposta: dê o feedback e feche com um resumo de 3 pontos fortes e 3 pontos de melhoria. Não faça nova pergunta." : "Se ainda não há mensagem da pessoa, apresente-se em uma frase e faça a primeira pergunta."}
- Tom direto, específico e acolhedor, em português do Brasil, sem travessão e sem emoji. Nunca prometa vaga ou resultado.`;
}

export async function treinarEntrevistaAction(
  cargo: string,
  historico: MensagemIa[],
): Promise<{ ok: true; resposta: string; fim: boolean } | { ok: false; mensagem: string }> {
  const profile = await requireProfile();
  const c = cargo.trim().slice(0, 120);
  if (!c) return { ok: false, mensagem: "Informe o cargo da vaga." };

  const msgs = historico
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) }))
    .slice(-20);
  const respostas = msgs.filter((m) => m.role === "user").length;
  if (respostas > PERGUNTAS_POR_TREINO) return { ok: false, mensagem: "Este treino já terminou. Comece um novo." };

  if (!(await usarIa(profile.id, "treino_entrevista", 60))) {
    return { ok: false, mensagem: "Você chegou ao limite diário de treino. Volte amanhã." };
  }

  try {
    const resposta = await chamarClaude({
      system: sistema(c, respostas),
      maxTokens: 700,
      messages: msgs.length ? msgs : [{ role: "user", content: "Podemos começar o treino." }],
    });
    return { ok: true, resposta, fim: respostas >= PERGUNTAS_POR_TREINO };
  } catch (e) {
    if (e instanceof IaNaoConfiguradaError) {
      return { ok: false, mensagem: "A IA ainda não foi configurada. Fale com a consultoria." };
    }
    return { ok: false, mensagem: "Não consegui responder agora. Tente de novo em instantes." };
  }
}
