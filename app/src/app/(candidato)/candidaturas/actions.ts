"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import {
  atualizarChecklistItem,
  atualizarCandidatura,
  criarCandidatura,
  excluirCandidatura,
  moverStatus,
  type NovaCandidaturaInput,
} from "@/lib/data/candidaturas";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import type { CandidaturaChecklist, CandidaturaStatus } from "@/lib/types/database";

const CANDIDATURAS_PATH = "/candidaturas";

export async function criarCandidaturaAction(input: NovaCandidaturaInput) {
  const profile = await requireProfile();

  const candidatura = await criarCandidatura(profile.id, input);
  await registrarEventoPontuacao(profile.id, "candidatura_criada", {
    tipo: "candidatura",
    id: candidatura.id,
  });

  revalidatePath(CANDIDATURAS_PATH);
  return candidatura;
}

export async function atualizarCandidaturaAction(
  id: string,
  input: Partial<NovaCandidaturaInput>,
) {
  await requireProfile();
  await atualizarCandidatura(id, input);
  revalidatePath(CANDIDATURAS_PATH);
}

export async function excluirCandidaturaAction(id: string) {
  await requireProfile();
  await excluirCandidatura(id);
  revalidatePath(CANDIDATURAS_PATH);
}

export async function moverStatusAction(
  id: string,
  status: CandidaturaStatus,
) {
  const profile = await requireProfile();
  await moverStatus(id, status);

  if (status === "entrevista") {
    await registrarEventoPontuacao(profile.id, "status_mudou_para_entrevista", {
      tipo: "candidatura",
      id,
    });
  }
  if (status === "fechada") {
    await registrarEventoPontuacao(profile.id, "candidatura_fechada", {
      tipo: "candidatura",
      id,
    });
  }

  revalidatePath(CANDIDATURAS_PATH);
}

export async function marcarChecklistItemAction(
  candidaturaId: string,
  item: keyof Omit<CandidaturaChecklist, "candidatura_id" | "updated_at">,
  valor: boolean,
) {
  const profile = await requireProfile();
  await atualizarChecklistItem(candidaturaId, item, valor);

  if (valor) {
    await registrarEventoPontuacao(profile.id, "checklist_item_marcado", {
      tipo: "candidatura_checklist",
      id: candidaturaId,
    });
  }

  revalidatePath(CANDIDATURAS_PATH);
}
