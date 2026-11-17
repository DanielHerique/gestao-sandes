-- Solicitações do MVP (docs/solicitacoes-mvp-para-agente.md)
-- Item 7: novos nomes de status; Item 1: validação da indicação; Item 5: tutorial visto.

-- ============================================================
-- Item 7: status de candidaturas (renomear preserva todos os dados)
-- ============================================================
do $$
begin
  if exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
             where t.typname = 'candidatura_status' and e.enumlabel = 'indefinido') then
    alter type public.candidatura_status rename value 'indefinido' to 'em_andamento';
    alter type public.candidatura_status rename value 'entrevista' to 'entrevistas';
    alter type public.candidatura_status rename value 'fechada' to 'aprovado';
    alter type public.candidatura_status rename value 'retorno_negativo' to 'reprovado';
  end if;
end $$;

alter table public.candidaturas alter column status set default 'em_andamento';

create or replace view public.carteira_resumo
with (security_invoker = true) as
select
  p.id,
  p.nome,
  p.email,
  p.created_at,
  (
    select pc.plano from public.planos_contratados pc
    where pc.candidato_id = p.id and pc.ativo
    order by pc.created_at desc limit 1
  ) as plano,
  (select count(*) from public.candidaturas c where c.candidato_id = p.id)::int as total_candidaturas,
  (
    select count(*) from public.candidaturas c
    where c.candidato_id = p.id and c.status in ('em_andamento', 'entrevistas')
  )::int as candidaturas_ativas,
  (select coalesce(sum(e.pontos), 0) from public.pontuacao_eventos e where e.candidato_id = p.id)::int as pontos,
  (
    select count(*) from public.documentos d
    where d.candidato_id = p.id and d.status = 'pendente_assinatura'
  )::int as documentos_pendentes,
  (select max(c.updated_at) from public.candidaturas c where c.candidato_id = p.id) as ultima_atividade,
  coalesce(
    (select max(c.updated_at) from public.candidaturas c where c.candidato_id = p.id),
    p.created_at
  ) < now() - interval '7 days' as risco
from public.profiles p
where p.role = 'candidato';

-- ============================================================
-- Item 1: fila de validação da indicação feita pela Sandes
-- ============================================================
create table if not exists public.validacoes_indicacao (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid not null unique references public.candidaturas (id) on delete cascade,
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'validada', 'devolvida')),
  observacao text,
  validado_por uuid references public.profiles (id),
  validado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists validacoes_indicacao_status_idx
  on public.validacoes_indicacao (status, created_at);

alter table public.validacoes_indicacao enable row level security;

-- Leitura: o dono da candidatura e a mentora. Escrita: apenas o servidor (chave de serviço).
drop policy if exists "validacoes_select_own_or_admin" on public.validacoes_indicacao;
create policy "validacoes_select_own_or_admin" on public.validacoes_indicacao
  for select to authenticated using (candidato_id = auth.uid() or public.is_admin());

-- Candidaturas que já tinham perfis de recrutadores e ainda não têm a indicação marcada entram na fila.
insert into public.validacoes_indicacao (candidatura_id, candidato_id)
select c.id, c.candidato_id
from public.candidaturas c
left join public.candidatura_checklist k on k.candidatura_id = c.id
where nullif(trim(coalesce(c.perfil_recrutador_linkedin, '')), '') is not null
  and coalesce(k.indicacao_perfil, false) = false
on conflict (candidatura_id) do nothing;

-- ============================================================
-- Item 5: tutorial visto por usuário
-- ============================================================
alter table public.profiles add column if not exists tutorial_visto boolean not null default false;
