"use client";

import { useState, useTransition } from "react";
import type { DocumentoTemplate } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { VerMais } from "@/components/ui/ver-mais";
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
  const [formKey, setFormKey] = useState(0);
  const [selecionados, setSelecionados] = useState<Record<string, string[]>>({});
  const [busca, setBusca] = useState("");
  const fb = useFeedback();

  function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await criarTemplateAction(dados);
      if (r.ok) {
        fb.sucesso("Template criado", "Já pode ser enviado aos candidatos.");
        setFormKey((k) => k + 1);
      } else {
        fb.erro("Não foi possível criar o template", r.mensagem);
      }
    });
  }

  function alternar(templateId: string, candidatoId: string) {
    setSelecionados((prev) => {
      const atual = prev[templateId] ?? [];
      return {
        ...prev,
        [templateId]: atual.includes(candidatoId)
          ? atual.filter((id) => id !== candidatoId)
          : [...atual, candidatoId],
      };
    });
  }

  async function enviar(t: DocumentoTemplate) {
    const ids = selecionados[t.id] ?? [];
    if (!ids.length) return;
    const ok = await fb.confirmar({
      titulo: "Liberar documento",
      descricao: `"${t.titulo}" será liberado para ${ids.length} ${ids.length === 1 ? "candidato" : "candidatos"}${
        t.requer_assinatura ? " e ficará pendente de assinatura" : ""
      }. Cada um recebe um aviso na central de notificações.`,
      rotuloConfirmar: "Liberar documento",
      digitar: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        const r = await enviarTemplateEmLoteAction(t.id, ids);
        fb.sucesso(
          "Documento liberado",
          `Enviado para ${r.enviados} ${r.enviados === 1 ? "candidato" : "candidatos"}.`,
        );
        setSelecionados((prev) => ({ ...prev, [t.id]: [] }));
      } catch {
        fb.erro("Não foi possível liberar o documento", "Nada foi enviado. Tente novamente.");
      }
    });
  }

  const filtrados = candidatos.filter((c) => c.nome.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div>
      <form key={formKey} onSubmit={criar} className="mb-8 rounded-2xl border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground/60">Novo template</h2>
        <input name="titulo" placeholder="Título (ex: Contrato padrão)" aria-label="Título" required className="mb-3 w-full px-3.5 py-2" />
        <textarea name="descricao" placeholder="Descrição (opcional)" aria-label="Descrição" rows={2} className="mb-3 w-full px-3.5 py-2" />
        <input type="file" name="arquivo" accept="application/pdf,.pdf" aria-label="Arquivo PDF" required className="mb-3 block w-full text-sm" />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="requer_assinatura" />
          Requer assinatura
        </label>
        <button type="submit" disabled={pending} className="min-h-11 w-full rounded-xl bg-brand px-6 text-sm text-brand-fg disabled:opacity-50 sm:w-auto">
          {pending ? "Criando..." : "Criar template"}
        </button>
      </form>

      <h2 className="mb-3 text-sm font-semibold text-foreground/60">Templates existentes</h2>
      <ul className="space-y-3">
        <VerMais inicial={8} passo={8}>
          {templates.map((t) => {
            const marcados = selecionados[t.id] ?? [];
            return (
              <li key={t.id} className="rounded-2xl border bg-surface p-5">
                <p className="font-medium">
                  {t.titulo}{" "}
                  {t.requer_assinatura && (
                    <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-normal text-brand-strong">
                      requer assinatura
                    </span>
                  )}
                </p>
                {t.descricao && <p className="mt-1 text-sm text-foreground/60">{t.descricao}</p>}

                <details className="mt-3">
                  <summary className="cursor-pointer py-1 text-sm font-medium text-brand-strong">
                    Enviar para candidatos
                  </summary>
                  <div className="mt-3">
                    {candidatos.length > 6 && (
                      <input
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar candidato"
                        aria-label="Buscar candidato"
                        className="mb-2 w-full px-3.5 py-2"
                      />
                    )}
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border bg-background p-2">
                      {filtrados.map((c) => (
                        <label key={c.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-brand-soft">
                          <input type="checkbox" checked={marcados.includes(c.id)} onChange={() => alternar(t.id, c.id)} />
                          <span className="min-w-0 truncate">{c.nome}</span>
                        </label>
                      ))}
                      {filtrados.length === 0 && <p className="px-2 py-1.5 text-sm text-foreground/55">Nenhum candidato encontrado.</p>}
                    </div>
                    <button
                      type="button"
                      disabled={pending || !marcados.length}
                      onClick={() => enviar(t)}
                      className="mt-3 min-h-11 w-full rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50 sm:w-auto"
                    >
                      Liberar para {marcados.length || ""} selecionado{marcados.length === 1 ? "" : "s"}
                    </button>
                  </div>
                </details>
              </li>
            );
          })}
        </VerMais>
        {templates.length === 0 && <li className="list-none text-sm text-foreground/55">Nenhum template ainda.</li>}
      </ul>
    </div>
  );
}
