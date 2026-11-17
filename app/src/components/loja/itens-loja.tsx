"use client";

import { useState, useTransition } from "react";
import { useFeedback } from "@/components/ui/feedback";
import { resgatarAction } from "@/app/(candidato)/loja/actions";
import type { ItemComDisponibilidade } from "@/lib/data/loja";

export function ItensLoja({ itens, saldo }: { itens: ItemComDisponibilidade[]; saldo: number }) {
  const [pending, startTransition] = useTransition();
  const [emAndamento, setEmAndamento] = useState<string | null>(null);
  const fb = useFeedback();

  async function resgatar(item: ItemComDisponibilidade) {
    const ok = await fb.confirmar({
      titulo: "Resgatar benefício",
      descricao: `"${item.titulo}" custa ${item.custo_pontos} pontos. Os pontos são reservados agora e o pedido fica aguardando aprovação da consultoria. Se for recusado, eles voltam para você.`,
      rotuloConfirmar: `Resgatar por ${item.custo_pontos} pontos`,
    });
    if (!ok) return;
    setEmAndamento(item.id);
    startTransition(async () => {
      try {
        const r = await resgatarAction(item.id);
        if (r.ok) fb.sucesso("Pedido enviado", r.mensagem);
        else fb.erro("Não foi possível resgatar", r.mensagem);
      } catch {
        fb.erro("Não foi possível resgatar", "Tente novamente em instantes.");
      } finally {
        setEmAndamento(null);
      }
    });
  }

  if (itens.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed p-10 text-center text-sm text-foreground/60">
        Nenhum benefício disponível por enquanto. Volte em breve.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {itens.map((item) => {
        const esgotado = item.restantesNoMes === 0;
        const faltam = Math.max(0, item.custo_pontos - saldo);
        const bloqueado = esgotado || faltam > 0;
        return (
          <li key={item.id} className="flex flex-col rounded-3xl border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold leading-snug">{item.titulo}</h3>
              <span className="num shrink-0 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
                {item.custo_pontos} pts
              </span>
            </div>
            {item.descricao && <p className="mt-2 flex-1 text-sm text-foreground/65">{item.descricao}</p>}
            <p className="mt-3 text-xs text-foreground/50">
              {item.restantesNoMes === null
                ? "Sem limite de vagas"
                : esgotado
                  ? "Cota do mês esgotada"
                  : `${item.restantesNoMes} ${item.restantesNoMes === 1 ? "vaga restante" : "vagas restantes"} neste mês`}
            </p>
            <button
              type="button"
              disabled={bloqueado || pending}
              onClick={() => resgatar(item)}
              className="mt-4 min-h-11 w-full rounded-xl bg-brand px-4 text-sm text-brand-fg disabled:bg-none disabled:bg-line disabled:text-foreground/50 disabled:shadow-none"
            >
              {emAndamento === item.id
                ? "Enviando..."
                : esgotado
                  ? "Indisponível neste mês"
                  : faltam > 0
                    ? `Faltam ${faltam} pontos`
                    : "Resgatar"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
