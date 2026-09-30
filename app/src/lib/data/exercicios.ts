import { createClient } from "@/lib/supabase/server";
import type {
  ExercicioAutoconhecimento,
  ExercicioListaMestraLinha,
  ExercicioPdi5w2h,
  ExercicioPdiMeta,
  ExercicioShazam,
  ExercicioStatus,
} from "@/lib/types/database";

// ---------- Lista Mestra ----------

export async function listarListaMestra(
  candidatoId: string,
): Promise<ExercicioListaMestraLinha[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_lista_mestra_linhas")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ExercicioListaMestraLinha[];
}

export type LinhaListaMestraInput = Omit<
  ExercicioListaMestraLinha,
  "id" | "candidato_id" | "created_at" | "updated_at"
>;

export async function adicionarLinhaListaMestra(
  candidatoId: string,
  input: Partial<LinhaListaMestraInput>,
): Promise<ExercicioListaMestraLinha> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_lista_mestra_linhas")
    .insert({ candidato_id: candidatoId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data as ExercicioListaMestraLinha;
}

export async function atualizarLinhaListaMestra(
  id: string,
  input: Partial<LinhaListaMestraInput>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_lista_mestra_linhas")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function excluirLinhaListaMestra(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_lista_mestra_linhas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- Shazam ----------

export async function obterShazam(
  candidatoId: string,
): Promise<ExercicioShazam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_shazam")
    .select("*")
    .eq("candidato_id", candidatoId)
    .maybeSingle();

  if (error) throw error;
  return data as ExercicioShazam | null;
}

export async function salvarShazam(
  candidatoId: string,
  input: Partial<Omit<ExercicioShazam, "candidato_id" | "updated_at">>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_shazam")
    .upsert({ candidato_id: candidatoId, ...input });
  if (error) throw error;
}

// ---------- Autoconhecimento ----------

export async function obterAutoconhecimento(
  candidatoId: string,
): Promise<ExercicioAutoconhecimento | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_autoconhecimento")
    .select("*")
    .eq("candidato_id", candidatoId)
    .maybeSingle();

  if (error) throw error;
  return data as ExercicioAutoconhecimento | null;
}

export async function salvarAutoconhecimento(
  candidatoId: string,
  input: Partial<
    Omit<ExercicioAutoconhecimento, "candidato_id" | "updated_at">
  >,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_autoconhecimento")
    .upsert({ candidato_id: candidatoId, ...input });
  if (error) throw error;
}

// ---------- PDI ----------

export async function listarPdiMetas(
  candidatoId: string,
): Promise<ExercicioPdiMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_pdi_metas")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ExercicioPdiMeta[];
}

export async function adicionarPdiMeta(
  candidatoId: string,
  competencia: string,
  prazo: "curto" | "medio" | "longo",
): Promise<ExercicioPdiMeta> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_pdi_metas")
    .insert({ candidato_id: candidatoId, competencia, prazo })
    .select()
    .single();

  if (error) throw error;
  return data as ExercicioPdiMeta;
}

export async function excluirPdiMeta(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_pdi_metas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listarPdi5w2h(
  candidatoId: string,
): Promise<ExercicioPdi5w2h[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_pdi_5w2h")
    .select("*")
    .eq("candidato_id", candidatoId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ExercicioPdi5w2h[];
}

export type Pdi5w2hInput = Omit<
  ExercicioPdi5w2h,
  "id" | "candidato_id" | "created_at"
>;

export async function adicionarPdi5w2h(
  candidatoId: string,
  input: Partial<Pdi5w2hInput>,
): Promise<ExercicioPdi5w2h> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_pdi_5w2h")
    .insert({ candidato_id: candidatoId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data as ExercicioPdi5w2h;
}

export async function excluirPdi5w2h(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_pdi_5w2h")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function obterStatusPdi(
  candidatoId: string,
): Promise<ExercicioStatus> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercicio_pdi_status")
    .select("status")
    .eq("candidato_id", candidatoId)
    .maybeSingle();

  if (error) throw error;
  return data?.status ?? "nao_iniciado";
}

export async function atualizarStatusPdi(
  candidatoId: string,
  status: ExercicioStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicio_pdi_status")
    .upsert({ candidato_id: candidatoId, status });
  if (error) throw error;
}
