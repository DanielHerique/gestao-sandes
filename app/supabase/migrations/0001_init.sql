-- Sandes CRM — schema inicial (Semana 1: fundação + candidaturas)
-- Referência: documentos/PRD.md (seções 2, 3.1, 3.1-A, 6) e documentos/CRONOGRAMA.md (Semana 1)

create type user_role as enum ('admin', 'candidato');

create type plano_nome as enum (
  'reconexao_profissional',
  'clareza_futuro',
  'essencia_proposito',
  'avulso'
);

create type candidatura_status as enum (
  'indefinido',
  'entrevista',
  'fechada',
  'retorno_negativo'
);

-- Perfil de usuário, espelhando auth.users do Supabase (1:1)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'candidato',
  nome text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Plano contratado por candidato (PRD 3.1-A). V1: um plano ativo por candidato.
create table public.planos_contratados (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  plano plano_nome not null,
  ativo boolean not null default true,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index planos_contratados_candidato_idx on public.planos_contratados (candidato_id);

-- Candidaturas (Kanban de vagas) — PRD 3.1, campos alinhados à planilha real da Katryn
create table public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  cargo text not null,
  empresa text not null,
  segmento_empresa text,
  data_envio_curriculo date,
  link_vaga text,
  linkedin_empresa text,
  plataforma_envio text,
  perfil_recrutador_linkedin text,
  notas_pessoais text,
  status candidatura_status not null default 'indefinido',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index candidaturas_candidato_idx on public.candidaturas (candidato_id);
create index candidaturas_status_idx on public.candidaturas (status);

-- Checklist interno de 4 itens por candidatura — PRD 3.1
create table public.candidatura_checklist (
  candidatura_id uuid primary key references public.candidaturas (id) on delete cascade,
  indicacao_perfil boolean not null default false,
  curriculo_enviado boolean not null default false,
  seguiu_empresa_linkedin boolean not null default false,
  solicitou_conexao_recrutador boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Eventos de pontuação (motor de gamificação) — PRD seção 6
create table public.pontuacao_eventos (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  acao text not null,
  pontos integer not null,
  referencia_tipo text,
  referencia_id uuid,
  created_at timestamptz not null default now()
);

create index pontuacao_eventos_candidato_idx on public.pontuacao_eventos (candidato_id);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger candidaturas_set_updated_at
  before update on public.candidaturas
  for each row execute function public.set_updated_at();

create trigger candidatura_checklist_set_updated_at
  before update on public.candidatura_checklist
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.planos_contratados enable row level security;
alter table public.candidaturas enable row level security;
alter table public.candidatura_checklist enable row level security;
alter table public.pontuacao_eventos enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- profiles: candidato vê o próprio perfil; admin vê todos
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- planos_contratados: candidato vê o próprio; só admin escreve
create policy "planos_select_own_or_admin" on public.planos_contratados
  for select using (candidato_id = auth.uid() or public.is_admin());
create policy "planos_write_admin_only" on public.planos_contratados
  for insert with check (public.is_admin());
create policy "planos_update_admin_only" on public.planos_contratados
  for update using (public.is_admin());

-- candidaturas: dono do registro lê/escreve; admin lê tudo
create policy "candidaturas_all_own" on public.candidaturas
  for all using (candidato_id = auth.uid()) with check (candidato_id = auth.uid());
create policy "candidaturas_select_admin" on public.candidaturas
  for select using (public.is_admin());

-- checklist: segue a candidatura dona
create policy "checklist_all_own" on public.candidatura_checklist
  for all using (
    exists (
      select 1 from public.candidaturas c
      where c.id = candidatura_id and c.candidato_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.candidaturas c
      where c.id = candidatura_id and c.candidato_id = auth.uid()
    )
  );
create policy "checklist_select_admin" on public.candidatura_checklist
  for select using (public.is_admin());

-- pontuacao_eventos: candidato só lê os próprios; sistema (service role) escreve
create policy "pontuacao_select_own_or_admin" on public.pontuacao_eventos
  for select using (candidato_id = auth.uid() or public.is_admin());
