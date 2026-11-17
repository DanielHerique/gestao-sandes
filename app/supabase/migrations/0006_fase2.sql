-- Sandes CRM: Fase 2 (regras de gamificação, loja de recompensas, agenda, Academia LinkedIn)
-- Tudo aditivo e seguro de rodar mais de uma vez.

-- ============================================================
-- Regras de gamificação configuráveis pelo admin (PRD 4.2)
-- ============================================================
create table if not exists public.gamificacao_regras (
  acao text primary key,
  pontos integer not null check (pontos >= 0),
  limite_diario integer check (limite_diario is null or limite_diario >= 0),
  ativo boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.gamificacao_config (
  chave text primary key,
  valor integer not null check (valor >= 0),
  updated_at timestamptz not null default now()
);

insert into public.gamificacao_regras (acao, pontos, limite_diario) values
  ('candidatura_criada', 10, 5),
  ('checklist_item_marcado', 5, 8),
  ('status_mudou_para_entrevista', 15, null),
  ('status_atualizado_apos_5_dias_parado', 5, null),
  ('analise_curriculo_concluida', 10, null),
  ('melhoria_aplicada_reupload_curriculo', 15, null),
  ('documento_assinado_no_prazo', 10, null),
  ('exercicio_estruturado_concluido', 25, null),
  ('sessao_mentoria_realizada', 20, null),
  ('candidatura_fechada', 100, null),
  ('sequencia_5_dias_bonus', 20, null)
on conflict (acao) do nothing;

insert into public.gamificacao_config (chave, valor) values
  ('nivel_2_pontos', 30),
  ('nivel_3_pontos', 80),
  ('nivel_4_pontos', 150),
  ('nivel_5_pontos', 250),
  ('aviso_dias_sem_cadastrar', 2),
  ('aviso_dias_candidatura_parada', 10),
  ('bonus_dias_parada', 5)
on conflict (chave) do nothing;

alter table public.gamificacao_regras enable row level security;
alter table public.gamificacao_config enable row level security;

drop policy if exists "regras_select_authenticated" on public.gamificacao_regras;
create policy "regras_select_authenticated" on public.gamificacao_regras
  for select to authenticated using (true);
drop policy if exists "regras_write_admin" on public.gamificacao_regras;
create policy "regras_write_admin" on public.gamificacao_regras
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "config_select_authenticated" on public.gamificacao_config;
create policy "config_select_authenticated" on public.gamificacao_config
  for select to authenticated using (true);
drop policy if exists "config_write_admin" on public.gamificacao_config;
create policy "config_write_admin" on public.gamificacao_config
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Loja de recompensas (PRD 3.7 / 6.5)
-- ============================================================
create table if not exists public.loja_itens (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  custo_pontos integer not null check (custo_pontos > 0),
  cota_mensal integer check (cota_mensal is null or cota_mensal >= 0), -- null = sem limite
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

do $$ begin
  create type resgate_status as enum ('pendente', 'aprovado', 'concluido', 'recusado');
exception when duplicate_object then null; end $$;

create table if not exists public.loja_resgates (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  item_id uuid not null references public.loja_itens (id),
  item_titulo text not null,
  pontos_debitados integer not null check (pontos_debitados > 0),
  status resgate_status not null default 'pendente',
  observacao_admin text,
  created_at timestamptz not null default now(),
  decidido_em timestamptz,
  decidido_por uuid references public.profiles (id)
);

create index if not exists loja_resgates_candidato_idx on public.loja_resgates (candidato_id, created_at desc);
create index if not exists loja_resgates_status_idx on public.loja_resgates (status, created_at desc);
create index if not exists loja_resgates_item_idx on public.loja_resgates (item_id, created_at);

alter table public.loja_itens enable row level security;
alter table public.loja_resgates enable row level security;

drop policy if exists "loja_itens_select" on public.loja_itens;
create policy "loja_itens_select" on public.loja_itens
  for select to authenticated using (ativo or public.is_admin());
drop policy if exists "loja_itens_write_admin" on public.loja_itens;
create policy "loja_itens_write_admin" on public.loja_itens
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Resgate é criado pelo servidor (valida saldo e cota); candidato só lê os próprios
drop policy if exists "resgates_select_own_or_admin" on public.loja_resgates;
create policy "resgates_select_own_or_admin" on public.loja_resgates
  for select to authenticated using (candidato_id = auth.uid() or public.is_admin());
drop policy if exists "resgates_update_admin" on public.loja_resgates;
create policy "resgates_update_admin" on public.loja_resgates
  for update to authenticated using (public.is_admin());

-- ============================================================
-- Agenda de mentoria (PRD 3.6)
-- ============================================================
create table if not exists public.agenda_disponibilidade (
  id uuid primary key default gen_random_uuid(),
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0 = domingo
  hora_inicio time not null,
  hora_fim time not null,
  duracao_min integer not null default 60 check (duracao_min between 15 and 240),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  check (hora_fim > hora_inicio)
);

create table if not exists public.agenda_liberacoes (
  candidato_id uuid primary key references public.profiles (id) on delete cascade,
  liberado boolean not null default false,
  liberado_em timestamptz,
  liberado_por uuid references public.profiles (id)
);

do $$ begin
  create type sessao_status as enum ('agendada', 'realizada', 'cancelada', 'faltou');
exception when duplicate_object then null; end $$;

create table if not exists public.agenda_sessoes (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  status sessao_status not null default 'agendada',
  origem text not null default 'mentoria', -- mentoria | resgate
  google_event_id text,
  meet_link text,
  observacao text,
  cancelado_por uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  check (fim > inicio)
);

-- Impede dois agendamentos no mesmo horário, mesmo com cliques simultâneos
create unique index if not exists agenda_sessoes_horario_unico
  on public.agenda_sessoes (inicio) where status = 'agendada';
create index if not exists agenda_sessoes_candidato_idx on public.agenda_sessoes (candidato_id, inicio desc);
create index if not exists agenda_sessoes_inicio_idx on public.agenda_sessoes (inicio);

-- Conexão com o Google Calendar da consultoria (um registro). Sem políticas:
-- só o servidor (chave de serviço) lê e grava, o token nunca chega ao navegador.
create table if not exists public.google_conexao (
  id integer primary key default 1 check (id = 1),
  email text,
  refresh_token text not null,
  calendar_id text not null default 'primary',
  conectado_em timestamptz not null default now()
);

alter table public.agenda_disponibilidade enable row level security;
alter table public.agenda_liberacoes enable row level security;
alter table public.agenda_sessoes enable row level security;
alter table public.google_conexao enable row level security;

drop policy if exists "disponibilidade_select" on public.agenda_disponibilidade;
create policy "disponibilidade_select" on public.agenda_disponibilidade
  for select to authenticated using (ativo or public.is_admin());
drop policy if exists "disponibilidade_write_admin" on public.agenda_disponibilidade;
create policy "disponibilidade_write_admin" on public.agenda_disponibilidade
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "liberacoes_select_own_or_admin" on public.agenda_liberacoes;
create policy "liberacoes_select_own_or_admin" on public.agenda_liberacoes
  for select to authenticated using (candidato_id = auth.uid() or public.is_admin());
drop policy if exists "liberacoes_write_admin" on public.agenda_liberacoes;
create policy "liberacoes_write_admin" on public.agenda_liberacoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sessoes_select_own_or_admin" on public.agenda_sessoes;
create policy "sessoes_select_own_or_admin" on public.agenda_sessoes
  for select to authenticated using (candidato_id = auth.uid() or public.is_admin());
drop policy if exists "sessoes_update_admin" on public.agenda_sessoes;
create policy "sessoes_update_admin" on public.agenda_sessoes
  for update to authenticated using (public.is_admin());

-- ============================================================
-- Academia LinkedIn (PRD 3.5): amplia a tabela existente
-- ============================================================
alter table public.academia_conteudos add column if not exists resumo text;
alter table public.academia_conteudos add column if not exists video_url text;
alter table public.academia_conteudos add column if not exists updated_at timestamptz not null default now();
create index if not exists academia_publicado_idx on public.academia_conteudos (publicado, categoria, ordem);

-- ============================================================
-- Saldo para resgate (pontos acumulados continuam definindo o nível)
-- ============================================================
create or replace view public.saldo_pontos
with (security_invoker = true) as
select
  p.id as candidato_id,
  coalesce((select sum(e.pontos) from public.pontuacao_eventos e where e.candidato_id = p.id), 0)::int as acumulados,
  coalesce((
    select sum(r.pontos_debitados) from public.loja_resgates r
    where r.candidato_id = p.id and r.status <> 'recusado'
  ), 0)::int as gastos
from public.profiles p
where p.role = 'candidato';
