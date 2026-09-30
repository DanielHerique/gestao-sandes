"use client";

import { useRef, useState, useTransition } from "react";
import { enviarCurriculoParaAnaliseAction } from "@/app/(candidato)/curriculo/actions";

export function UploadForm({ restante }: { restante: number }) {
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const resultado = await enviarCurriculoParaAnaliseAction(formData);
      setMensagem(resultado.mensagem);
      if (resultado.ok) formRef.current?.reset();
    });
  }

  if (restante <= 0) {
    return (
      <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
        Você já usou todas as suas análises de currículo disponíveis.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
    >
      <label className="mb-1 block text-sm font-medium">
        Arquivo do currículo (PDF ou DOCX)
      </label>
      <input
        type="file"
        name="curriculo"
        accept=".pdf,.docx"
        required
        className="mb-3 block w-full text-sm"
      />
      <label className="mb-1 block text-sm font-medium">
        Comparar com uma vaga específica (opcional)
      </label>
      <textarea
        name="vaga_comparada"
        rows={3}
        placeholder="Cole a descrição da vaga aqui..."
        className="mb-3 w-full rounded border px-2 py-1.5 text-sm dark:bg-neutral-950"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Analisando..." : `Enviar para análise (${restante} restantes)`}
      </button>
      {mensagem && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {mensagem}
        </p>
      )}
    </form>
  );
}
