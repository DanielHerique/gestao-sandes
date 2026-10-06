-- Políticas de acesso dos buckets de Storage (criados como privados).
-- Convenção de caminho: <candidato_id>/... para arquivos do candidato.

-- documentos: candidato lê e envia só na própria pasta; admin tudo
create policy "documentos_storage_select" on storage.objects
  for select to authenticated using (
    bucket_id = 'documentos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );
create policy "documentos_storage_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'documentos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );
create policy "documentos_storage_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'documentos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- curriculos: candidato envia e lê os próprios; admin lê
create policy "curriculos_storage_select" on storage.objects
  for select to authenticated using (
    bucket_id = 'curriculos'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );
create policy "curriculos_storage_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'curriculos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- documento-templates: só admin
create policy "templates_storage_admin" on storage.objects
  for all to authenticated using (
    bucket_id = 'documento-templates' and public.is_admin()
  ) with check (
    bucket_id = 'documento-templates' and public.is_admin()
  );
