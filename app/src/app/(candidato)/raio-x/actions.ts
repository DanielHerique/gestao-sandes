"use server";

import { requireProfile } from "@/lib/auth/session";
import { chamarClaude } from "@/lib/ai/claude";
import { IaNaoConfiguradaError } from "@/lib/data/analise-ia";
import { usarIa } from "@/lib/data/usos-ia";

export interface RaioXVaga {
  resumo: string;
  requisitos: string[];
  palavrasChave: string[];
  diferenciais: string[];
  sinaisDeAtencao: string[];
  perguntasProvaveis: string[];
  comoAdaptar: string[];
  pontosFortes: string[];
  lacunas: string[];
}

const SISTEMA = `Você é um consultor sênior de carreira brasileiro. Faça o raio-x de uma vaga.
Responda SOMENTE com um objeto JSON, sem texto antes ou depois, neste formato:
{
  "resumo": "2 frases sobre o que a empresa realmente busca",
  "requisitos": ["requisitos essenciais, até 6"],
  "palavras_chave": ["termos que devem aparecer no currículo e no LinkedIn, até 10"],
  "diferenciais": ["o que destacaria a pessoa, até 4"],
  "sinais_de_atencao": ["pontos da vaga que merecem cuidado ou pergunta, até 4. Lista vazia se não houver"],
  "perguntas_provaveis": ["perguntas de entrevista prováveis para esta vaga, até 5"],
  "como_adaptar": ["ajustes concretos no currículo para esta vaga, até 5"],
  "pontos_fortes": ["só se a pessoa informou o resumo dela: onde ela já combina com a vaga. Senão lista vazia"],
  "lacunas": ["só se a pessoa informou o resumo dela: o que falta mostrar. Senão lista vazia"]
}
Tom: direto, específico e adulto, em português do Brasil, sem travessão. Nunca prometa vaga ou resultado. A IA aponta, a mentoria decide.`;

const lista = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);

export async function gerarRaioXAction(
  vaga: string,
  resumoPessoa: string,
): Promise<{ ok: true; dados: RaioXVaga } | { ok: false; mensagem: string }> {
  const profile = await requireProfile();
  const v = vaga.trim();
  const r = resumoPessoa.trim();
  if (v.length < 80) return { ok: false, mensagem: "Cole a descrição completa da vaga (mínimo de 80 caracteres)." };
  if (v.length > 8000 || r.length > 3000) return { ok: false, mensagem: "O texto está muito longo. Resuma e tente de novo." };

  if (!(await usarIa(profile.id, "raio_x_vaga", 10))) {
    return { ok: false, mensagem: "Você chegou ao limite de 10 raio-x por dia. Volte amanhã." };
  }

  try {
    const texto = await chamarClaude({
      system: SISTEMA,
      maxTokens: 1800,
      messages: [
        {
          role: "user",
          content: `Descrição da vaga:\n${v}\n\nResumo profissional da pessoa (opcional):\n${r || "não informado"}`,
        },
      ],
    });
    const json = texto.match(/\{[\s\S]*\}/)?.[0];
    if (!json) throw new Error("sem json");
    const d = JSON.parse(json);
    return {
      ok: true,
      dados: {
        resumo: String(d.resumo ?? ""),
        requisitos: lista(d.requisitos),
        palavrasChave: lista(d.palavras_chave),
        diferenciais: lista(d.diferenciais),
        sinaisDeAtencao: lista(d.sinais_de_atencao),
        perguntasProvaveis: lista(d.perguntas_provaveis),
        comoAdaptar: lista(d.como_adaptar),
        pontosFortes: lista(d.pontos_fortes),
        lacunas: lista(d.lacunas),
      },
    };
  } catch (e) {
    if (e instanceof IaNaoConfiguradaError) {
      return { ok: false, mensagem: "A IA ainda não foi configurada. Fale com a consultoria." };
    }
    return { ok: false, mensagem: "Não consegui gerar o raio-x agora. Tente de novo em instantes." };
  }
}
