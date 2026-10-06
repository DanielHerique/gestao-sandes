"use client";

import { useTransition } from "react";
import type { Notificacao } from "@/lib/types/database";
import { marcarComoLidaAction } from "@/app/(candidato)/notificacoes/actions";

export function NotificacaoItem({ notificacao }: { notificacao: Notificacao }) {
  const [pending, startTransition] = useTransition();

  return (
    <li
      className={`rounded-md border p-3 text-sm ${
        notificacao.lida ? "opacity-60" : "bg-brand-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{notificacao.titulo}</p>
          <p className="text-foreground/70">
            {notificacao.mensagem}
          </p>
          <p className="mt-1 text-xs text-foreground/50">
            {notificacao.tipo === "institucional" ? "Institucional" : "Comportamental"}
          </p>
        </div>
        {!notificacao.lida && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(() => marcarComoLidaAction(notificacao.id))
            }
            className="shrink-0 rounded border px-2 py-1 text-xs hover:bg-brand-soft"
          >
            Marcar como lida
          </button>
        )}
      </div>
    </li>
  );
}
