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
      <p className="rounded-lg border border-brand bg-brand-soft p-3 text-sm">
        Você já usou todas as suas análises de currículo disponíveis.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-lg border bg-surface p-4"
    >
      <label className="mb-1 block text-sm font-medium">
        Arquivo do currículo (PDF, até 10 MB)
      </label>
      <input
        type="file"
        name="curriculo"
        accept="application/pdf,.pdf"
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
        className="mb-3 w-full px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-lg bg-brand px-4 py-2 text-sm sm:w-auto font-medium text-brand-fg hover:bg-brand-hover disabled:opacity-50"
      >
        {pending ? "Analisando..." : `Enviar para análise (${restante} restantes)`}
      </button>
      {mensagem && (
        <p className="mt-3 text-sm text-foreground/70">
          {mensagem}
        </p>
      )}
    </form>
  );
}
