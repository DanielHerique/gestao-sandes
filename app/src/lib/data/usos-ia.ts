import { createAdminClient } from "@/lib/supabase/admin";

export type TipoUsoIa = "raio_x_vaga" | "treino_entrevista";

/**
 * Confere o limite diário e registra o uso. Se a tabela ainda não existir
 * (migration 0008 pendente), não bloqueia a pessoa.
 */
export async function usarIa(candidatoId: string, tipo: TipoUsoIa, limiteDia: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error } = await admin
      .from("usos_ia")
      .select("id", { count: "exact", head: true })
      .eq("candidato_id", candidatoId)
      .eq("tipo", tipo)
      .gte("created_at", desde);
    if (error) return true;
    if ((count ?? 0) >= limiteDia) return false;
    await admin.from("usos_ia").insert({ candidato_id: candidatoId, tipo });
    return true;
  } catch {
    return true;
  }
}
