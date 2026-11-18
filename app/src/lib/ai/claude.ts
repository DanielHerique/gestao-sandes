import { IaNaoConfiguradaError } from "@/lib/data/analise-ia";

export interface MensagemIa {
  role: "user" | "assistant";
  content: string;
}

const MODELO_PADRAO = "claude-sonnet-5-5";

/** Chamada simples à API da Anthropic (texto). Usa ANTHROPIC_API_KEY. */
export async function chamarClaude({
  system,
  messages,
  maxTokens = 1500,
}: {
  system: string;
  messages: MensagemIa[];
  maxTokens?: number;
}): Promise<string> {
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
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!resposta.ok) throw new Error(`Falha na API de IA (${resposta.status})`);

  const corpo = await resposta.json();
  return String(corpo.content?.find((b: { type: string }) => b.type === "text")?.text ?? "");
}
