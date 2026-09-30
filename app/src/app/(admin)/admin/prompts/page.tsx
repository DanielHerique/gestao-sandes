import { requireAdmin } from "@/lib/auth/session";
import { listarPrompts } from "@/lib/data/prompts";
import { PromptManager } from "@/components/admin/prompt-manager";

export default async function AdminPromptsPage() {
  await requireAdmin();
  const prompts = await listarPrompts();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Biblioteca de prompts de IA</h1>
      <PromptManager prompts={prompts} />
    </div>
  );
}
