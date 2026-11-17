"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  atualizarItem,
  criarItem,
  decidirResgate,
  type ItemInput,
} from "@/lib/data/loja";

function revalidar() {
  revalidatePath("/admin/loja");
  revalidatePath("/loja");
}

export async function criarItemAction(input: ItemInput) {
  await requireAdmin();
  if (!input.titulo.trim() || input.custo_pontos <= 0) throw new Error("Dados inválidos");
  await criarItem({ ...input, titulo: input.titulo.trim() });
  revalidar();
}

export async function atualizarItemAction(id: string, campos: Partial<ItemInput> & { ativo?: boolean }) {
  await requireAdmin();
  await atualizarItem(id, campos);
  revalidar();
}

export async function decidirResgateAction(
  id: string,
  status: "aprovado" | "concluido" | "recusado",
  observacao?: string,
) {
  const admin = await requireAdmin();
  await decidirResgate(admin.id, id, status, observacao);
  revalidar();
}
