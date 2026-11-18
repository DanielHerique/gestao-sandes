import { requireProfile } from "@/lib/auth/session";
import { RaioXForm } from "@/components/ia/raio-x-form";

export default async function RaioXPage() {
  await requireProfile();
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Ferramenta</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Raio-x da vaga</h1>
        <p className="mt-3 text-foreground/60">Entenda o que a vaga pede e como adaptar seu currículo antes de se candidatar.</p>
      </header>
      <RaioXForm />
    </div>
  );
}
