"use client";

import { useRef, useState, useTransition } from "react";
import type { Documento, DocumentoStatus } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import {
  confirmarUploadAssinaturaAction,
  obterUrlUploadAssinaturaAction,
  obterUrlVisualizacaoAction,
} from "@/app/(candidato)/documentos/actions";

const STATUS_LABEL: Record<DocumentoStatus, string> = {
  liberado: "Liberado",
  nao_liberado: "Não liberado",
  pendente_assinatura: "Pendente de assinatura",
  assinado: "Assinado",
  vencido: "Vencido",
};

const STATUS_COLOR: Record<DocumentoStatus, string> = {
  liberado: "bg-brand-soft text-brand-strong",
  nao_liberado: "bg-line text-foreground/60",
  pendente_assinatura:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  assinado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  vencido: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export function DocumentoCard({ documento }: { documento: Documento }) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fb = useFeedback();

  async function handleVisualizar() {
    // Abre a aba antes do await, senão o navegador bloqueia o pop-up
    const aba = window.open("", "_blank");
    const url = await obterUrlVisualizacaoAction(documento.storage_path).catch(() => null);
    if (url && aba) {
      aba.location.href = url;
    } else {
      aba?.close();
      fb.erro("Não foi possível abrir o documento", "Tente novamente em instantes.");
    }
  }

  async function handleUploadAssinado(file: File) {
    if (file.type !== "application/pdf") {
      fb.erro("Envie o documento assinado em PDF");
      return;
    }
    const ok = await fb.confirmar({
      titulo: "Enviar documento assinado",
      descricao: `"${documento.titulo}" será enviado para a consultoria e marcado como assinado.`,
      rotuloConfirmar: "Enviar assinado",
    });
    if (!ok) return;

    setUploading(true);
    try {
      const dadosUpload = await obterUrlUploadAssinaturaAction(documento.id);
      if (!dadosUpload) throw new Error("sem url");

      const resposta = await fetch(dadosUpload.signedUrl, { method: "PUT", body: file });
      if (!resposta.ok) throw new Error("upload");

      startTransition(async () => {
        try {
          await confirmarUploadAssinaturaAction(documento.id, dadosUpload.path);
          fb.sucesso("Documento enviado", "A consultoria já pode ver a versão assinada.");
        } catch {
          fb.erro("O arquivo subiu, mas não foi possível registrar a assinatura");
        }
      });
    } catch {
      fb.erro("Não foi possível enviar o documento", "Tente novamente em instantes.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border bg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{documento.titulo}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[documento.status]}`}
          >
            {STATUS_LABEL[documento.status]}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {documento.status !== "nao_liberado" && (
            <button
              onClick={handleVisualizar}
              className="min-h-10 rounded-xl border px-4 text-sm hover:bg-brand-soft"
            >
              Ver / baixar
            </button>
          )}
          {documento.requer_assinatura &&
            (documento.status === "liberado" ||
              documento.status === "pendente_assinatura") && (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAssinado(file);
                  }}
                />
                <button
                  disabled={uploading || pending}
                  onClick={() => inputRef.current?.click()}
                  className="min-h-10 rounded-xl bg-brand px-4 text-sm text-brand-fg disabled:opacity-50"
                >
                  {uploading ? "Enviando..." : "Enviar assinado"}
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
