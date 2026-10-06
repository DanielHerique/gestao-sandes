import { createClient } from "@/lib/supabase/server";
import type { Notificacao, NotificacaoTipo } from "@/lib/types/database";

export async function listarNotificacoes(
  candidatoId: string,
  { pagina = 1, tamanho = 10 }: { pagina?: number; tamanho?: number } = {},
): Promise<{ itens: Notificacao[]; total: number }> {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  const { data, error, count } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact" })
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false })
    .range(de, de + tamanho - 1);

  if (error) throw error;
  return { itens: (data ?? []) as Notificacao[], total: count ?? 0 };
}

export async function marcarComoLida(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id);
  if (error) throw error;
}

export async function criarNotificacao(
  candidatoId: string,
  tipo: NotificacaoTipo,
  titulo: string,
  mensagem: string,
  criadoPor?: string,
): Promise<Notificacao> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notificacoes")
    .insert({
      candidato_id: candidatoId,
      tipo,
      titulo,
      mensagem,
      criado_por: criadoPor ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notificacao;
}
