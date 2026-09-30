"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { marcarComoLida } from "@/lib/data/notificacoes";

export async function marcarComoLidaAction(id: string) {
  await requireProfile();
  await marcarComoLida(id);
  revalidatePath("/notificacoes");
}
