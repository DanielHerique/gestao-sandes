"use client";

import { useRef, useState, useTransition } from "react";
import { criarCandidaturaAction } from "@/app/(candidato)/candidaturas/actions";

export function NovaCandidaturaForm() {
  const [aberto, setAberto] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const cargo = String(formData.get("cargo") ?? "").trim();
    const empresa = String(formData.get("empresa") ?? "").trim();
    if (!cargo || !empresa) return;

    startTransition(async () => {
      await criarCandidaturaAction({
        cargo,
        empresa,
        segmento_empresa: String(formData.get("segmento_empresa") ?? "") || undefined,
        data_envio_curriculo:
          String(formData.get("data_envio_curriculo") ?? "") || undefined,
        link_vaga: String(formData.get("link_vaga") ?? "") || undefined,
        linkedin_empresa: String(formData.get("linkedin_empresa") ?? "") || undefined,
        plataforma_envio: String(formData.get("plataforma_envio") ?? "") || undefined,
        perfil_recrutador_linkedin:
          String(formData.get("perfil_recrutador_linkedin") ?? "") || undefined,
        notas_pessoais: String(formData.get("notas_pessoais") ?? "") || undefined,
      });
      formRef.current?.reset();
      setAberto(false);
    });
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="min-h-11 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover"
      >
        + Nova candidatura
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg border bg-surface p-4"
    >
      <input
        name="cargo"
        placeholder="Cargo *"
        required
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="empresa"
        placeholder="Empresa *"
        required
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="segmento_empresa"
        placeholder="Segmento da empresa"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="data_envio_curriculo"
        type="date"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="link_vaga"
        placeholder="Link da vaga"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="linkedin_empresa"
        placeholder="LinkedIn da empresa"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="plataforma_envio"
        placeholder="Plataforma de envio (LinkedIn, Gupy...)"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <input
        name="perfil_recrutador_linkedin"
        placeholder="Perfil do recrutador (LinkedIn)"
        className="col-span-1 min-h-11 rounded-lg border px-3 py-2 text-base sm:text-sm"
      />
      <textarea
        name="notas_pessoais"
        placeholder="Notas pessoais"
        className="col-span-full rounded border px-3 py-2 text-sm"
        rows={2}
      />
      <div className="col-span-full flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="min-h-11 rounded-lg border px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
