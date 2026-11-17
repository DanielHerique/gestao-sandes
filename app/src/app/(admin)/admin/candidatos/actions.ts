"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { atribuirPlano } from "@/lib/data/planos";
import { criarAnotacao } from "@/lib/data/anotacoes";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanoNome } from "@/lib/types/database";

function gerarSenhaProvisoria() {
  const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => letras[b % letras.length]).join("");
}

export type ResultadoNovoMentorado =
  | { ok: true; email: string; senha: string }
  | { ok: false; erro: string };

/** A mentora cadastra o mentorado: conta zerada, plano escolhido e senha provisória. */
export async function criarMentoradoAction(input: {
  nome: string;
  email: string;
  plano: PlanoNome;
}): Promise<ResultadoNovoMentorado> {
  const admin = await requireAdmin();
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  if (!nome) return { ok: false, erro: "Informe o nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, erro: "Informe um e-mail válido." };

  const senha = gerarSenhaProvisoria();
  const db = createAdminClient();
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, role: "candidato" },
  });
  if (error || !data.user) {
    const jaExiste = error?.message.toLowerCase().includes("already");
    return { ok: false, erro: jaExiste ? "Já existe uma conta com esse e-mail." : "Não foi possível criar a conta." };
  }

  // O gatilho do banco cria o perfil. Daqui em diante a conta nasce zerada: sem pontos e sem candidaturas.
  try {
    await atribuirPlano(data.user.id, input.plano, admin.id);
  } catch {
    await db.auth.admin.deleteUser(data.user.id);
    return { ok: false, erro: "Não foi possível registrar o plano. Tente de novo." };
  }

  revalidatePath("/admin/candidatos");
  revalidatePath("/admin");
  return { ok: true, email, senha };
}

export async function atribuirPlanoAction(
  candidatoId: string,
  plano: PlanoNome,
) {
  const admin = await requireAdmin();
  await atribuirPlano(candidatoId, plano, admin.id);
  revalidatePath(`/admin/candidatos/${candidatoId}`);
}

export async function criarAnotacaoAction(candidatoId: string, texto: string) {
  const admin = await requireAdmin();
  if (!texto.trim()) return;
  await criarAnotacao(candidatoId, admin.id, texto.trim());
  revalidatePath(`/admin/candidatos/${candidatoId}`);
}
