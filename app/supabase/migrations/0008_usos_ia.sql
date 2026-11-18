-- Registro de uso das ferramentas de IA (Raio-x da vaga e Treino de entrevista),
-- para limitar o consumo diário por pessoa.
create table if not exists public.usos_ia (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null check (tipo in ('raio_x_vaga', 'treino_entrevista')),
  created_at timestamptz not null default now()
);
create index if not exists usos_ia_candidato_idx on public.usos_ia (candidato_id, tipo, created_at desc);

alter table public.usos_ia enable row level security;

drop policy if exists "usos_ia_select_proprio" on public.usos_ia;
create policy "usos_ia_select_proprio" on public.usos_ia
  for select using (candidato_id = auth.uid() or public.is_admin());
