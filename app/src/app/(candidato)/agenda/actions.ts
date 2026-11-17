"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { AgendaError, agendarSessao, cancelarSessao } from "@/lib/data/agenda";
import { formatarDataHora } from "@/lib/agenda";

type Resultado = { ok: boolean; mensagem: string };

export async function agendarAction(inicio: string): Promise<Resultado> {
  const profile = await requireProfile();
  try {
    const s = await agendarSessao({ id: profile.id, nome: profile.nome, email: profile.email }, inicio);
    revalidatePath("/agenda");
    revalidatePath("/admin/agenda");
    return { ok: true, mensagem: `Sessão marcada para ${formatarDataHora(s.inicio)}.` };
  } catch (e) {
    if (e instanceof AgendaError) return { ok: false, mensagem: e.message };
    throw e;
  }
}

export async function cancelarAction(sessaoId: string): Promise<Resultado> {
  const profile = await requireProfile();
  try {
    await cancelarSessao({ id: profile.id, admin: false }, sessaoId);
    revalidatePath("/agenda");
    revalidatePath("/admin/agenda");
    return { ok: true, mensagem: "Sessão cancelada. Você pode escolher outro horário." };
  } catch (e) {
    if (e instanceof AgendaError) return { ok: false, mensagem: e.message };
    throw e;
  }
}
