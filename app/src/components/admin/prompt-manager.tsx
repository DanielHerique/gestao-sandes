"use client";

import { useRef, useState, useTransition } from "react";
import type { PromptIA } from "@/lib/types/database";
import {
  criarPromptAction,
  excluirPromptAction,
} from "@/app/(admin)/admin/prompts/actions";

export function PromptManager({ prompts }: { prompts: PromptIA[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [destaque, setDestaque] = useState(false);
  const [novo, setNovo] = useState(true);

  function handleSubmit(formData: FormData) {
    const titulo = String(formData.get("titulo") ?? "").trim();
    const categoria = String(formData.get("categoria") ?? "").trim();
    const texto_prompt = String(formData.get("texto_prompt") ?? "").trim();
    if (!titulo || !categoria || !texto_prompt) return;

    startTransition(() => {
      criarPromptAction({ titulo, categoria, texto_prompt, destaque, novo });
      formRef.current?.reset();
      setDestaque(false);
      setNovo(true);
    });
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="mb-6 rounded-lg border bg-white p-4 dark:bg-neutral-900"
      >
        <div className="mb-2 grid grid-cols-2 gap-2">
          <input
            name="titulo"
            placeholder="Título"
            required
            className="rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
          />
          <input
            name="categoria"
            placeholder="Categoria (ex: Entrevista, LinkedIn)"
            required
            className="rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
          />
        </div>
        <textarea
          name="texto_prompt"
          placeholder="Texto do prompt"
          required
          rows={4}
          className="mb-2 w-full rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
        />
        <div className="mb-3 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={novo}
              onChange={(e) => setNovo(e.target.checked)}
            />
            Marcar como novo
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={destaque}
              onChange={(e) => setDestaque(e.target.checked)}
            />
            Destaque
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Adicionar prompt
        </button>
      </form>

      <ul className="space-y-2">
        {prompts.map((p) => (
          <li
            key={p.id}
            className="flex items-start justify-between rounded-md border p-3 text-sm dark:border-neutral-800"
          >
            <div>
              <p className="font-medium">
                {p.titulo}{" "}
                <span className="text-xs text-neutral-500">
                  ({p.categoria})
                </span>
              </p>
              <p className="mt-1 text-neutral-500">{p.texto_prompt}</p>
            </div>
            <button
              onClick={() => startTransition(() => excluirPromptAction(p.id))}
              className="shrink-0 text-xs text-rose-600 hover:underline"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
