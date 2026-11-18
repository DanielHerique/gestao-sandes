import { requireProfile } from "@/lib/auth/session";
import { TreinoEntrevista } from "@/components/ia/treino-entrevista";

export default async function TreinoEntrevistaPage() {
  await requireProfile();
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Ferramenta</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Treino de entrevista</h1>
        <p className="mt-3 text-foreground/60">Responda perguntas reais da sua vaga e receba feedback na hora.</p>
      </header>
      <TreinoEntrevista />
    </div>
  );
}
