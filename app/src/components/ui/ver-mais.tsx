"use client";

import { Children, useState } from "react";

// Mostra os primeiros itens e libera o resto sob demanda.
export function VerMais({
  children,
  inicial = 6,
  passo = 10,
  rotulo = "Mostrar mais",
}: {
  children: React.ReactNode;
  inicial?: number;
  passo?: number;
  rotulo?: string;
}) {
  const itens = Children.toArray(children);
  const [visiveis, setVisiveis] = useState(inicial);
  return (
    <>
      {itens.slice(0, visiveis)}
      {itens.length > visiveis && (
        <li className="list-none pt-1">
          <button
            type="button"
            onClick={() => setVisiveis((v) => v + passo)}
            className="min-h-10 w-full rounded-xl border border-dashed text-sm text-foreground/65 hover:bg-brand-soft"
          >
            {rotulo} ({itens.length - visiveis} restantes)
          </button>
        </li>
      )}
    </>
  );
}
