"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useFeedback } from "@/components/ui/feedback";
import { criarCandidaturaAction } from "@/app/(candidato)/candidaturas/actions";
import { juntarPerfisRecrutadores } from "@/lib/candidaturas-util";
import {
  CANDIDATURA_VAZIA,
  CamposCandidatura,
  type DadosCandidatura,
} from "./campos-candidatura";

export function NovaCandidaturaForm() {
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState<DadosCandidatura>(CANDIDATURA_VAZIA);
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  function fechar() {
    setAberto(false);
    setDados(CANDIDATURA_VAZIA);
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!dados.cargo.trim() || !dados.empresa.trim()) return;
    startTransition(async () => {
      try {
        const r = await criarCandidaturaAction({
          cargo: dados.cargo.trim(),
          empresa: dados.empresa.trim(),
          segmento_empresa: dados.segmento_empresa.trim() || undefined,
          data_envio_curriculo: dados.data_envio_curriculo || undefined,
          link_vaga: dados.link_vaga.trim() || undefined,
          linkedin_empresa: dados.linkedin_empresa.trim() || undefined,
          plataforma_envio: dados.plataforma_envio.trim() || undefined,
          perfil_recrutador_linkedin: juntarPerfisRecrutadores(dados.perfis),
          notas_pessoais: dados.notas_pessoais.trim() || undefined,
        });
        fb.sucesso(
          "Candidatura registrada",
          r.pontos > 0 ? `+${r.pontos} pontos` : `${dados.cargo.trim()} · ${dados.empresa.trim()}`,
        );
        fechar();
      } catch {
        fb.erro("Não foi possível salvar", "Tente novamente em instantes.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm text-brand-fg"
      >
        <Icon name="mais" className="h-4 w-4" />
        Nova candidatura
      </button>

      <Modal
        aberto={aberto}
        onFechar={fechar}
        titulo="Nova candidatura"
        subtitulo="Só cargo e empresa são obrigatórios. O resto você pode completar depois."
        rodape={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={fechar} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">
              Cancelar
            </button>
            <button
              type="submit"
              form="form-nova-candidatura"
              disabled={pending || !dados.cargo.trim() || !dados.empresa.trim()}
              className="min-h-11 rounded-xl bg-brand px-6 text-sm text-brand-fg disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar candidatura"}
            </button>
          </div>
        }
      >
        <form id="form-nova-candidatura" onSubmit={salvar}>
          <CamposCandidatura valor={dados} onChange={setDados} />
        </form>
      </Modal>
    </>
  );
}
