"use client";

import { useRef, useTransition } from "react";
import type { AnotacaoAdmin } from "@/lib/types/database";
import { criarAnotacaoAction } from "@/app/(admin)/admin/candidatos/actions";

export function Anotacoes({
  candidatoId,
  anotacoes,
}: {
  candidatoId: string;
  anotacoes: AnotacaoAdmin[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const texto = String(formData.get("texto") ?? "");
    startTransition(() => {
      criarAnotacaoAction(candidatoId, texto);
      formRef.current?.reset();
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs text-neutral-400">
        Visível apenas para você — não aparece para o candidato.
      </p>
      <form ref={formRef} action={handleSubmit} className="mb-3 flex gap-2">
        <input
          name="texto"
          placeholder="Adicionar anotação..."
          className="flex-1 rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
      <ul className="space-y-2">
        {anotacoes.map((a) => (
          <li
            key={a.id}
            className="rounded-md border p-2 text-sm dark:border-neutral-800"
          >
            <p>{a.texto}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {new Date(a.created_at).toLocaleString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
