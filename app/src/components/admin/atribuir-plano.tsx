"use client";

import { useTransition } from "react";
import { PLANO_LABELS, type PlanoNome } from "@/lib/types/database";
import { atribuirPlanoAction } from "@/app/(admin)/admin/candidatos/actions";

export function AtribuirPlano({
  candidatoId,
  planoAtual,
}: {
  candidatoId: string;
  planoAtual: PlanoNome | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={planoAtual ?? ""}
        disabled={pending}
        onChange={(e) =>
          startTransition(() =>
            atribuirPlanoAction(candidatoId, e.target.value as PlanoNome),
          )
        }
        className="rounded border px-3 py-1.5 text-sm"
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
      {pending && <span className="text-xs text-foreground/60">Salvando...</span>}
    </div>
  );
}
