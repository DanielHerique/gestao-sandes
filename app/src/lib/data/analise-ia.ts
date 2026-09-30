// Analisador de currículo (IA) — PRD 3.3.
//
// PENDENTE: provedor de IA e API key ainda não definidos (ver documentos/PENDENCIAS.md).
// A interface abaixo já reflete o contrato esperado pelo resto do sistema
// (score, sugestões de cargo, pontos de melhoria, aderência a vaga opcional),
// então ligar o provedor real é só trocar a implementação de `analisarCurriculo`,
// sem mexer em quem a chama.

export interface ResultadoAnaliseCurriculo {
  scoreGeral: number;
  sugestoesCargos: string[];
  pontosMelhoria: string[];
  aderenciaVaga?: number;
}

export async function analisarCurriculo(
  textoCurriculo: string,
  vagaComparada?: string,
): Promise<ResultadoAnaliseCurriculo> {
  void textoCurriculo;
  void vagaComparada;
  throw new Error(
    "Provedor de IA para análise de currículo ainda não configurado. " +
      "Ver documentos/PENDENCIAS.md.",
  );
}
