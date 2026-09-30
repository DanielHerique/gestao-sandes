"use server";

import { requireAdmin } from "@/lib/auth/session";
import { gerarRelatorioEngajamento } from "@/lib/data/relatorio";

export async function gerarRelatorioAction(candidatoId: string) {
  await requireAdmin();
  return gerarRelatorioEngajamento(candidatoId);
}
