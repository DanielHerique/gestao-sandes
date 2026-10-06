import { requireProfile } from "@/lib/auth/session";
import { listarCandidaturas } from "@/lib/data/candidaturas";
import { KanbanCandidaturas } from "@/components/candidaturas/kanban";
import { NovaCandidaturaForm } from "@/components/candidaturas/nova-candidatura-form";

export default async function CandidaturasPage() {
  const profile = await requireProfile();
  const candidaturas = await listarCandidaturas(profile.id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Minhas candidaturas</h1>
        <NovaCandidaturaForm />
      </div>
      <KanbanCandidaturas candidaturasIniciais={candidaturas} />
    </div>
  );
}
