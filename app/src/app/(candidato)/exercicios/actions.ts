"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import {
  adicionarLinhaListaMestra,
  adicionarPdi5w2h,
  adicionarPdiMeta,
  atualizarLinhaListaMestra,
  atualizarStatusPdi,
  excluirLinhaListaMestra,
  excluirPdi5w2h,
  excluirPdiMeta,
  obterStatusPdi,
  salvarAutoconhecimento,
  salvarShazam,
  type LinhaListaMestraInput,
  type Pdi5w2hInput,
} from "@/lib/data/exercicios";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import type {
  ExercicioAutoconhecimento,
  ExercicioShazam,
  ExercicioStatus,
} from "@/lib/types/database";

const EXERCICIOS_PATH = "/exercicios";

async function pontuarSeConcluido(
  candidatoId: string,
  statusAnterior: ExercicioStatus | undefined,
  statusNovo: ExercicioStatus | undefined,
  exercicio: string,
) {
  if (statusNovo === "concluido" && statusAnterior !== "concluido") {
    await registrarEventoPontuacao(
      candidatoId,
      "exercicio_estruturado_concluido",
      { tipo: "exercicio", id: exercicio },
    );
  }
}

// ---------- Lista Mestra ----------

export async function adicionarLinhaListaMestraAction(
  input: Partial<LinhaListaMestraInput>,
) {
  const profile = await requireProfile();
  await adicionarLinhaListaMestra(profile.id, input);
  revalidatePath(EXERCICIOS_PATH);
}

export async function atualizarLinhaListaMestraAction(
  id: string,
  input: Partial<LinhaListaMestraInput>,
) {
  await requireProfile();
  await atualizarLinhaListaMestra(id, input);
  revalidatePath(EXERCICIOS_PATH);
}

export async function excluirLinhaListaMestraAction(id: string) {
  await requireProfile();
  await excluirLinhaListaMestra(id);
  revalidatePath(EXERCICIOS_PATH);
}

// ---------- Shazam ----------

export async function salvarShazamAction(
  input: Partial<Omit<ExercicioShazam, "candidato_id" | "updated_at">>,
  statusAnterior: ExercicioStatus,
) {
  const profile = await requireProfile();
  await salvarShazam(profile.id, input);
  await pontuarSeConcluido(profile.id, statusAnterior, input.status, "shazam");
  revalidatePath(EXERCICIOS_PATH);
}

// ---------- Autoconhecimento ----------

export async function salvarAutoconhecimentoAction(
  input: Partial<Omit<ExercicioAutoconhecimento, "candidato_id" | "updated_at">>,
  statusAnterior: ExercicioStatus,
) {
  const profile = await requireProfile();
  await salvarAutoconhecimento(profile.id, input);
  await pontuarSeConcluido(
    profile.id,
    statusAnterior,
    input.status,
    "autoconhecimento",
  );
  revalidatePath(EXERCICIOS_PATH);
}

// ---------- PDI ----------

export async function adicionarPdiMetaAction(
  competencia: string,
  prazo: "curto" | "medio" | "longo",
) {
  const profile = await requireProfile();
  await adicionarPdiMeta(profile.id, competencia, prazo);
  revalidatePath(EXERCICIOS_PATH);
}

export async function excluirPdiMetaAction(id: string) {
  await requireProfile();
  await excluirPdiMeta(id);
  revalidatePath(EXERCICIOS_PATH);
}

export async function adicionarPdi5w2hAction(input: Partial<Pdi5w2hInput>) {
  const profile = await requireProfile();
  await adicionarPdi5w2h(profile.id, input);
  revalidatePath(EXERCICIOS_PATH);
}

export async function excluirPdi5w2hAction(id: string) {
  await requireProfile();
  await excluirPdi5w2h(id);
  revalidatePath(EXERCICIOS_PATH);
}

export async function atualizarStatusPdiAction(status: ExercicioStatus) {
  const profile = await requireProfile();
  const statusAnterior = await obterStatusPdi(profile.id);
  await atualizarStatusPdi(profile.id, status);
  await pontuarSeConcluido(profile.id, statusAnterior, status, "pdi");
  revalidatePath(EXERCICIOS_PATH);
}
