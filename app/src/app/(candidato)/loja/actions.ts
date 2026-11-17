"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { ResgateInvalidoError, criarResgate } from "@/lib/data/loja";

export async function resgatarAction(itemId: string): Promise<{ ok: boolean; mensagem: string }> {
  const profile = await requireProfile();
  try {
    const r = await criarResgate(profile.id, itemId);
    revalidatePath("/loja");
    return { ok: true, mensagem: `Pedido enviado: "${r.item_titulo}". ${r.pontos_debitados} pontos reservados.` };
  } catch (e) {
    if (e instanceof ResgateInvalidoError) return { ok: false, mensagem: e.message };
    throw e;
  }
}
