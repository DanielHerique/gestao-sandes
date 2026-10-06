// Analisador de currículo (IA) — PRD 3.3.
// Usa a API da Anthropic lendo o PDF diretamente (sem etapa de extração de texto).
// Configuração: variável ANTHROPIC_API_KEY (e, opcionalmente, ANALISE_CURRICULO_MODEL).

export interface ResultadoAnaliseCurriculo {
  scoreGeral: number;
  sugestoesCargos: string[];
  pontosMelhoria: string[];
  aderenciaVaga?: number;
}

export class IaNaoConfiguradaError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY não configurada");
  }
}

const MODELO_PADRAO = "claude-sonnet-5-5";

const INSTRUCAO = `Você é um consultor sênior de RH brasileiro analisando o currículo anexado.
Responda SOMENTE com um objeto JSON, sem texto antes ou depois, neste formato:
{
  "score_geral": número de 0 a 10 (uma casa decimal) avaliando clareza, resultados mensuráveis, estrutura e aderência ao mercado,
  "sugestoes_cargos": lista de 3 a 5 cargos compatíveis com a trajetória,
  "pontos_melhoria": lista de 3 a 6 melhorias concretas e específicas (cada uma em uma frase direta, em português),
  "aderencia_vaga": número de 0 a 10 comparando com a vaga informada, ou null se nenhuma vaga foi informada
}
Tom: direto, específico e adulto. Nunca prometa vaga ou resultado.`;

export async function analisarCurriculo(
  pdfBase64: string,
  vagaComparada?: string,
): Promise<ResultadoAnaliseCurriculo> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new IaNaoConfiguradaError();

  const resposta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANALISE_CURRICULO_MODEL ?? MODELO_PADRAO,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            {
              type: "text",
              text: vagaComparada
                ? `${INSTRUCAO}\n\nVaga para comparação:\n${vagaComparada}`
                : INSTRUCAO,
            },
          ],
        },
      ],
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha na API de IA (${resposta.status})`);
  }

  const corpo = await resposta.json();
  const texto: string = corpo.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  const json = texto.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("Resposta da IA sem JSON válido");

  const dados = JSON.parse(json);
  const score = Number(dados.score_geral);
  if (Number.isNaN(score)) throw new Error("Resposta da IA sem score");

  return {
    scoreGeral: Math.min(10, Math.max(0, score)),
    sugestoesCargos: Array.isArray(dados.sugestoes_cargos) ? dados.sugestoes_cargos.map(String) : [],
    pontosMelhoria: Array.isArray(dados.pontos_melhoria) ? dados.pontos_melhoria.map(String) : [],
    aderenciaVaga:
      dados.aderencia_vaga === null || dados.aderencia_vaga === undefined
        ? undefined
        : Math.min(10, Math.max(0, Number(dados.aderencia_vaga))),
  };
}
