import { createAdminClient } from "@/lib/supabase/admin";
import { criarNotificacao } from "@/lib/data/notificacoes";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import { lerPerfisRecrutadores } from "@/lib/candidaturas-util";

export interface ValidacaoPendente {
  id: string;
  candidatura_id: string;
  candidato_id: string;
  candidato_nome: string;
  empresa: string;
  cargo: string;
  perfis: string[];
  created_at: string;
}

/**
 * Coloca a candidatura na fila da mentora quando ela tem perfis de recrutadores
 * e a indicação ainda não foi validada. Chamada pelo servidor depois de criar
 * ou editar a candidatura.
 */
export async function enfileirarValidacao(
  candidaturaId: string,
  candidatoId: string,
  perfilRecrutador: string | null | undefined,
): Promise<void> {
  if (lerPerfisRecrutadores(perfilRecrutador).length === 0) return;
  const db = createAdminClient();

  const { data: existente } = await db
    .from("validacoes_indicacao")
    .select("id, status")
    .eq("candidatura_id", candidaturaId)
    .maybeSingle();

  if (existente) {
    // Já validada ou já na fila: nada a fazer. Devolvida volta para a fila quando o mentorado corrige os perfis.
    if (existente.status === "devolvida") {
      await db
        .from("validacoes_indicacao")
        .update({ status: "pendente", observacao: null, validado_por: null, validado_em: null })
        .eq("id", existente.id);
    }
    return;
  }

  const { error } = await db
    .from("validacoes_indicacao")
    .insert({ candidatura_id: candidaturaId, candidato_id: candidatoId });
  if (error) throw error;
}

export async function listarValidacoesPendentes(): Promise<ValidacaoPendente[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("validacoes_indicacao")
    .select(
      "id, candidatura_id, candidato_id, created_at, candidato:profiles!validacoes_indicacao_candidato_id_fkey(nome), candidatura:candidaturas(empresa, cargo, perfil_recrutador_linkedin)",
    )
    .eq("status", "pendente")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const cand = (Array.isArray(row.candidato) ? row.candidato[0] : row.candidato) as { nome: string } | null;
    const vaga = (Array.isArray(row.candidatura) ? row.candidatura[0] : row.candidatura) as
      | { empresa: string; cargo: string; perfil_recrutador_linkedin: string | null }
      | null;
    return {
      id: row.id,
      candidatura_id: row.candidatura_id,
      candidato_id: row.candidato_id,
      candidato_nome: cand?.nome ?? "Mentorado",
      empresa: vaga?.empresa ?? "",
      cargo: vaga?.cargo ?? "",
      perfis: lerPerfisRecrutadores(vaga?.perfil_recrutador_linkedin),
      created_at: row.created_at,
    };
  });
}

export async function contarValidacoesPendentes(): Promise<number> {
  const db = createAdminClient();
  const { count } = await db
    .from("validacoes_indicacao")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendente");
  return count ?? 0;
}

async function obterValidacao(id: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("validacoes_indicacao")
    .select("id, candidatura_id, candidato_id, status, candidatura:candidaturas(empresa, cargo)")
    .eq("id", id)
    .single();
  if (error) throw error;
  const vaga = (Array.isArray(data.candidatura) ? data.candidatura[0] : data.candidatura) as
    | { empresa: string; cargo: string }
    | null;
  return { ...data, empresa: vaga?.empresa ?? "", cargo: vaga?.cargo ?? "" };
}

/** Mentora confirma que a indicação foi feita: marca o checklist, pontua e avisa o mentorado. */
export async function validarIndicacao(id: string, adminId: string): Promise<void> {
  const v = await obterValidacao(id);
  if (v.status !== "pendente") return;
  const db = createAdminClient();

  const { error: e1 } = await db
    .from("validacoes_indicacao")
    .update({ status: "validada", validado_por: adminId, validado_em: new Date().toISOString(), observacao: null })
    .eq("id", id);
  if (e1) throw e1;

  const { error: e2 } = await db
    .from("candidatura_checklist")
    .update({ indicacao_perfil: true })
    .eq("candidatura_id", v.candidatura_id);
  if (e2) throw e2;

  await registrarEventoPontuacao(
    v.candidato_id,
    "checklist_item_marcado",
    { tipo: "checklist:indicacao_perfil", id: v.candidatura_id },
    { unico: true },
  );

  await criarNotificacao(
    v.candidato_id,
    "institucional",
    "Indicação realizada",
    `A Sandes fez a indicação do seu perfil para ${v.cargo} na ${v.empresa}. O item foi marcado no seu checklist.`,
    adminId,
  );
}

/** Mentora devolve com observação: o mentorado corrige os perfis e a candidatura volta para a fila. */
export async function devolverIndicacao(id: string, adminId: string, observacao: string): Promise<void> {
  const v = await obterValidacao(id);
  if (v.status !== "pendente") return;
  const db = createAdminClient();

  const { error } = await db
    .from("validacoes_indicacao")
    .update({ status: "devolvida", validado_por: adminId, validado_em: new Date().toISOString(), observacao })
    .eq("id", id);
  if (error) throw error;

  await criarNotificacao(
    v.candidato_id,
    "institucional",
    "Indicação precisa de ajuste",
    `Sobre ${v.cargo} na ${v.empresa}: ${observacao} Corrija os perfis na candidatura para a Sandes tentar de novo.`,
    adminId,
  );
}
