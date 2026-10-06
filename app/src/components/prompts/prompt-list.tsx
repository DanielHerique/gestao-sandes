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
      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-brand-soft"
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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full px-3 py-2 sm:max-w-xs"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-3 py-2 sm:w-auto"
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
            className="rounded-lg border bg-surface p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {prompt.titulo}
                  {prompt.novo && (
                    <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-strong">
                      Novo
                    </span>
                  )}
                  {prompt.destaque && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Destaque
                    </span>
                  )}
                </p>
                <p className="text-xs text-foreground/60">{prompt.categoria}</p>
              </div>
              <CopyButton texto={prompt.texto_prompt} />
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground/70">
              {prompt.texto_prompt}
            </p>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-sm text-foreground/60">Nenhum prompt encontrado.</p>
        )}
      </div>
    </div>
  );
}
