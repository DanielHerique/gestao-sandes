"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  AgendaError,
  atualizarBloco,
  cancelarSessao,
  criarBloco,
  definirLiberacao,
  registrarDesfecho,
  removerBloco,
  type BlocoInput,
} from "@/lib/data/agenda";
import { removerConexao } from "@/lib/google/calendar";

type Resultado = { ok: boolean; mensagem: string };

function revalidar() {
  revalidatePath("/admin/agenda");
  revalidatePath("/agenda");
}

async function proteger(fn: () => Promise<Resultado>): Promise<Resultado> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AgendaError) return { ok: false, mensagem: e.message };
    throw e;
  }
}

export async function criarBlocoAction(b: BlocoInput): Promise<Resultado> {
  await requireAdmin();
  return proteger(async () => {
    await criarBloco(b);
    revalidar();
    return { ok: true, mensagem: "Horário adicionado à disponibilidade." };
  });
}

export async function alternarBlocoAction(id: string, ativo: boolean): Promise<Resultado> {
  await requireAdmin();
  await atualizarBloco(id, { ativo });
  revalidar();
  return { ok: true, mensagem: ativo ? "Horário reativado." : "Horário pausado." };
}

export async function removerBlocoAction(id: string): Promise<Resultado> {
  await requireAdmin();
  await removerBloco(id);
  revalidar();
  return { ok: true, mensagem: "Horário removido." };
}

export async function liberarAction(candidatoId: string, liberado: boolean): Promise<Resultado> {
  const admin = await requireAdmin();
  await definirLiberacao(admin.id, candidatoId, liberado);
  revalidar();
  return { ok: true, mensagem: liberado ? "Agendamento liberado. A pessoa foi avisada." : "Liberação retirada." };
}

export async function cancelarSessaoAdminAction(sessaoId: string, motivo?: string): Promise<Resultado> {
  const admin = await requireAdmin();
  return proteger(async () => {
    await cancelarSessao({ id: admin.id, admin: true }, sessaoId, motivo);
    revalidar();
    return { ok: true, mensagem: "Sessão cancelada e a pessoa foi avisada." };
  });
}

export async function desfechoSessaoAction(sessaoId: string, status: "realizada" | "faltou"): Promise<Resultado> {
  const admin = await requireAdmin();
  return proteger(async () => {
    const { pontos } = await registrarDesfecho(admin.id, sessaoId, status);
    revalidar();
    revalidatePath("/progresso");
    return {
      ok: true,
      mensagem:
        status === "realizada"
          ? pontos > 0
            ? `Sessão registrada. A pessoa ganhou ${pontos} pontos.`
            : "Sessão registrada."
          : "Falta registrada e a pessoa foi avisada.",
    };
  });
}

export async function desconectarGoogleAction(): Promise<Resultado> {
  await requireAdmin();
  await removerConexao();
  revalidar();
  return { ok: true, mensagem: "Google Calendar desconectado." };
}
