-- Resumo da carteira em uma única consulta (escala para muitos candidatos)
-- e índices para as listas paginadas. Seguro de rodar mais de uma vez.

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
    where c.candidato_id = p.id and c.status in ('indefinido', 'entrevista')
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

create index if not exists notificacoes_candidato_data_idx
  on public.notificacoes (candidato_id, created_at desc);
create index if not exists pontuacao_candidato_data_idx
  on public.pontuacao_eventos (candidato_id, created_at desc);
create index if not exists candidaturas_candidato_atualizacao_idx
  on public.candidaturas (candidato_id, updated_at desc);
create index if not exists documentos_candidato_status_idx
  on public.documentos (candidato_id, status);
create index if not exists profiles_role_nome_idx
  on public.profiles (role, nome);
