"use client";

import { useMemo, useState } from "react";
import type { PromptIA } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { VerMais } from "@/components/ui/ver-mais";

function CopyButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  const fb = useFeedback();

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          fb.sucesso("Prompt copiado", "Cole na sua ferramenta de IA.");
          setTimeout(() => setCopiado(false), 1500);
        } catch {
          fb.erro("Não foi possível copiar", "Selecione o texto e copie manualmente.");
        }
      }}
      className="min-h-10 shrink-0 rounded-xl border px-4 text-xs font-medium hover:bg-brand-soft"
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

      <ul className="grid gap-3">
        <VerMais inicial={8} passo={8}>
        {filtrados.map((prompt) => (
          <li
            key={prompt.id}
            className="rounded-2xl border bg-surface p-5"
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
          </li>
        ))}
        </VerMais>
        {filtrados.length === 0 && (
          <li className="list-none text-sm text-foreground/60">Nenhum prompt encontrado.</li>
        )}
      </ul>
    </div>
  );
}
