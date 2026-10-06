"use client";

import { useRef } from "react";
import { Icon } from "@/components/icons";

export interface DadosCandidatura {
  cargo: string;
  empresa: string;
  segmento_empresa: string;
  data_envio_curriculo: string;
  link_vaga: string;
  linkedin_empresa: string;
  plataforma_envio: string;
  perfis: string[]; // perfis de recrutadores no LinkedIn
  notas_pessoais: string;
}

export const CANDIDATURA_VAZIA: DadosCandidatura = {
  cargo: "",
  empresa: "",
  segmento_empresa: "",
  data_envio_curriculo: "",
  link_vaga: "",
  linkedin_empresa: "",
  plataforma_envio: "",
  perfis: [""],
  notas_pessoais: "",
};

const MAX_PERFIS = 10;

function Campo({
  rotulo,
  obrigatorio,
  children,
  largo,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
  largo?: boolean;
}) {
  return (
    <label className={`block ${largo ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-medium">
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-brand-strong">*</span>}
      </span>
      {children}
    </label>
  );
}

export function CamposCandidatura({
  valor,
  onChange,
}: {
  valor: DadosCandidatura;
  onChange: (v: DadosCandidatura) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = <K extends keyof DadosCandidatura>(k: K, v: DadosCandidatura[K]) =>
    onChange({ ...valor, [k]: v });

  function setPerfil(i: number, v: string) {
    set("perfis", valor.perfis.map((p, idx) => (idx === i ? v : p)));
  }
  function adicionarPerfil() {
    if (valor.perfis.length >= MAX_PERFIS) return;
    onChange({ ...valor, perfis: [...valor.perfis, ""] });
    setTimeout(() => refs.current[valor.perfis.length]?.focus(), 30);
  }
  function removerPerfil(i: number) {
    const resto = valor.perfis.filter((_, idx) => idx !== i);
    set("perfis", resto.length ? resto : [""]);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Campo rotulo="Cargo" obrigatorio>
        <input
          value={valor.cargo}
          onChange={(e) => set("cargo", e.target.value)}
          placeholder="Ex.: Gerente de Produto"
          required
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="Empresa" obrigatorio>
        <input
          value={valor.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          placeholder="Ex.: Nubank"
          required
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="Segmento da empresa">
        <input
          value={valor.segmento_empresa}
          onChange={(e) => set("segmento_empresa", e.target.value)}
          placeholder="Ex.: Fintech"
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="Data de envio do currículo">
        <input
          type="date"
          value={valor.data_envio_curriculo}
          onChange={(e) => set("data_envio_curriculo", e.target.value)}
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="Plataforma de envio">
        <input
          value={valor.plataforma_envio}
          onChange={(e) => set("plataforma_envio", e.target.value)}
          placeholder="LinkedIn, Gupy, site da empresa..."
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="Link da vaga">
        <input
          value={valor.link_vaga}
          onChange={(e) => set("link_vaga", e.target.value)}
          placeholder="https://"
          inputMode="url"
          className="w-full px-3.5 py-2"
        />
      </Campo>
      <Campo rotulo="LinkedIn da empresa" largo>
        <input
          value={valor.linkedin_empresa}
          onChange={(e) => set("linkedin_empresa", e.target.value)}
          placeholder="https://linkedin.com/company/..."
          inputMode="url"
          className="w-full px-3.5 py-2"
        />
      </Campo>

      {/* Perfis de recrutadores: um campo por perfil, com botão para adicionar outro */}
      <div className="sm:col-span-2">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">Perfis de recrutadores no LinkedIn</span>
          <span className="num text-xs text-foreground/50">
            {valor.perfis.filter((p) => p.trim()).length} de {MAX_PERFIS}
          </span>
        </div>
        <ul className="space-y-2">
          {valor.perfis.map((perfil, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-semibold text-brand-strong">
                {i + 1}
              </span>
              <input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={perfil}
                onChange={(e) => setPerfil(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (perfil.trim()) adicionarPerfil();
                  }
                }}
                placeholder="https://linkedin.com/in/nome-do-recrutador"
                inputMode="url"
                aria-label={`Perfil de recrutador ${i + 1}`}
                className="min-w-0 flex-1 px-3.5 py-2"
              />
              {(valor.perfis.length > 1 || perfil) && (
                <button
                  type="button"
                  aria-label={`Remover perfil ${i + 1}`}
                  onClick={() => removerPerfil(i)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground/40 hover:bg-rose-500/10 hover:text-rose-600"
                >
                  <Icon name="lixeira" className="h-[18px] w-[18px]" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {valor.perfis.length < MAX_PERFIS && (
          <button
            type="button"
            onClick={adicionarPerfil}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand/60 text-sm font-medium text-brand-strong transition-colors hover:bg-brand-soft"
          >
            <Icon name="mais" className="h-4 w-4" />
            Adicionar outro perfil
          </button>
        )}
      </div>

      <Campo rotulo="Notas pessoais" largo>
        <textarea
          value={valor.notas_pessoais}
          onChange={(e) => set("notas_pessoais", e.target.value)}
          rows={3}
          placeholder="Próxima ação, data de acompanhamento, impressões..."
          className="w-full px-3.5 py-2"
        />
      </Campo>
    </div>
  );
}
