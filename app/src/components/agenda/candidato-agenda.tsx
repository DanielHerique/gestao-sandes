"use client";

import { useMemo, useTransition } from "react";
import { agendarAction, cancelarAction } from "@/app/(candidato)/agenda/actions";
import { useFeedback } from "@/components/ui/feedback";
import {
  chaveDia,
  formatarDataHora,
  formatarDiaCompleto,
  formatarHora,
  type Slot,
} from "@/lib/agenda";
import type { SessaoDoCandidato } from "@/lib/data/agenda";
import { SESSAO_ROTULO, type AgendaSessao, type SessaoStatus } from "@/lib/types/database";

const COR: Record<SessaoStatus, string> = {
  agendada: "bg-brand-soft text-brand-strong",
  realizada: "bg-success-soft text-success",
  cancelada: "bg-foreground/10 text-foreground/60",
  faltou: "bg-danger-soft text-danger",
};

export function EscolherHorario({ slots }: { slots: Slot[] }) {
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();
  const dias = useMemo(() => {
    const mapa = new Map<string, Slot[]>();
    for (const s of slots) {
      const k = chaveDia(s.inicio);
      mapa.set(k, [...(mapa.get(k) ?? []), s]);
    }
    return [...mapa.values()];
  }, [slots]);

  async function escolher(s: Slot) {
    const ok = await fb.confirmar({
      titulo: "Confirmar esta sessão?",
      descricao: `${formatarDiaCompleto(s.inicio)}, às ${formatarHora(s.inicio)}. Você receberá o convite por e-mail.`,
      rotuloConfirmar: "Agendar",
    });
    if (!ok) return;
    startTransition(async () => {
      const r = await agendarAction(s.inicio);
      if (r.ok) fb.sucesso("Sessão agendada", r.mensagem);
      else fb.erro("Não foi possível agendar", r.mensagem);
    });
  }

  if (dias.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/60">
        Não há horários livres nos próximos dias. Avise a consultoria para abrir novas datas.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {dias.map((lista) => (
        <div key={chaveDia(lista[0].inicio)}>
          <h3 className="mb-2 text-sm font-medium capitalize">{formatarDiaCompleto(lista[0].inicio)}</h3>
          <div className="flex flex-wrap gap-2">
            {lista.map((s) => (
              <button
                key={s.inicio}
                type="button"
                disabled={pending}
                onClick={() => escolher(s)}
                className="num min-h-11 rounded-xl border bg-surface px-4 text-sm hover:border-brand hover:bg-brand-soft disabled:opacity-50"
              >
                {formatarHora(s.inicio)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaSessoes({ sessoes }: { sessoes: SessaoDoCandidato[] }) {
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  async function cancelar(s: AgendaSessao) {
    const ok = await fb.confirmar({
      titulo: "Cancelar esta sessão?",
      descricao: `${formatarDataHora(s.inicio)}. O horário volta a ficar livre.`,
      rotuloConfirmar: "Cancelar sessão",
      perigo: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const r = await cancelarAction(s.id);
      if (r.ok) fb.sucesso("Sessão cancelada", r.mensagem);
      else fb.erro("Não foi possível cancelar", r.mensagem);
    });
  }

  if (sessoes.length === 0) {
    return <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Você ainda não tem sessões.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {sessoes.map((s) => {
        const podeCancelar = s.cancelavel;
        return (
          <li key={s.id} className="flex flex-col gap-2 rounded-2xl border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium capitalize">{formatarDataHora(s.inicio)}</p>
              {s.meet_link && s.status === "agendada" && (
                <a href={s.meet_link} target="_blank" rel="noreferrer" className="break-all text-xs text-brand-strong underline">
                  Entrar na videochamada
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${COR[s.status]}`}>{SESSAO_ROTULO[s.status]}</span>
              {podeCancelar && (
                <button type="button" disabled={pending} onClick={() => cancelar(s)} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-brand-soft disabled:opacity-50">
                  Cancelar
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
