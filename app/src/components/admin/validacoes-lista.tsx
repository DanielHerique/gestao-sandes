"use client";

import { useState, useTransition } from "react";
import { useFeedback } from "@/components/ui/feedback";
import { devolverIndicacaoAction, validarIndicacaoAction } from "@/app/(admin)/admin/validacoes/actions";
import type { ValidacaoPendente } from "@/lib/data/validacoes";

function hrefPerfil(p: string) {
  return /^https?:\/\//i.test(p) ? p : `https://${p}`;
}

function Item({ v }: { v: ValidacaoPendente }) {
  const fb = useFeedback();
  const [pending, start] = useTransition();
  const [devolvendo, setDevolvendo] = useState(false);
  const [obs, setObs] = useState("");

  async function validar() {
    const ok = await fb.confirmar({
      titulo: "Confirmar indicação feita",
      descricao: `Você confirma que a indicação de ${v.candidato_nome} para ${v.cargo} na ${v.empresa} foi feita? O item do checklist será marcado e o mentorado será avisado.`,
      rotuloConfirmar: "Indicação feita",
    });
    if (!ok) return;
    start(async () => {
      try {
        await validarIndicacaoAction(v.id);
        fb.sucesso("Indicação validada", `${v.candidato_nome} foi avisado.`);
      } catch {
        fb.erro("Não foi possível validar");
      }
    });
  }

  function devolver() {
    if (!obs.trim()) {
      fb.erro("Escreva uma observação", "O mentorado precisa saber o que ajustar.");
      return;
    }
    start(async () => {
      try {
        await devolverIndicacaoAction(v.id, obs);
        fb.sucesso("Devolvida ao mentorado");
      } catch {
        fb.erro("Não foi possível devolver");
      }
    });
  }

  return (
    <li className="rounded-2xl border bg-surface p-4 sm:p-5">
      <p className="font-medium">{v.cargo} · {v.empresa}</p>
      <p className="mt-0.5 text-sm text-foreground/60">{v.candidato_nome}</p>

      <p className="eyebrow mt-4 !text-foreground/50">Perfis informados</p>
      <ul className="mt-2 space-y-1.5">
        {v.perfis.map((p) => (
          <li key={p} className="min-w-0 truncate text-sm">
            <a href={hrefPerfil(p)} target="_blank" rel="noopener noreferrer" className="text-brand-strong hover:underline">{p}</a>
          </li>
        ))}
      </ul>

      {devolvendo ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium" htmlFor={`obs-${v.id}`}>O que o mentorado precisa ajustar?</label>
          <textarea
            id={`obs-${v.id}`}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={devolver} className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50">Devolver</button>
            <button type="button" disabled={pending} onClick={() => setDevolvendo(false)} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={pending} onClick={validar} className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50">Indicação feita</button>
          <button type="button" disabled={pending} onClick={() => setDevolvendo(true)} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">Devolver com observação</button>
        </div>
      )}
    </li>
  );
}

export function ValidacoesLista({ itens }: { itens: ValidacaoPendente[] }) {
  if (itens.length === 0) {
    return <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/60">Nenhuma indicação aguardando validação.</p>;
  }
  return (
    <ul className="space-y-3">
      {itens.map((v) => <Item key={v.id} v={v} />)}
    </ul>
  );
}
