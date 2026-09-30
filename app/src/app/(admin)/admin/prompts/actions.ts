"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  criarPrompt,
  excluirPrompt,
  type NovoPromptInput,
} from "@/lib/data/prompts";

export async function criarPromptAction(input: NovoPromptInput) {
  const admin = await requireAdmin();
  await criarPrompt(admin.id, input);
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
}

export async function excluirPromptAction(id: string) {
  await requireAdmin();
  await excluirPrompt(id);
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
}
