"use client";

import { useRef, useState, useTransition } from "react";
import type { DocumentoTemplate } from "@/lib/types/database";
import {
  criarTemplateAction,
  enviarTemplateEmLoteAction,
} from "@/app/(admin)/admin/documentos/actions";

export function TemplateManager({
  templates,
  candidatos,
}: {
  templates: DocumentoTemplate[];
  candidatos: { id: string; nome: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<Record<string, string[]>>(
    {},
  );

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const resultado = await criarTemplateAction(formData);
      setMensagem(resultado.mensagem);
      if (resultado.ok) formRef.current?.reset();
    });
  }

  function toggleCandidato(templateId: string, candidatoId: string) {
    setSelecionados((prev) => {
      const atual = prev[templateId] ?? [];
      const novo = atual.includes(candidatoId)
        ? atual.filter((id) => id !== candidatoId)
        : [...atual, candidatoId];
      return { ...prev, [templateId]: novo };
    });
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="mb-6 rounded-lg border bg-white p-4 dark:bg-neutral-900"
      >
        <h2 className="mb-3 text-sm font-semibold">Novo template</h2>
        <input
          name="titulo"
          placeholder="Título (ex: Contrato padrão)"
          required
          className="mb-2 w-full rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
        />
        <textarea
          name="descricao"
          placeholder="Descrição (opcional)"
          rows={2}
          className="mb-2 w-full rounded border px-3 py-1.5 text-sm dark:bg-neutral-950"
        />
        <input
          type="file"
          name="arquivo"
          required
          className="mb-2 block w-full text-sm"
        />
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="requer_assinatura" />
          Requer assinatura
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Criar template
        </button>
        {mensagem && (
          <p className="mt-2 text-sm text-neutral-500">{mensagem}</p>
        )}
      </form>

      <h2 className="mb-3 text-sm font-semibold text-neutral-500">
        Templates existentes
      </h2>
      <ul className="space-y-3">
        {templates.map((t) => (
          <li
            key={t.id}
            className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
          >
            <p className="font-medium">
              {t.titulo}{" "}
              {t.requer_assinatura && (
                <span className="text-xs text-neutral-500">
                  (requer assinatura)
                </span>
              )}
            </p>
            {t.descricao && (
              <p className="text-sm text-neutral-500">{t.descricao}</p>
            )}

            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-blue-600">
                Enviar para candidatos
              </summary>
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {candidatos.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(selecionados[t.id] ?? []).includes(c.id)}
                      onChange={() => toggleCandidato(t.id, c.id)}
                    />
                    {c.nome}
                  </label>
                ))}
              </div>
              <button
                disabled={pending || !(selecionados[t.id] ?? []).length}
                onClick={() =>
                  startTransition(() =>
                    enviarTemplateEmLoteAction(t.id, selecionados[t.id] ?? []),
                  )
                }
                className="mt-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Liberar para selecionados
              </button>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
