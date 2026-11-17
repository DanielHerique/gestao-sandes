export type UserRole = "admin" | "candidato";

export type PlanoNome =
  | "reconexao_profissional"
  | "clareza_futuro"
  | "essencia_proposito"
  | "avulso";

export type CandidaturaStatus =
  | "em_andamento"
  | "entrevistas"
  | "aprovado"
  | "reprovado";

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
  tutorial_visto: boolean;
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
  curriculo_enviado: "Currículo enviado",
  seguiu_empresa_linkedin: "Seguir a página da empresa no LinkedIn",
  solicitou_conexao_recrutador:
    "Solicitar conexão ao responsável pelo recrutamento no LinkedIn",
  indicacao_perfil: "Indicação de perfil profissional feita pela Sandes",
};

export const CANDIDATURA_STATUS_LABELS: Record<CandidaturaStatus, string> = {
  em_andamento: "Em andamento",
  entrevistas: "Entrevistas",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export const PLANO_LABELS: Record<PlanoNome, string> = {
  reconexao_profissional: "Reconexão Profissional",
  clareza_futuro: "Clareza & Futuro",
  essencia_proposito: "Essência & Propósito",
  avulso: "Avulso",
};

// ---------- Fase 2 ----------
export type ResgateStatus = "pendente" | "aprovado" | "concluido" | "recusado";

export interface LojaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  custo_pontos: number;
  cota_mensal: number | null;
  ativo: boolean;
  created_at: string;
}

export interface LojaResgate {
  id: string;
  candidato_id: string;
  item_id: string;
  item_titulo: string;
  pontos_debitados: number;
  status: ResgateStatus;
  observacao_admin: string | null;
  created_at: string;
  decidido_em: string | null;
  decidido_por: string | null;
}

export type SessaoStatus = "agendada" | "realizada" | "cancelada" | "faltou";

export interface AgendaDisponibilidade {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  duracao_min: number;
  ativo: boolean;
}

export interface AgendaSessao {
  id: string;
  candidato_id: string;
  inicio: string;
  fim: string;
  status: SessaoStatus;
  origem: string;
  google_event_id: string | null;
  meet_link: string | null;
  observacao: string | null;
  created_at: string;
}

export interface AcademiaConteudo {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string | null;
  corpo: string | null;
  video_url: string | null;
  ordem: number;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export const RESGATE_ROTULO: Record<ResgateStatus, string> = {
  pendente: "Aguardando aprovação",
  aprovado: "Aprovado",
  concluido: "Concluído",
  recusado: "Recusado",
};

export const SESSAO_ROTULO: Record<SessaoStatus, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  faltou: "Não compareceu",
};

export type ValidacaoIndicacaoStatus = "pendente" | "validada" | "devolvida";

export interface ValidacaoIndicacao {
  id: string;
  candidatura_id: string;
  candidato_id: string;
  status: ValidacaoIndicacaoStatus;
  observacao: string | null;
  validado_por: string | null;
  validado_em: string | null;
  created_at: string;
}
