"use client";

import { useState, useTransition } from "react";
import { PLANO_LABELS, type PlanoNome } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { atribuirPlanoAction } from "@/app/(admin)/admin/candidatos/actions";

export function AtribuirPlano({
  candidatoId,
  planoAtual,
}: {
  candidatoId: string;
  planoAtual: PlanoNome | null;
}) {
  const [plano, setPlano] = useState<PlanoNome | "">(planoAtual ?? "");
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  async function trocar(novo: PlanoNome) {
    if (novo === plano) return;
    const troca = plano !== "";
    const ok = await fb.confirmar({
      titulo: troca ? "Trocar o plano contratado" : "Atribuir plano",
      descricao: troca
        ? `Os módulos liberados para este candidato vão mudar de "${PLANO_LABELS[plano as PlanoNome]}" para "${PLANO_LABELS[novo]}".`
        : `O candidato passa a ter acesso aos módulos do plano "${PLANO_LABELS[novo]}".`,
      rotuloConfirmar: troca ? "Trocar plano" : "Atribuir plano",
      digitar: troca,
    });
    if (!ok) return;

    const anterior = plano;
    setPlano(novo);
    startTransition(async () => {
      try {
        await atribuirPlanoAction(candidatoId, novo);
        fb.sucesso("Plano atualizado", PLANO_LABELS[novo]);
      } catch {
        setPlano(anterior);
        fb.erro("Não foi possível atualizar o plano");
      }
    });
  }

  return (
    <select
      value={plano}
      disabled={pending}
      aria-label="Plano contratado"
      onChange={(e) => trocar(e.target.value as PlanoNome)}
      className="w-full px-3 py-1.5"
    >
      <option value="" disabled>
        Selecionar plano
      </option>
      {Object.entries(PLANO_LABELS).map(([valor, label]) => (
        <option key={valor} value={valor}>
          {label}
        </option>
      ))}
    </select>
  );
}
