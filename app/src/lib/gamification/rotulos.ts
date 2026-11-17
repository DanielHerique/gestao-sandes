import type { AcaoPontuavel } from "@/lib/gamification/pontos";

export const ACAO_ROTULO: Record<AcaoPontuavel, { titulo: string; ajuda: string }> = {
  candidatura_criada: { titulo: "Cadastrar nova candidatura", ajuda: "Ação-base de esforço ativo de busca." },
  checklist_item_marcado: { titulo: "Marcar item do checklist", ajuda: "Cada item de cada candidatura pontua uma vez." },
  status_mudou_para_entrevista: { titulo: "Candidatura avançou para Entrevista", ajuda: "Pontua uma vez por candidatura." },
  status_atualizado_apos_5_dias_parado: { titulo: "Atualizar candidatura parada", ajuda: "Incentiva manter o funil atualizado." },
  analise_curriculo_concluida: { titulo: "Concluir análise de currículo", ajuda: "Limitada pela cota de análises." },
  melhoria_aplicada_reupload_curriculo: { titulo: "Aplicar melhoria no currículo", ajuda: "Fecha o ciclo de feedback." },
  documento_assinado_no_prazo: { titulo: "Assinar documento no prazo", ajuda: "Compliance com a consultoria." },
  exercicio_estruturado_concluido: { titulo: "Concluir exercício estruturado", ajuda: "Coração do método." },
  sessao_mentoria_realizada: { titulo: "Comparecer à sessão de mentoria", ajuda: "Registrado quando o admin marca a sessão como realizada." },
  candidatura_fechada: { titulo: "Candidatura aprovada", ajuda: "Resultado final. Pontua uma vez por candidatura." },
  sequencia_5_dias_bonus: { titulo: "Bônus de constância (5 dias)", ajuda: "Reforça constância, não só picos." },
};
