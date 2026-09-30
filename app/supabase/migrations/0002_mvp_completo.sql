-- Sandes CRM — schema MVP completo
-- Referência: documentos/PRD.md seções 3.1-B, 3.2, 3.3, 3.4, 3.8, 3.9

-- ============================================================
-- 3.1-A: módulos liberados por plano (flags simples)
-- ============================================================
create table public.plano_modulos (
  plano plano_nome primary key,
  curriculo_impacto boolean not null default true,
  linkedin_estrategico boolean not null default true,
  simulacao_entrevista boolean not null default true,
  autoconhecimento boolean not null default false
);

insert into public.plano_modulos (plano, curriculo_impacto, linkedin_estrategico, simulacao_entrevista, autoconhecimento) values
  ('reconexao_profissional', true, true, true, false),
  ('clareza_futuro', true, true, true, false),
  ('essencia_proposito', true, true, true, true),
  ('avulso', false, false, false, false);

-- ============================================================
-- 3.1-B: exercícios estruturados
-- ============================================================
create type exercicio_status as enum ('nao_iniciado', 'em_andamento', 'concluido');

-- a) Lista Mestra de Atividades e Resultados (todos os planos) — linhas por experiência
create table public.exercicio_lista_mestra_linhas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  ano text,
  empresa text,
  segmento text,
  atividade_principal text,
  tarefas_secundarias text,
  resultados_alcancados text,
  competencias_desenvolvidas text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercicio_lista_mestra_candidato_idx on public.exercicio_lista_mestra_linhas (candidato_id);

-- b) Ferramenta Shazam (só Essência & Propósito) — 1 registro por candidato, 5 etapas
create table public.exercicio_shazam (
  candidato_id uuid primary key references public.profiles (id) on delete cascade,
  status exercicio_status not null default 'nao_iniciado',
  -- etapa 1
  momento_positivo_1 text, momento_positivo_2 text, momento_positivo_3 text,
  momento_desafiador_1 text, momento_desafiador_2 text, momento_desafiador_3 text,
  -- etapa 2
  momento_chave_selecionado text,
  motivo_voltaria text,
  -- etapa 3
  o_que_move_hoje text,
  aprendizado_sobre_si text,
  -- etapa 4
  compartilhar_com_mentor text,
  -- etapa 5 (síntese)
  sintese_aprendizado text,
  sintese_aplicacao text,
  sintese_comportamento_transformar text,
  sintese_fortalecer text,
  updated_at timestamptz not null default now()
);

-- c) Aprofundando o Autoconhecimento (só Essência & Propósito) — 9 perguntas abertas
create table public.exercicio_autoconhecimento (
  candidato_id uuid primary key references public.profiles (id) on delete cascade,
  status exercicio_status not null default 'nao_iniciado',
  autopercepcao text,
  feedback_externo text,
  talentos text,
  competencias text,
  motivadores text,
  pergunta_6 text,
  pergunta_7 text,
  pergunta_8 text,
  empresas_alvo text[], -- lista de até 10 empresas
  updated_at timestamptz not null default now()
);

-- d) PDI — metas por competência
create table public.exercicio_pdi_metas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  competencia text not null,
  prazo text check (prazo in ('curto', 'medio', 'longo')),
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

-- d) PDI — plano de ação 5W2H
create table public.exercicio_pdi_5w2h (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  what text, why text, "when" text, where_ text, who text, how text, how_much text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index exercicio_pdi_metas_candidato_idx on public.exercicio_pdi_metas (candidato_id);
create index exercicio_pdi_5w2h_candidato_idx on public.exercicio_pdi_5w2h (candidato_id);

-- status geral do PDI (para o painel do admin, já que é composto por 2 tabelas)
create table public.exercicio_pdi_status (
  candidato_id uuid primary key references public.profiles (id) on delete cascade,
  status exercicio_status not null default 'nao_iniciado',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3.2: Documentos
-- ============================================================
create type documento_status as enum (
  'liberado', 'nao_liberado', 'pendente_assinatura', 'assinado', 'vencido'
);

create table public.documento_templates (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  storage_path text not null,
  requer_assinatura boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.documento_templates (id),
  titulo text not null,
  storage_path text not null,
  storage_path_assinado text,
  requer_assinatura boolean not null default false,
  status documento_status not null default 'nao_liberado',
  versao integer not null default 1,
  liberado_em timestamptz,
  assinado_em timestamptz,
  vencimento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documentos_candidato_idx on public.documentos (candidato_id);

-- ============================================================
-- 3.3: Analisador de currículo (IA)
-- ============================================================
create table public.analises_curriculo (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  vaga_comparada text,
  score_geral numeric(4,1),
  sugestoes_cargos text[],
  pontos_melhoria text[],
  aderencia_vaga numeric(4,1),
  sucesso boolean not null default false,
  erro_mensagem text,
  created_at timestamptz not null default now()
);

create index analises_curriculo_candidato_idx on public.analises_curriculo (candidato_id);

-- ============================================================
-- 3.4: Biblioteca de prompts de IA
-- ============================================================
create table public.prompts_ia (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  texto_prompt text not null,
  destaque boolean not null default false,
  novo boolean not null default false,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3.5: Academia LinkedIn (conteúdo educativo) — estrutura mínima
-- ============================================================
create table public.academia_conteudos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  corpo text,
  ordem integer not null default 0,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3.8: Notificações
-- ============================================================
create type notificacao_tipo as enum ('institucional', 'comportamental');

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  tipo notificacao_tipo not null,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index notificacoes_candidato_idx on public.notificacoes (candidato_id);

-- ============================================================
-- 3.9 / seção 6: Gamificação — níveis e anotações do admin
-- ============================================================
create table public.anotacoes_admin (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  autor_id uuid not null references public.profiles (id),
  texto text not null,
  created_at timestamptz not null default now()
);

create index anotacoes_admin_candidato_idx on public.anotacoes_admin (candidato_id);

-- ============================================================
-- Triggers de updated_at
-- ============================================================
create trigger exercicio_lista_mestra_set_updated_at
  before update on public.exercicio_lista_mestra_linhas
  for each row execute function public.set_updated_at();

create trigger exercicio_shazam_set_updated_at
  before update on public.exercicio_shazam
  for each row execute function public.set_updated_at();

create trigger exercicio_autoconhecimento_set_updated_at
  before update on public.exercicio_autoconhecimento
  for each row execute function public.set_updated_at();

create trigger exercicio_pdi_status_set_updated_at
  before update on public.exercicio_pdi_status
  for each row execute function public.set_updated_at();

create trigger documentos_set_updated_at
  before update on public.documentos
  for each row execute function public.set_updated_at();

create trigger prompts_ia_set_updated_at
  before update on public.prompts_ia
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.plano_modulos enable row level security;
alter table public.exercicio_lista_mestra_linhas enable row level security;
alter table public.exercicio_shazam enable row level security;
alter table public.exercicio_autoconhecimento enable row level security;
alter table public.exercicio_pdi_metas enable row level security;
alter table public.exercicio_pdi_5w2h enable row level security;
alter table public.exercicio_pdi_status enable row level security;
alter table public.documento_templates enable row level security;
alter table public.documentos enable row level security;
alter table public.analises_curriculo enable row level security;
alter table public.prompts_ia enable row level security;
alter table public.academia_conteudos enable row level security;
alter table public.notificacoes enable row level security;
alter table public.anotacoes_admin enable row level security;

-- plano_modulos: leitura pública para usuários autenticados (config, não dado sensível)
create policy "plano_modulos_select_authenticated" on public.plano_modulos
  for select using (auth.role() = 'authenticated');
create policy "plano_modulos_write_admin_only" on public.plano_modulos
  for all using (public.is_admin()) with check (public.is_admin());

-- exercícios: dono lê/escreve, admin só lê
create policy "lista_mestra_all_own" on public.exercicio_lista_mestra_linhas
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "lista_mestra_select_admin" on public.exercicio_lista_mestra_linhas
  for select using (public.is_admin());

create policy "shazam_all_own" on public.exercicio_shazam
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "shazam_select_admin" on public.exercicio_shazam
  for select using (public.is_admin());

create policy "autoconhecimento_all_own" on public.exercicio_autoconhecimento
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "autoconhecimento_select_admin" on public.exercicio_autoconhecimento
  for select using (public.is_admin());

create policy "pdi_metas_all_own" on public.exercicio_pdi_metas
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "pdi_metas_select_admin" on public.exercicio_pdi_metas
  for select using (public.is_admin());

create policy "pdi_5w2h_all_own" on public.exercicio_pdi_5w2h
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "pdi_5w2h_select_admin" on public.exercicio_pdi_5w2h
  for select using (public.is_admin());

create policy "pdi_status_all_own" on public.exercicio_pdi_status
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "pdi_status_select_admin" on public.exercicio_pdi_status
  for select using (public.is_admin());

-- documentos: templates só admin; documentos do candidato ele lê e faz upload da versão assinada, admin gerencia tudo
create policy "documento_templates_select_admin" on public.documento_templates
  for select using (public.is_admin());
create policy "documento_templates_write_admin" on public.documento_templates
  for all using (public.is_admin()) with check (public.is_admin());

create policy "documentos_select_own_or_admin" on public.documentos
  for select using (candidato_id = auth.uid() or public.is_admin());
create policy "documentos_update_own_assinatura" on public.documentos
  for update using (candidato_id = auth.uid() or public.is_admin());
create policy "documentos_write_admin" on public.documentos
  for insert with check (public.is_admin());

-- análises de currículo: dono lê/escreve (respeitando cota na aplicação), admin lê
create policy "analises_all_own" on public.analises_curriculo
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "analises_select_admin" on public.analises_curriculo
  for select using (public.is_admin());

-- prompts: leitura para todos autenticados, escrita só admin
create policy "prompts_select_authenticated" on public.prompts_ia
  for select using (auth.role() = 'authenticated');
create policy "prompts_write_admin" on public.prompts_ia
  for all using (public.is_admin()) with check (public.is_admin());

-- academia: leitura de publicados para autenticados, escrita só admin
create policy "academia_select_published" on public.academia_conteudos
  for select using (publicado = true or public.is_admin());
create policy "academia_write_admin" on public.academia_conteudos
  for all using (public.is_admin()) with check (public.is_admin());

-- notificações: dono lê e marca como lida; sistema/admin cria
create policy "notificacoes_select_own_or_admin" on public.notificacoes
  for select using (candidato_id = auth.uid() or public.is_admin());
create policy "notificacoes_update_own" on public.notificacoes
  for update using (candidato_id = auth.uid() or public.is_admin());
create policy "notificacoes_insert_admin" on public.notificacoes
  for insert with check (public.is_admin());

-- anotações: só admin lê e escreve (nunca aparece pro mentorado — PRD 4.1 item 5)
create policy "anotacoes_admin_only" on public.anotacoes_admin
  for all using (public.is_admin()) with check (public.is_admin());
