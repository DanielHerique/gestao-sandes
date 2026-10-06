"use client";

import { useState, useTransition } from "react";
import type { AnotacaoAdmin } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { criarAnotacaoAction } from "@/app/(admin)/admin/candidatos/actions";
import { VerMais } from "@/components/ui/ver-mais";

export function Anotacoes({
  candidatoId,
  anotacoes,
}: {
  candidatoId: string;
  anotacoes: AnotacaoAdmin[];
}) {
  const [pending, startTransition] = useTransition();
  const [texto, setTexto] = useState("");
  const fb = useFeedback();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor) return;
    startTransition(async () => {
      try {
        await criarAnotacaoAction(candidatoId, valor);
        setTexto("");
        fb.sucesso("Anotação adicionada", "Visível apenas para você.");
      } catch {
        fb.erro("Não foi possível salvar a anotação");
      }
    });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-foreground/55">
        Visível apenas para você. Não aparece para o candidato.
      </p>
      <form onSubmit={enviar} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Adicionar anotação..."
          aria-label="Nova anotação"
          className="min-w-0 flex-1 px-3.5 py-2"
        />
        <button
          type="submit"
          disabled={pending || !texto.trim()}
          className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Adicionar"}
        </button>
      </form>
      <ul className="space-y-2">
        <VerMais inicial={4} passo={6}>
          {anotacoes.map((a) => (
            <li key={a.id} className="rounded-xl border bg-surface p-3.5 text-sm">
              <p>{a.texto}</p>
              <p className="mt-1.5 text-xs text-foreground/50">
                {new Date(a.created_at).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </VerMais>
        {anotacoes.length === 0 && (
          <li className="list-none text-sm text-foreground/55">Nenhuma anotação ainda.</li>
        )}
      </ul>
    </div>
  );
}
