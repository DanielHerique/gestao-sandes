"use client";

import { useState, useTransition } from "react";
import { treinarEntrevistaAction } from "@/app/(candidato)/treino-entrevista/actions";
import { PERGUNTAS_POR_TREINO } from "@/lib/ai/treino";
import { useFeedback } from "@/components/ui/feedback";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function TreinoEntrevista() {
  const [cargo, setCargo] = useState("");
  const [iniciado, setIniciado] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [resposta, setResposta] = useState("");
  const [fim, setFim] = useState(false);
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  function enviar(historico: Msg[]) {
    startTransition(async () => {
      const r = await treinarEntrevistaAction(cargo, historico);
      if (!r.ok) {
        fb.erro("Não foi possível continuar", r.mensagem);
        return;
      }
      setMsgs([...historico, { role: "assistant", content: r.resposta }]);
      setFim(r.fim);
    });
  }

  function comecar() {
    setIniciado(true);
    setMsgs([]);
    setFim(false);
    enviar([]);
  }

  function responder() {
    const texto = resposta.trim();
    if (!texto) return;
    const novo: Msg[] = [...msgs, { role: "user", content: texto }];
    setMsgs(novo);
    setResposta("");
    enviar(novo);
  }

  const respondidas = msgs.filter((m) => m.role === "user").length;

  if (!iniciado) {
    return (
      <div className="space-y-4 rounded-2xl border bg-surface p-5">
        <label className="block text-sm font-semibold">
          Cargo da vaga
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} maxLength={120} className="mt-1 w-full px-3 font-normal" />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Ex.: Analista de Marketing Sênior. Serão {PERGUNTAS_POR_TREINO} perguntas, com feedback no método STAR.
          </span>
        </label>
        <button
          type="button"
          onClick={comecar}
          disabled={!cargo.trim()}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-brand-fg disabled:bg-neutral disabled:text-foreground/60"
        >
          Começar treino
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/60">
        {cargo} · {Math.min(respondidas, PERGUNTAS_POR_TREINO)} de {PERGUNTAS_POR_TREINO} respostas
      </p>
      <ul className="space-y-3">
        {msgs.map((m, i) => (
          <li
            key={i}
            className={`whitespace-pre-wrap rounded-2xl p-4 text-sm ${
              m.role === "assistant" ? "border bg-surface" : "ml-8 bg-brand-soft"
            }`}
          >
            {m.content}
          </li>
        ))}
        {pending && <li className="rounded-2xl border bg-surface p-4 text-sm text-foreground/60">Pensando...</li>}
      </ul>

      {fim ? (
        <button
          type="button"
          onClick={() => {
            setIniciado(false);
            setMsgs([]);
            setFim(false);
          }}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink px-6 font-semibold"
        >
          Novo treino
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            rows={5}
            maxLength={3000}
            disabled={pending || msgs.length === 0}
            aria-label="Sua resposta"
            className="w-full p-3"
          />
          <button
            type="button"
            onClick={responder}
            disabled={pending || !resposta.trim()}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-brand-fg disabled:bg-neutral disabled:text-foreground/60"
          >
            Enviar resposta
          </button>
        </div>
      )}
    </div>
  );
}
