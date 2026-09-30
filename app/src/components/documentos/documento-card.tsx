"use client";

import { useRef, useState, useTransition } from "react";
import type { Documento, DocumentoStatus } from "@/lib/types/database";
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
  liberado: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  nao_liberado: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800",
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

  async function handleVisualizar() {
    const url = await obterUrlVisualizacaoAction(documento.storage_path);
    if (url) window.open(url, "_blank");
  }

  async function handleUploadAssinado(file: File) {
    setUploading(true);
    try {
      const dadosUpload = await obterUrlUploadAssinaturaAction(documento.id);
      if (!dadosUpload) return;

      await fetch(dadosUpload.signedUrl, { method: "PUT", body: file });

      startTransition(() => {
        confirmarUploadAssinaturaAction(documento.id, dadosUpload.path);
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{documento.titulo}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[documento.status]}`}
          >
            {STATUS_LABEL[documento.status]}
          </span>
        </div>
        <div className="flex gap-2">
          {documento.status !== "nao_liberado" && (
            <button
              onClick={handleVisualizar}
              className="rounded border px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Ver / baixar
            </button>
          )}
          {documento.requer_assinatura &&
            documento.status === "liberado" && (
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
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
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
