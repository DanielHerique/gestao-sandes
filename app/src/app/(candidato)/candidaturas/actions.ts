"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import {
  atualizarChecklistItem,
  atualizarCandidatura,
  criarCandidatura,
  excluirCandidatura,
  moverStatus,
  obterCandidaturaResumo,
  type AtualizacaoCandidatura,
  type NovaCandidaturaInput,
} from "@/lib/data/candidaturas";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import type { CandidaturaChecklist, CandidaturaStatus } from "@/lib/types/database";

const CANDIDATURAS_PATH = "/candidaturas";

function revalidarTelasDoCandidato() {
  for (const p of [CANDIDATURAS_PATH, "/inicio", "/progresso"]) revalidatePath(p);
}

export async function criarCandidaturaAction(input: NovaCandidaturaInput) {
  const profile = await requireProfile();

  const candidatura = await criarCandidatura(profile.id, input);
  const evento = await registrarEventoPontuacao(profile.id, "candidatura_criada", {
    tipo: "candidatura",
    id: candidatura.id,
  });

  revalidarTelasDoCandidato();
  return { id: candidatura.id, pontos: evento?.pontos ?? 0 };
}

export async function atualizarCandidaturaAction(
  id: string,
  input: AtualizacaoCandidatura,
) {
  await requireProfile();
  await atualizarCandidatura(id, input);
  revalidarTelasDoCandidato();
}

export async function excluirCandidaturaAction(id: string) {
  await requireProfile();
  await excluirCandidatura(id);
  revalidarTelasDoCandidato();
}

export interface ResultadoPontos {
  pontos: number;
}

export async function moverStatusAction(
  id: string,
  status: CandidaturaStatus,
): Promise<ResultadoPontos> {
  const profile = await requireProfile();
  const antes = await obterCandidaturaResumo(id);
  if (!antes || antes.status === status) return { pontos: 0 };

  await moverStatus(id, status);

  const ref = { tipo: "candidatura", id };
  let pontos = 0;
  const ganhos = [];

  if (status === "entrevista") {
    ganhos.push(
      await registrarEventoPontuacao(profile.id, "status_mudou_para_entrevista", ref, { unico: true }),
    );
  }
  if (status === "fechada") {
    ganhos.push(
      await registrarEventoPontuacao(profile.id, "candidatura_fechada", ref, { unico: true }),
    );
  }
  // Manter o funil atualizado: candidatura parada há mais de 5 dias que ganha novo status
  const diasParada = (Date.now() - new Date(antes.updated_at).getTime()) / 86400000;
  if (diasParada > 5) {
    ganhos.push(
      await registrarEventoPontuacao(profile.id, "status_atualizado_apos_5_dias_parado", ref),
    );
  }
  for (const g of ganhos) pontos += g?.pontos ?? 0;

  revalidarTelasDoCandidato();
  return { pontos };
}

export async function marcarChecklistItemAction(
  candidaturaId: string,
  item: keyof Omit<CandidaturaChecklist, "candidatura_id" | "updated_at">,
  valor: boolean,
): Promise<ResultadoPontos> {
  const profile = await requireProfile();
  await atualizarChecklistItem(candidaturaId, item, valor);

  let pontos = 0;
  if (valor) {
    // Cada item de cada candidatura pontua uma única vez
    const evento = await registrarEventoPontuacao(
      profile.id,
      "checklist_item_marcado",
      { tipo: `checklist:${item}`, id: candidaturaId },
      { unico: true },
    );
    pontos = evento?.pontos ?? 0;
  }

  revalidarTelasDoCandidato();
  return { pontos };
}
