export type UserRole = "admin" | "candidato";

export type PlanoNome =
  | "reconexao_profissional"
  | "clareza_futuro"
  | "essencia_proposito"
  | "avulso";

export type CandidaturaStatus =
  | "indefinido"
  | "entrevista"
  | "fechada"
  | "retorno_negativo";

export type ExercicioStatus = "nao_iniciado" | "em_andamento" | "concluido";

export type DocumentoStatus =
  | "liberado"
  | "nao_liberado"
  | "pendente_assinatura"
  | "assinado"
  | "vencido";

export type NotificacaoTipo = "institucional" | "comportamental";

export interface Profile {
  id: string;
  role: UserRole;
  nome: string;
  email: string;
  created_at: string;
}

export interface PlanoContratado {
  id: string;
  candidato_id: string;
  plano: PlanoNome;
  ativo: boolean;
  criado_por: string | null;
  created_at: string;
}

export interface PlanoModulos {
  plano: PlanoNome;
  curriculo_impacto: boolean;
  linkedin_estrategico: boolean;
  simulacao_entrevista: boolean;
  autoconhecimento: boolean;
}

export interface Candidatura {
  id: string;
  candidato_id: string;
  cargo: string;
  empresa: string;
  segmento_empresa: string | null;
  data_envio_curriculo: string | null;
  link_vaga: string | null;
  linkedin_empresa: string | null;
  plataforma_envio: string | null;
  perfil_recrutador_linkedin: string | null;
  notas_pessoais: string | null;
  status: CandidaturaStatus;
  created_at: string;
  updated_at: string;
}

export interface CandidaturaChecklist {
  candidatura_id: string;
  indicacao_perfil: boolean;
  curriculo_enviado: boolean;
  seguiu_empresa_linkedin: boolean;
  solicitou_conexao_recrutador: boolean;
  updated_at: string;
}

export interface PontuacaoEvento {
  id: string;
  candidato_id: string;
  acao: string;
  pontos: number;
  referencia_tipo: string | null;
  referencia_id: string | null;
  created_at: string;
}

export interface ExercicioListaMestraLinha {
  id: string;
  candidato_id: string;
  ano: string | null;
  empresa: string | null;
  segmento: string | null;
  atividade_principal: string | null;
  tarefas_secundarias: string | null;
  resultados_alcancados: string | null;
  competencias_desenvolvidas: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface ExercicioShazam {
  candidato_id: string;
  status: ExercicioStatus;
  momento_positivo_1: string | null;
  momento_positivo_2: string | null;
  momento_positivo_3: string | null;
  momento_desafiador_1: string | null;
  momento_desafiador_2: string | null;
  momento_desafiador_3: string | null;
  momento_chave_selecionado: string | null;
  motivo_voltaria: string | null;
  o_que_move_hoje: string | null;
  aprendizado_sobre_si: string | null;
  compartilhar_com_mentor: string | null;
  sintese_aprendizado: string | null;
  sintese_aplicacao: string | null;
  sintese_comportamento_transformar: string | null;
  sintese_fortalecer: string | null;
  updated_at: string;
}

export interface ExercicioAutoconhecimento {
  candidato_id: string;
  status: ExercicioStatus;
  autopercepcao: string | null;
  feedback_externo: string | null;
  talentos: string | null;
  competencias: string | null;
  motivadores: string | null;
  pergunta_6: string | null;
  pergunta_7: string | null;
  pergunta_8: string | null;
  empresas_alvo: string[] | null;
  updated_at: string;
}

export interface ExercicioPdiMeta {
  id: string;
  candidato_id: string;
  competencia: string;
  prazo: "curto" | "medio" | "longo" | null;
  ordem: number;
  created_at: string;
}

export interface ExercicioPdi5w2h {
  id: string;
  candidato_id: string;
  what: string | null;
  why: string | null;
  when: string | null;
  where_: string | null;
  who: string | null;
  how: string | null;
  how_much: string | null;
  ordem: number;
  created_at: string;
}

export interface DocumentoTemplate {
  id: string;
  titulo: string;
  descricao: string | null;
  storage_path: string;
  requer_assinatura: boolean;
  created_at: string;
}

export interface Documento {
  id: string;
  candidato_id: string;
  template_id: string | null;
  titulo: string;
  storage_path: string;
  storage_path_assinado: string | null;
  requer_assinatura: boolean;
  status: DocumentoStatus;
  versao: number;
  liberado_em: string | null;
  assinado_em: string | null;
  vencimento: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnaliseCurriculo {
  id: string;
  candidato_id: string;
  storage_path: string;
  vaga_comparada: string | null;
  score_geral: number | null;
  sugestoes_cargos: string[] | null;
  pontos_melhoria: string[] | null;
  aderencia_vaga: number | null;
  sucesso: boolean;
  erro_mensagem: string | null;
  created_at: string;
}

export interface PromptIA {
  id: string;
  titulo: string;
  categoria: string;
  texto_prompt: string;
  destaque: boolean;
  novo: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notificacao {
  id: string;
  candidato_id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criado_por: string | null;
  created_at: string;
}

export interface AnotacaoAdmin {
  id: string;
  candidato_id: string;
  autor_id: string;
  texto: string;
  created_at: string;
}

export const CHECKLIST_ITEM_LABELS: Record<
  keyof Omit<CandidaturaChecklist, "candidatura_id" | "updated_at">,
  string
> = {
  indicacao_perfil: "Indicação de perfil profissional feita pela Sandes",
  curriculo_enviado: "Currículo enviado",
  seguiu_empresa_linkedin: "Seguir a página da empresa no LinkedIn",
  solicitou_conexao_recrutador:
    "Solicitar conexão ao responsável pelo recrutamento no LinkedIn",
};

export const CANDIDATURA_STATUS_LABELS: Record<CandidaturaStatus, string> = {
  indefinido: "Indefinido",
  entrevista: "Entrevista",
  fechada: "Fechada",
  retorno_negativo: "Retorno negativo",
};

export const PLANO_LABELS: Record<PlanoNome, string> = {
  reconexao_profissional: "Reconexão Profissional",
  clareza_futuro: "Clareza & Futuro",
  essencia_proposito: "Essência & Propósito",
  avulso: "Avulso",
};
