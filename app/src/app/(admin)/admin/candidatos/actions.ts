"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { atribuirPlano } from "@/lib/data/planos";
import { criarAnotacao } from "@/lib/data/anotacoes";
import type { PlanoNome } from "@/lib/types/database";

export async function atribuirPlanoAction(
  candidatoId: string,
  plano: PlanoNome,
) {
  const admin = await requireAdmin();
  await atribuirPlano(candidatoId, plano, admin.id);
  revalidatePath(`/admin/candidatos/${candidatoId}`);
}

export async function criarAnotacaoAction(candidatoId: string, texto: string) {
  const admin = await requireAdmin();
  if (!texto.trim()) return;
  await criarAnotacao(candidatoId, admin.id, texto.trim());
  revalidatePath(`/admin/candidatos/${candidatoId}`);
}
