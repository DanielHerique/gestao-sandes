"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { salvarRegras, type LinhaRegra } from "@/lib/data/gamificacao-admin";
import type { ConfigGamificacao } from "@/lib/gamification/regras";

export async function salvarRegrasAction(linhas: LinhaRegra[], config: ConfigGamificacao) {
  await requireAdmin();

  // Os níveis precisam crescer: cada limite maior que o anterior
  const n = [config.nivel_2_pontos, config.nivel_3_pontos, config.nivel_4_pontos, config.nivel_5_pontos];
  if (n.some((v, i) => i > 0 && v <= n[i - 1])) {
    throw new Error("Os níveis precisam estar em ordem crescente de pontos.");
  }
  await salvarRegras(linhas, config);
  for (const p of ["/admin/gamificacao", "/inicio", "/progresso"]) revalidatePath(p);
}
