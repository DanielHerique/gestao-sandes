"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useFeedback } from "@/components/ui/feedback";
import {
  atualizarCandidaturaAction,
  excluirCandidaturaAction,
} from "@/app/(candidato)/candidaturas/actions";
import { juntarPerfisRecrutadores, lerPerfisRecrutadores } from "@/lib/candidaturas-util";
import type { CandidaturaComChecklist } from "@/lib/data/candidaturas";
import {
  CANDIDATURA_STATUS_LABELS,
  CHECKLIST_ITEM_LABELS,
} from "@/lib/types/database";
import { CamposCandidatura, type DadosCandidatura } from "./campos-candidatura";

export function paraDados(c: CandidaturaComChecklist): DadosCandidatura {
  const perfis = lerPerfisRecrutadores(c.perfil_recrutador_linkedin);
  return {
    cargo: c.cargo,
    empresa: c.empresa,
    segmento_empresa: c.segmento_empresa ?? "",
    data_envio_curriculo: c.data_envio_curriculo ?? "",
    link_vaga: c.link_vaga ?? "",
    linkedin_empresa: c.linkedin_empresa ?? "",
    plataforma_envio: c.plataforma_envio ?? "",
    perfis: perfis.length ? perfis : [""],
    notas_pessoais: c.notas_pessoais ?? "",
  };
}

export function DetalheCandidatura({
  candidatura,
  onFechar,
  onAtualizada,
  onExcluida,
}: {
  candidatura: CandidaturaComChecklist | null;
  onFechar: () => void;
  onAtualizada: (id: string, campos: Partial<CandidaturaComChecklist>) => void;
  onExcluida: (id: string) => void;
}) {
  const [dados, setDados] = useState<DadosCandidatura | null>(null);
  const [idAberto, setIdAberto] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  // Reinicia o formulário ao abrir outra candidatura (padrão sem useEffect)
  if (candidatura && candidatura.id !== idAberto) {
    setIdAberto(candidatura.id);
    setDados(paraDados(candidatura));
  }
  if (!candidatura && idAberto) {
    setIdAberto(null);
    setDados(null);
  }

  if (!candidatura || !dados) return null;
  const c = candidatura;
  const checklist = c.checklist;
  const itens = Object.keys(CHECKLIST_ITEM_LABELS) as (keyof typeof CHECKLIST_ITEM_LABELS)[];
  const concluidos = checklist ? itens.filter((i) => checklist[i]).length : 0;

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!dados || !dados.cargo.trim() || !dados.empresa.trim()) return;
    const campos = {
      cargo: dados.cargo.trim(),
      empresa: dados.empresa.trim(),
      segmento_empresa: dados.segmento_empresa.trim() || null,
      data_envio_curriculo: dados.data_envio_curriculo || null,
      link_vaga: dados.link_vaga.trim() || null,
      linkedin_empresa: dados.linkedin_empresa.trim() || null,
      plataforma_envio: dados.plataforma_envio.trim() || null,
      perfil_recrutador_linkedin: juntarPerfisRecrutadores(dados.perfis) ?? null,
      notas_pessoais: dados.notas_pessoais.trim() || null,
    };
    startTransition(async () => {
      try {
        await atualizarCandidaturaAction(c.id, campos);
        onAtualizada(c.id, campos);
        fb.sucesso("Candidatura atualizada", `${campos.cargo} · ${campos.empresa}`);
        onFechar();
      } catch {
        fb.erro("Não foi possível salvar", "Tente novamente em instantes.");
      }
    });
  }

  async function excluir() {
    const ok = await fb.confirmar({
      titulo: "Excluir candidatura",
      descricao: `"${c.cargo} · ${c.empresa}" será removida com o checklist. Essa ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir candidatura",
      digitar: true,
      perigo: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await excluirCandidaturaAction(c.id);
        onExcluida(c.id);
        fb.sucesso("Candidatura excluída");
        onFechar();
      } catch {
        fb.erro("Não foi possível excluir", "Tente novamente em instantes.");
      }
    });
  }

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={c.cargo}
      subtitulo={`${c.empresa} · ${CANDIDATURA_STATUS_LABELS[c.status]}`}
      rodape={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={excluir}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm text-rose-600 hover:bg-rose-500/10"
          >
            <Icon name="lixeira" className="h-4 w-4" />
            Excluir
          </button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={onFechar} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">
              Fechar
            </button>
            <button
              type="submit"
              form="form-detalhe-candidatura"
              disabled={pending || !dados.cargo.trim() || !dados.empresa.trim()}
              className="min-h-11 rounded-xl bg-brand px-6 text-sm text-brand-fg disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-background p-3">
          <p className="eyebrow !text-foreground/50">Checklist</p>
          <p className="num mt-1 font-display text-2xl font-semibold">{concluidos}/{itens.length}</p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="eyebrow !text-foreground/50">Registrada em</p>
          <p className="mt-1 font-medium">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {c.link_vaga && /^https?:\/\//i.test(c.link_vaga) && (
        <a
          href={c.link_vaga}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline"
        >
          Abrir vaga <Icon name="seta" className="h-3.5 w-3.5" />
        </a>
      )}

      <form id="form-detalhe-candidatura" onSubmit={salvar}>
        <CamposCandidatura valor={dados} onChange={setDados} />
      </form>
    </Modal>
  );
}
