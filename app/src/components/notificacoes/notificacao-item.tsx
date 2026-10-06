"use client";

import { useTransition } from "react";
import type { Notificacao } from "@/lib/types/database";
import { useFeedback } from "@/components/ui/feedback";
import { marcarComoLidaAction } from "@/app/(candidato)/notificacoes/actions";

export function NotificacaoItem({ notificacao }: { notificacao: Notificacao }) {
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  return (
    <li
      className={`rounded-2xl border p-4 text-sm ${
        notificacao.lida ? "bg-surface opacity-60" : "border-transparent bg-brand-soft"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium">{notificacao.titulo}</p>
          <p className="mt-0.5 text-foreground/70">{notificacao.mensagem}</p>
          <p className="mt-2 text-xs text-foreground/50">
            {notificacao.tipo === "institucional" ? "Institucional" : "Automática"} ·{" "}
            {new Date(notificacao.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {!notificacao.lida && (
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await marcarComoLidaAction(notificacao.id);
                  fb.sucesso("Notificação marcada como lida");
                } catch {
                  fb.erro("Não foi possível atualizar");
                }
              })
            }
            className="shrink-0 rounded-xl border bg-surface px-3 py-2 text-xs hover:bg-background"
          >
            Marcar como lida
          </button>
        )}
      </div>
    </li>
  );
}
