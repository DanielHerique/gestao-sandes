"use client";

import { useState, useTransition } from "react";
import type { PromptIA } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { Icon } from "@/components/icons";
import { VerMais } from "@/components/ui/ver-mais";
import {
  criarPromptAction,
  excluirPromptAction,
} from "@/app/(admin)/admin/prompts/actions";

export function PromptManager({ prompts }: { prompts: PromptIA[] }) {
  const [pending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [novo, setNovo] = useState(true);
  const fb = useFeedback();

  function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !categoria.trim() || !texto.trim()) return;
    startTransition(async () => {
      try {
        await criarPromptAction({
          titulo: titulo.trim(),
          categoria: categoria.trim(),
          texto_prompt: texto.trim(),
          destaque,
          novo,
        });
        fb.sucesso("Prompt publicado", "Já aparece para os candidatos.");
        setTitulo("");
        setCategoria("");
        setTexto("");
        setDestaque(false);
        setNovo(true);
      } catch {
        fb.erro("Não foi possível publicar o prompt");
      }
    });
  }

  async function excluir(p: PromptIA) {
    const ok = await fb.confirmar({
      titulo: "Excluir prompt",
      descricao: `"${p.titulo}" sai da biblioteca de todos os candidatos. Essa ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir prompt",
      digitar: true,
      perigo: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await excluirPromptAction(p.id);
        fb.sucesso("Prompt excluído");
      } catch {
        fb.erro("Não foi possível excluir o prompt");
      }
    });
  }

  return (
    <div>
      <form onSubmit={criar} className="mb-8 rounded-2xl border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground/60">Novo prompt</h2>
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            aria-label="Título"
            required
            className="px-3.5 py-2"
          />
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoria (ex: Entrevista, LinkedIn)"
            aria-label="Categoria"
            required
            className="px-3.5 py-2"
          />
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Texto do prompt"
          aria-label="Texto do prompt"
          required
          rows={4}
          className="mb-3 w-full px-3.5 py-2"
        />
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={novo} onChange={(e) => setNovo(e.target.checked)} />
            Marcar como novo
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
            Destaque
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full rounded-xl bg-brand px-6 text-sm text-brand-fg disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Publicando..." : "Publicar prompt"}
        </button>
      </form>

      <ul className="space-y-2.5">
        <VerMais inicial={8} passo={8}>
          {prompts.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-3 rounded-2xl border bg-surface p-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  {p.titulo}{" "}
                  <span className="text-xs font-normal text-foreground/55">({p.categoria})</span>
                </p>
                <p className="mt-1 line-clamp-3 text-foreground/60">{p.texto_prompt}</p>
              </div>
              <button
                type="button"
                onClick={() => excluir(p)}
                aria-label={`Excluir ${p.titulo}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground/40 hover:bg-rose-500/10 hover:text-rose-600"
              >
                <Icon name="lixeira" className="h-[18px] w-[18px]" />
              </button>
            </li>
          ))}
        </VerMais>
      </ul>
    </div>
  );
}
