// Regras de pontuação — PRD documentos/PRD.md seção 6.2
// Pesos "sugestão ajustável" — ver documentos/PENDENCIAS.md (validação com a Katryn pendente).

export type AcaoPontuavel =
  | "candidatura_criada"
  | "checklist_item_marcado"
  | "status_mudou_para_entrevista"
  | "status_atualizado_apos_5_dias_parado"
  | "analise_curriculo_concluida"
  | "melhoria_aplicada_reupload_curriculo"
  | "documento_assinado_no_prazo"
  | "exercicio_estruturado_concluido"
  | "sessao_mentoria_realizada" // Fase 2 (depende da Agenda)
  | "candidatura_fechada"
  | "sequencia_5_dias_bonus";

export const PONTOS_POR_ACAO: Record<AcaoPontuavel, number> = {
  candidatura_criada: 10,
  checklist_item_marcado: 5,
  status_mudou_para_entrevista: 15,
  status_atualizado_apos_5_dias_parado: 5,
  analise_curriculo_concluida: 10,
  melhoria_aplicada_reupload_curriculo: 15,
  documento_assinado_no_prazo: 10,
  exercicio_estruturado_concluido: 25,
  sessao_mentoria_realizada: 20,
  candidatura_fechada: 100,
  sequencia_5_dias_bonus: 20,
};

// Regras de integridade — PRD 6.1 + reforçadas pela análise do doc KAT (ver documentos/DECISOES_GAMIFICACAO.md)
// - pontos não diminuem / não zeram com inatividade
// - sem ranking público entre candidatos
// - repetição da mesma ação tem limite diário (aplicado na camada de escrita, não aqui)
export const LIMITE_DIARIO_POR_ACAO: Partial<Record<AcaoPontuavel, number>> = {
  checklist_item_marcado: 8, // até 2 candidaturas completas de checklist por dia
  candidatura_criada: 5, // evita pontuar cadastro em massa sem qualidade (alinhado ao doc KAT)
};

export function calcularPontosTotais(
  eventos: { pontos: number }[],
): number {
  return eventos.reduce((total, evento) => total + evento.pontos, 0);
}

// Níveis nomeados — PRD 6.4, fundidos com a proposta da KAT (ver DECISOES_GAMIFICACAO.md)
export type NivelId =
  | "ponto_de_partida"
  | "direcao_clara"
  | "historia_de_valor"
  | "presenca_estrategica"
  | "movimento_seguro";

export interface NivelDefinicao {
  id: NivelId;
  ordem: number;
  nome: string;
  criterioAvanco: string;
  significado: string;
  pontosMinimos: number;
}

export const NIVEIS: NivelDefinicao[] = [
  {
    id: "ponto_de_partida",
    ordem: 1,
    nome: "Ponto de Partida",
    criterioAvanco: "Diagnóstico/perfil concluído",
    significado: "O candidato entende onde está",
    pontosMinimos: 0,
  },
  {
    id: "direcao_clara",
    ordem: 2,
    nome: "Direção Clara",
    criterioAvanco: "Objetivo e prioridades definidos",
    significado: "O próximo movimento faz sentido",
    pontosMinimos: 30,
  },
  {
    id: "historia_de_valor",
    ordem: 3,
    nome: "História de Valor",
    criterioAvanco: "Currículo e narrativa validados",
    significado: "Experiência vira evidência",
    pontosMinimos: 80,
  },
  {
    id: "presenca_estrategica",
    ordem: 4,
    nome: "Presença Estratégica",
    criterioAvanco: "LinkedIn estruturado / checklist aplicado",
    significado: "O mercado entende a proposta",
    pontosMinimos: 150,
  },
  {
    id: "movimento_seguro",
    ordem: 5,
    nome: "Movimento Seguro",
    criterioAvanco: "Simulações concluídas e candidaturas ativas",
    significado: "O candidato age com método",
    pontosMinimos: 250,
  },
];

export function nivelAtual(pontosTotais: number): NivelDefinicao {
  const elegiveis = NIVEIS.filter((n) => pontosTotais >= n.pontosMinimos);
  return elegiveis[elegiveis.length - 1] ?? NIVEIS[0];
}

export function proximoNivel(pontosTotais: number): NivelDefinicao | null {
  const atual = nivelAtual(pontosTotais);
  return NIVEIS.find((n) => n.ordem === atual.ordem + 1) ?? null;
}

export function pontosParaProximoNivel(pontosTotais: number): number | null {
  const proximo = proximoNivel(pontosTotais);
  if (!proximo) return null;
  return Math.max(0, proximo.pontosMinimos - pontosTotais);
}
