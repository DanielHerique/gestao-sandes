import { listarPrompts } from "@/lib/data/prompts";
import { PromptList } from "@/components/prompts/prompt-list";

export default async function PromptsPage() {
  const prompts = await listarPrompts();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Biblioteca de prompts de IA</h1>
      <p className="mb-4 text-sm text-foreground/60">
        Prompts prontos, curados pela consultoria, para você usar em
        ferramentas de IA como ChatGPT ou Claude.
      </p>
      <PromptList prompts={prompts} />
    </div>
  );
}
