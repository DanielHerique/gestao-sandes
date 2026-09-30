"use client";

import { useMemo, useState } from "react";
import type { PromptIA } from "@/lib/types/database";

function CopyButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {copiado ? "Copiado!" : "Copiar"}
    </button>
  );
}

export function PromptList({ prompts }: { prompts: PromptIA[] }) {
  const [filtro, setFiltro] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");

  const categorias = useMemo(
    () => ["todas", ...new Set(prompts.map((p) => p.categoria))],
    [prompts],
  );

  const filtrados = prompts.filter((p) => {
    const matchCategoria = categoria === "todas" || p.categoria === categoria;
    const matchBusca =
      !filtro || p.titulo.toLowerCase().includes(filtro.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por título..."
          className="rounded border px-3 py-2 text-sm dark:bg-neutral-950"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded border px-3 py-2 text-sm dark:bg-neutral-950"
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === "todas" ? "Todas as categorias" : c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {filtrados.map((prompt) => (
          <div
            key={prompt.id}
            className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {prompt.titulo}
                  {prompt.novo && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Novo
                    </span>
                  )}
                  {prompt.destaque && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Destaque
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">{prompt.categoria}</p>
              </div>
              <CopyButton texto={prompt.texto_prompt} />
            </div>
            <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
              {prompt.texto_prompt}
            </p>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhum prompt encontrado.</p>
        )}
      </div>
    </div>
  );
}
