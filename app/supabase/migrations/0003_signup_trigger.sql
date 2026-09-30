-- Cria o profile automaticamente quando um usuário é criado no Supabase Auth.
-- role/nome vêm de user_metadata definido na hora da criação do usuário
-- (pelo admin, via dashboard do Supabase ou futuramente por um fluxo de convite).

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, nome, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'candidato'),
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
