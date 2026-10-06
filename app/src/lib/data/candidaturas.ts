import { createClient } from "@/lib/supabase/server";
import type {
  Candidatura,
  CandidaturaChecklist,
  CandidaturaStatus,
} from "@/lib/types/database";

export interface CandidaturaComChecklist extends Candidatura {
  checklist: CandidaturaChecklist | null;
}

export async function listarCandidaturas(
  candidatoId: string,
): Promise<CandidaturaComChecklist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidaturas")
    .select("*, checklist:candidatura_checklist(*)")
    .eq("candidato_id", candidatoId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    checklist: Array.isArray(row.checklist)
      ? (row.checklist[0] ?? null)
      : row.checklist,
  })) as CandidaturaComChecklist[];
}

export interface NovaCandidaturaInput {
  cargo: string;
  empresa: string;
  segmento_empresa?: string;
  data_envio_curriculo?: string;
  link_vaga?: string;
  linkedin_empresa?: string;
  plataforma_envio?: string;
  perfil_recrutador_linkedin?: string;
  notas_pessoais?: string;
}

export type AtualizacaoCandidatura = Partial<
  Record<keyof NovaCandidaturaInput, string | null>
>;

export async function criarCandidatura(
  candidatoId: string,
  input: NovaCandidaturaInput,
): Promise<Candidatura> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidaturas")
    .insert({ candidato_id: candidatoId, ...input })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("candidatura_checklist").insert({
    candidatura_id: data.id,
  });

  return data as Candidatura;
}

export async function atualizarCandidatura(
  id: string,
  input: AtualizacaoCandidatura,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidaturas")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function excluirCandidatura(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("candidaturas").delete().eq("id", id);
  if (error) throw error;
}

export async function obterCandidaturaResumo(
  id: string,
): Promise<{ status: CandidaturaStatus; updated_at: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidaturas")
    .select("status, updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data as { status: CandidaturaStatus; updated_at: string } | null) ?? null;
}

export async function moverStatus(
  id: string,
  status: CandidaturaStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidaturas")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarChecklistItem(
  candidaturaId: string,
  item: keyof Omit<CandidaturaChecklist, "candidatura_id" | "updated_at">,
  valor: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidatura_checklist")
    .update({ [item]: valor })
    .eq("candidatura_id", candidaturaId);
  if (error) throw error;
}
