import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { LojaItem, LojaResgate, ResgateStatus } from "@/lib/types/database";

// Início do mês corrente no horário de Brasília (UTC-3), base da cota mensal
export function inicioDoMes(): string {
  const agora = new Date(Date.now() - 3 * 3600000);
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1, 3, 0, 0)).toISOString();
}

export interface Saldo {
  acumulados: number;
  gastos: number;
  disponivel: number;
}

export async function obterSaldo(candidatoId: string): Promise<Saldo> {
  const admin = createAdminClient();
  const [{ data: eventos }, { data: resgates }] = await Promise.all([
    admin.from("pontuacao_eventos").select("pontos").eq("candidato_id", candidatoId),
    admin.from("loja_resgates").select("pontos_debitados, status").eq("candidato_id", candidatoId).neq("status", "recusado"),
  ]);
  const acumulados = (eventos ?? []).reduce((t, e) => t + e.pontos, 0);
  const gastos = (resgates ?? []).reduce((t, r) => t + r.pontos_debitados, 0);
  return { acumulados, gastos, disponivel: Math.max(0, acumulados - gastos) };
}

export interface ItemComDisponibilidade extends LojaItem {
  usadosNoMes: number;
  restantesNoMes: number | null; // null = sem limite
}

async function usoDoMes(): Promise<Record<string, number>> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("loja_resgates")
    .select("item_id")
    .gte("created_at", inicioDoMes())
    .neq("status", "recusado");
  const uso: Record<string, number> = {};
  for (const r of data ?? []) uso[r.item_id] = (uso[r.item_id] ?? 0) + 1;
  return uso;
}

export async function listarItens(opcoes: { somenteAtivos: boolean }): Promise<ItemComDisponibilidade[]> {
  const supabase = await createClient();
  let q = supabase.from("loja_itens").select("*").order("custo_pontos", { ascending: true });
  if (opcoes.somenteAtivos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  const uso = await usoDoMes();
  return ((data ?? []) as LojaItem[]).map((i) => {
    const usados = uso[i.id] ?? 0;
    return {
      ...i,
      usadosNoMes: usados,
      restantesNoMes: i.cota_mensal === null ? null : Math.max(0, i.cota_mensal - usados),
    };
  });
}

export async function listarResgatesDoCandidato(candidatoId: string, pagina: number, tamanho: number) {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  const { data, error, count } = await supabase
    .from("loja_resgates")
    .select("*", { count: "exact" })
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false })
    .range(de, de + tamanho - 1);
  if (error) throw error;
  return { itens: (data ?? []) as LojaResgate[], total: count ?? 0 };
}

export interface ResgateComCandidato extends LojaResgate {
  candidato_nome: string;
}

export async function listarResgatesAdmin(
  status: ResgateStatus | "todos",
  pagina: number,
  tamanho: number,
): Promise<{ itens: ResgateComCandidato[]; total: number }> {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  let q = supabase
    .from("loja_resgates")
    .select("*, candidato:profiles!loja_resgates_candidato_id_fkey(nome)", { count: "exact" })
    .order("created_at", { ascending: status === "pendente" })
    .range(de, de + tamanho - 1);
  if (status !== "todos") q = q.eq("status", status);
  const { data, error, count } = await q;
  if (error) throw error;
  const itens = (data ?? []).map((r: Record<string, unknown>) => {
    const { candidato, ...resto } = r as unknown as { candidato?: { nome?: string } | { nome?: string }[] } & LojaResgate;
    const nome = Array.isArray(candidato) ? candidato[0]?.nome : candidato?.nome;
    return { ...(resto as LojaResgate), candidato_nome: nome ?? "Candidato" };
  });
  return { itens, total: count ?? 0 };
}

export async function contarPendentes(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("loja_resgates").select("id", { count: "exact", head: true }).eq("status", "pendente");
  return count ?? 0;
}

export class ResgateInvalidoError extends Error {}

/** Valida item ativo, saldo e cota do mês e cria o pedido pendente (pontos debitados na hora). */
export async function criarResgate(candidatoId: string, itemId: string): Promise<LojaResgate> {
  const admin = createAdminClient();
  const { data: item } = await admin.from("loja_itens").select("*").eq("id", itemId).maybeSingle();
  if (!item || !item.ativo) throw new ResgateInvalidoError("Esse item não está disponível.");

  const saldo = await obterSaldo(candidatoId);
  if (saldo.disponivel < item.custo_pontos) {
    throw new ResgateInvalidoError(`Saldo insuficiente: faltam ${item.custo_pontos - saldo.disponivel} pontos.`);
  }

  if (item.cota_mensal !== null) {
    const { count } = await admin
      .from("loja_resgates")
      .select("id", { count: "exact", head: true })
      .eq("item_id", itemId)
      .gte("created_at", inicioDoMes())
      .neq("status", "recusado");
    if ((count ?? 0) >= item.cota_mensal) {
      throw new ResgateInvalidoError("A cota deste item acabou neste mês. Volta a abrir no próximo.");
    }
  }

  const { data, error } = await admin
    .from("loja_resgates")
    .insert({
      candidato_id: candidatoId,
      item_id: item.id,
      item_titulo: item.titulo,
      pontos_debitados: item.custo_pontos,
    })
    .select()
    .single();
  if (error) throw error;
  return data as LojaResgate;
}

export async function decidirResgate(
  adminId: string,
  resgateId: string,
  status: Exclude<ResgateStatus, "pendente">,
  observacao?: string,
): Promise<LojaResgate> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("loja_resgates")
    .update({
      status,
      observacao_admin: observacao?.trim() || null,
      decidido_em: new Date().toISOString(),
      decidido_por: adminId,
    })
    .eq("id", resgateId)
    .select()
    .single();
  if (error) throw error;
  const r = data as LojaResgate;

  const textos: Record<string, [string, string]> = {
    aprovado: ["Resgate aprovado", `Seu pedido "${r.item_titulo}" foi aprovado. A consultoria vai combinar a entrega com você.`],
    concluido: ["Benefício entregue", `O benefício "${r.item_titulo}" foi concluído.`],
    recusado: ["Resgate não aprovado", `Seu pedido "${r.item_titulo}" não pôde ser atendido agora. Os ${r.pontos_debitados} pontos voltaram para o seu saldo.${observacao?.trim() ? ` Motivo: ${observacao.trim()}` : ""}`],
  };
  const [titulo, mensagem] = textos[status];
  await admin.from("notificacoes").insert({
    candidato_id: r.candidato_id,
    tipo: "institucional",
    titulo,
    mensagem,
    criado_por: adminId,
  });
  return r;
}

export interface ItemInput {
  titulo: string;
  descricao?: string;
  custo_pontos: number;
  cota_mensal: number | null;
}

export async function criarItem(input: ItemInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("loja_itens").insert({
    titulo: input.titulo,
    descricao: input.descricao || null,
    custo_pontos: input.custo_pontos,
    cota_mensal: input.cota_mensal,
  });
  if (error) throw error;
}

export async function atualizarItem(id: string, campos: Partial<ItemInput> & { ativo?: boolean }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("loja_itens").update(campos).eq("id", id);
  if (error) throw error;
}
