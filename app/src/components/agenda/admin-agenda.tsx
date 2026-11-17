"use client";

import { useState, useTransition } from "react";
import {
  alternarBlocoAction,
  cancelarSessaoAdminAction,
  criarBlocoAction,
  desconectarGoogleAction,
  desfechoSessaoAction,
  liberarAction,
  removerBlocoAction,
} from "@/app/(admin)/admin/agenda/actions";
import { useFeedback } from "@/components/ui/feedback";
import { DIAS_SEMANA, formatarDataHora } from "@/lib/agenda";
import type { CandidatoAgenda, SessaoComCandidato } from "@/lib/data/agenda";
import { SESSAO_ROTULO, type AgendaDisponibilidade, type SessaoStatus } from "@/lib/types/database";

type Resultado = { ok: boolean; mensagem: string };

function useExecutar() {
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();
  function executar(fn: () => Promise<Resultado>, titulo: string) {
    startTransition(async () => {
      try {
        const r = await fn();
        if (r.ok) fb.sucesso(titulo, r.mensagem);
        else fb.erro("Não foi possível concluir", r.mensagem);
      } catch {
        fb.erro("Algo deu errado", "Tente novamente em instantes.");
      }
    });
  }
  return { pending, executar, fb };
}

export function GoogleCard({ configurado, conectado, email, resultado }: { configurado: boolean; conectado: boolean; email: string | null; resultado?: string }) {
  const { pending, executar, fb } = useExecutar();
  const avisos: Record<string, string> = {
    conectado: "Google Calendar conectado.",
    recusado: "A conexão foi recusada ou expirou. Tente de novo.",
    sem_refresh: "O Google não devolveu a permissão offline. Remova o acesso do app na sua conta Google e conecte novamente.",
    erro: "Não foi possível concluir a conexão.",
    nao_configurado: "As chaves do Google ainda não foram configuradas no servidor.",
  };

  async function desconectar() {
    const ok = await fb.confirmar({
      titulo: "Desconectar o Google Calendar?",
      descricao: "Novas sessões deixam de criar evento e de checar conflitos na sua agenda.",
      digitar: true,
      perigo: true,
      rotuloConfirmar: "Desconectar",
    });
    if (ok) executar(desconectarGoogleAction, "Desconectado");
  }

  return (
    <div className="rounded-2xl border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground/60">Google Calendar</h2>
      {resultado && avisos[resultado] && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${resultado === "conectado" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{avisos[resultado]}</p>
      )}
      {!configurado ? (
        <p className="mt-3 text-sm text-foreground/60">
          Configure <span className="num">GOOGLE_CLIENT_ID</span> e <span className="num">GOOGLE_CLIENT_SECRET</span> no servidor para ligar a integração. Enquanto isso, a agenda funciona só com os horários cadastrados abaixo.
        </p>
      ) : conectado ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-all text-sm">Conectado{email ? ` como ${email}` : ""}. Horários ocupados na sua agenda não são oferecidos.</p>
          <button type="button" disabled={pending} onClick={desconectar} className="min-h-10 rounded-xl border px-4 text-sm hover:bg-brand-soft disabled:opacity-50">Desconectar</button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground/60">Conecte sua conta para evitar conflitos e criar os eventos automaticamente.</p>
          <a href="/api/google/conectar" className="inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm text-brand-fg">Conectar Google</a>
        </div>
      )}
    </div>
  );
}

export function Disponibilidade({ blocos }: { blocos: AgendaDisponibilidade[] }) {
  const { pending, executar, fb } = useExecutar();
  const [dia, setDia] = useState(2);
  const [ini, setIni] = useState("14:00");
  const [fim, setFim] = useState("18:00");
  const [dur, setDur] = useState(60);

  async function remover(b: AgendaDisponibilidade) {
    const ok = await fb.confirmar({ titulo: "Remover este horário?", descricao: `${DIAS_SEMANA[b.dia_semana]}, ${b.hora_inicio.slice(0, 5)} às ${b.hora_fim.slice(0, 5)}. Sessões já marcadas não são afetadas.`, rotuloConfirmar: "Remover", perigo: true });
    if (ok) executar(() => removerBlocoAction(b.id), "Horário removido");
  }

  return (
    <div className="rounded-2xl border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground/60">Disponibilidade semanal</h2>
      {blocos.length === 0 ? (
        <p className="mb-4 text-sm text-foreground/55">Nenhum horário cadastrado. Sem isso, ninguém consegue agendar.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {blocos.map((b) => (
            <li key={b.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${b.ativo ? "" : "opacity-55"}`}>
              <span><strong className="font-medium">{DIAS_SEMANA[b.dia_semana]}</strong> <span className="num">{b.hora_inicio.slice(0, 5)}–{b.hora_fim.slice(0, 5)}</span> · sessões de {b.duracao_min} min</span>
              <span className="flex gap-2">
                <button type="button" disabled={pending} onClick={() => executar(() => alternarBlocoAction(b.id, !b.ativo), b.ativo ? "Horário pausado" : "Horário reativado")} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-brand-soft">{b.ativo ? "Pausar" : "Reativar"}</button>
                <button type="button" disabled={pending} onClick={() => remover(b)} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-danger-soft">Remover</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); executar(() => criarBlocoAction({ dia_semana: dia, hora_inicio: ini, hora_fim: fim, duracao_min: dur }), "Horário adicionado"); }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end"
      >
        <label className="col-span-2 block text-xs text-foreground/60 sm:col-span-1">Dia
          <select value={dia} onChange={(e) => setDia(Number(e.target.value))} className="mt-1 w-full px-3 py-2">
            {DIAS_SEMANA.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </label>
        <label className="block text-xs text-foreground/60">Das<input type="time" value={ini} onChange={(e) => setIni(e.target.value)} required className="num mt-1 w-full px-3 py-2" /></label>
        <label className="block text-xs text-foreground/60">Até<input type="time" value={fim} onChange={(e) => setFim(e.target.value)} required className="num mt-1 w-full px-3 py-2" /></label>
        <label className="block text-xs text-foreground/60">Duração
          <select value={dur} onChange={(e) => setDur(Number(e.target.value))} className="mt-1 w-full px-3 py-2">
            {[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
        <button type="submit" disabled={pending} className="col-span-2 min-h-11 rounded-xl bg-brand px-4 text-sm text-brand-fg disabled:opacity-50 sm:col-span-1">Adicionar</button>
      </form>
    </div>
  );
}

export function Liberacoes({ candidatos }: { candidatos: CandidatoAgenda[] }) {
  const { pending, executar } = useExecutar();
  if (candidatos.length === 0) return <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Nenhum candidato encontrado.</p>;
  return (
    <ul className="space-y-2">
      {candidatos.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 py-2.5 text-sm">
          <span className="min-w-0"><span className="font-medium">{c.nome}</span> <span className="break-all text-xs text-foreground/55">{c.email}</span></span>
          <button
            type="button"
            disabled={pending}
            onClick={() => executar(() => liberarAction(c.id, !c.liberado), c.liberado ? "Liberação retirada" : "Agendamento liberado")}
            className={`min-h-9 rounded-lg px-3.5 text-xs ${c.liberado ? "bg-success-soft text-success" : "border hover:bg-brand-soft"}`}
          >
            {c.liberado ? "Liberado ✓ (retirar)" : "Liberar agendamento"}
          </button>
        </li>
      ))}
    </ul>
  );
}

const COR: Record<SessaoStatus, string> = {
  agendada: "bg-brand-soft text-brand-strong",
  realizada: "bg-success-soft text-success",
  cancelada: "bg-foreground/10 text-foreground/60",
  faltou: "bg-danger-soft text-danger",
};

export function SessoesAdmin({ sessoes }: { sessoes: SessaoComCandidato[] }) {
  const { pending, executar, fb } = useExecutar();

  async function cancelar(s: SessaoComCandidato) {
    const ok = await fb.confirmar({ titulo: "Cancelar esta sessão?", descricao: `${s.candidato_nome}, ${formatarDataHora(s.inicio)}. A pessoa será avisada e o evento sai do seu Google Calendar.`, digitar: true, perigo: true, rotuloConfirmar: "Cancelar sessão" });
    if (ok) executar(() => cancelarSessaoAdminAction(s.id), "Sessão cancelada");
  }
  async function desfecho(s: SessaoComCandidato, status: "realizada" | "faltou") {
    const ok = await fb.confirmar({
      titulo: status === "realizada" ? "Marcar como realizada?" : "Registrar falta?",
      descricao: status === "realizada" ? `${s.candidato_nome} ganha os pontos de comparecimento.` : `${s.candidato_nome} será avisado(a) de que não compareceu.`,
      rotuloConfirmar: status === "realizada" ? "Marcar realizada" : "Registrar falta",
    });
    if (ok) executar(() => desfechoSessaoAction(s.id, status), status === "realizada" ? "Sessão registrada" : "Falta registrada");
  }

  if (sessoes.length === 0) return <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Nenhuma sessão aqui.</p>;
  return (
    <ul className="space-y-2.5">
      {sessoes.map((s) => (
        <li key={s.id} className="flex flex-col gap-2 rounded-2xl border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium">{s.candidato_nome}</p>
            <p className="text-xs capitalize text-foreground/55">{formatarDataHora(s.inicio)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${COR[s.status]}`}>{SESSAO_ROTULO[s.status]}</span>
            {s.status === "agendada" && (
              <>
                <button type="button" disabled={pending} onClick={() => desfecho(s, "realizada")} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-success-soft">Realizada</button>
                <button type="button" disabled={pending} onClick={() => desfecho(s, "faltou")} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-brand-soft">Faltou</button>
                <button type="button" disabled={pending} onClick={() => cancelar(s)} className="min-h-9 rounded-lg border px-3 text-xs hover:bg-danger-soft">Cancelar</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
