"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { devolverIndicacao, validarIndicacao } from "@/lib/data/validacoes";

function revalidar() {
  for (const p of ["/admin/validacoes", "/admin", "/candidaturas", "/inicio", "/notificacoes"]) revalidatePath(p);
}

export async function validarIndicacaoAction(id: string) {
  const admin = await requireAdmin();
  await validarIndicacao(id, admin.id);
  revalidar();
}

export async function devolverIndicacaoAction(id: string, observacao: string) {
  const admin = await requireAdmin();
  const texto = observacao.trim();
  if (!texto) throw new Error("Escreva uma observação para devolver.");
  await devolverIndicacao(id, admin.id, texto);
  revalidar();
}
