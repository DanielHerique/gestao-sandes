"use client";

import { useState, useTransition } from "react";
import { useFeedback } from "@/components/ui/feedback";
import {
  atualizarItemAction,
  criarItemAction,
  decidirResgateAction,
} from "@/app/(admin)/admin/loja/actions";
import type { ItemComDisponibilidade, ResgateComCandidato } from "@/lib/data/loja";
import { RESGATE_ROTULO, type ResgateStatus } from "@/lib/types/database";

const COR: Record<ResgateStatus, string> = {
  pendente: "bg-brand-soft text-brand-strong",
  aprovado: "bg-success-soft text-success",
  concluido: "bg-success-soft text-success",
  recusado: "bg-danger-soft text-danger",
};

export function NovoItemForm() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [custo, setCusto] = useState("");
  const [cota, setCota] = useState("");
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  function criar(e: React.FormEvent) {
    e.preventDefault();
    const c = Number(custo);
    if (!titulo.trim() || !(c > 0)) return;
    startTransition(async () => {
      try {
        await criarItemAction({
          titulo,
          descricao: descricao.trim() || undefined,
          custo_pontos: Math.round(c),
          cota_mensal: cota === "" ? null : Math.max(0, Math.round(Number(cota))),
        });
        fb.sucesso("Item criado", "Já aparece na loja dos candidatos.");
        setTitulo(""); setDescricao(""); setCusto(""); setCota("");
      } catch {
        fb.erro("Não foi possível criar o item");
      }
    });
  }

  return (
    <form onSubmit={criar} className="rounded-2xl border bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground/60">Novo item</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título (ex: Sessão de mentoria extra)" aria-label="Título" required className="px-3.5 py-2 sm:col-span-2" />
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" aria-label="Descrição" rows={2} className="px-3.5 py-2 sm:col-span-2" />
        <label className="block text-xs text-foreground/60">
          Custo em pontos
          <input type="number" min={1} inputMode="numeric" value={custo} onChange={(e) => setCusto(e.target.value)} required className="num mt-1 w-full px-3.5 py-2" />
        </label>
        <label className="block text-xs text-foreground/60">
          Vagas por mês (vazio = sem limite)
          <input type="number" min={0} inputMode="numeric" value={cota} onChange={(e) => setCota(e.target.value)} className="num mt-1 w-full px-3.5 py-2" />
        </label>
      </div>
      <button type="submit" disabled={pending} className="mt-4 min-h-11 w-full rounded-xl bg-brand px-6 text-sm text-brand-fg disabled:opacity-50 sm:w-auto">
        {pending ? "Criando..." : "Criar item"}
      </button>
    </form>
  );
}

function LinhaItem({ item }: { item: ItemComDisponibilidade }) {
  const [custo, setCusto] = useState(String(item.custo_pontos));
  const [cota, setCota] = useState(item.cota_mensal === null ? "" : String(item.cota_mensal));
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();
  const alterado = custo !== String(item.custo_pontos) || cota !== (item.cota_mensal === null ? "" : String(item.cota_mensal));

  function salvar() {
    const c = Math.round(Number(custo));
    if (!(c > 0)) return fb.erro("O custo precisa ser maior que zero");
    startTransition(async () => {
      try {
        await atualizarItemAction(item.id, { custo_pontos: c, cota_mensal: cota === "" ? null : Math.max(0, Math.round(Number(cota))) });
        fb.sucesso("Item atualizado");
      } catch {
        fb.erro("Não foi possível atualizar");
      }
    });
  }

  async function alternar() {
    const ok = await fb.confirmar({
      titulo: item.ativo ? "Desativar item" : "Reativar item",
      descricao: item.ativo ? `"${item.titulo}" deixa de aparecer na loja. Pedidos já feitos continuam valendo.` : `"${item.titulo}" volta a aparecer na loja.`,
      rotuloConfirmar: item.ativo ? "Desativar" : "Reativar",
      digitar: item.ativo,
      perigo: item.ativo,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await atualizarItemAction(item.id, { ativo: !item.ativo });
        fb.sucesso(item.ativo ? "Item desativado" : "Item reativado");
      } catch {
        fb.erro("Não foi possível atualizar");
      }
    });
  }

  return (
    <li className={`rounded-2xl border bg-surface p-4 ${item.ativo ? "" : "opacity-60"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{item.titulo}</p>
          <p className="text-xs text-foreground/55">
            {item.cota_mensal === null ? "Sem limite mensal" : `${item.usadosNoMes} de ${item.cota_mensal} usados neste mês`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:w-80">
          <label className="block text-xs text-foreground/60">
            Pontos
            <input type="number" min={1} value={custo} onChange={(e) => setCusto(e.target.value)} className="num mt-1 w-full px-3 py-1.5" />
          </label>
          <label className="block text-xs text-foreground/60">
            Vagas/mês
            <input type="number" min={0} value={cota} placeholder="sem limite" onChange={(e) => setCota(e.target.value)} className="num mt-1 w-full px-3 py-1.5" />
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={salvar} disabled={pending || !alterado} className="min-h-10 rounded-xl bg-brand px-4 text-sm text-brand-fg disabled:opacity-40">Salvar</button>
          <button type="button" onClick={alternar} disabled={pending} className="min-h-10 rounded-xl border px-4 text-sm hover:bg-brand-soft">
            {item.ativo ? "Desativar" : "Reativar"}
          </button>
        </div>
      </div>
    </li>
  );
}

export function ListaItens({ itens }: { itens: ItemComDisponibilidade[] }) {
  return (
    <ul className="space-y-2.5">
      {itens.map((i) => <LinhaItem key={i.id} item={i} />)}
      {itens.length === 0 && <li className="list-none rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Nenhum item cadastrado.</li>}
    </ul>
  );
}

export function FilaResgates({ pedidos }: { pedidos: ResgateComCandidato[] }) {
  const [pending, startTransition] = useTransition();
  const [obs, setObs] = useState<Record<string, string>>({});
  const fb = useFeedback();

  async function decidir(p: ResgateComCandidato, status: "aprovado" | "concluido" | "recusado") {
    const recusar = status === "recusado";
    const ok = await fb.confirmar({
      titulo: recusar ? "Recusar resgate" : status === "aprovado" ? "Aprovar resgate" : "Marcar como concluído",
      descricao: recusar
        ? `Os ${p.pontos_debitados} pontos voltam para ${p.candidato_nome} e ele recebe um aviso.`
        : `${p.candidato_nome} recebe um aviso na central de notificações.`,
      rotuloConfirmar: recusar ? "Recusar e devolver pontos" : status === "aprovado" ? "Aprovar" : "Concluir",
      digitar: recusar,
      perigo: recusar,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await decidirResgateAction(p.id, status, obs[p.id]);
        fb.sucesso(recusar ? "Resgate recusado" : status === "aprovado" ? "Resgate aprovado" : "Resgate concluído", `${p.candidato_nome} foi avisado.`);
      } catch {
        fb.erro("Não foi possível atualizar o pedido");
      }
    });
  }

  if (pedidos.length === 0) {
    return <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Nenhum pedido nesta lista.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {pedidos.map((p) => (
        <li key={p.id} className="rounded-2xl border bg-surface p-4 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{p.item_titulo}</p>
              <p className="text-xs text-foreground/55">
                {p.candidato_nome} · {p.pontos_debitados} pontos · {new Date(p.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${COR[p.status]}`}>{RESGATE_ROTULO[p.status]}</span>
          </div>
          {p.status === "pendente" && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={obs[p.id] ?? ""} onChange={(e) => setObs((o) => ({ ...o, [p.id]: e.target.value }))} placeholder="Observação para o candidato (opcional)" aria-label="Observação" className="min-w-0 flex-1 px-3.5 py-2" />
              <button type="button" disabled={pending} onClick={() => decidir(p, "aprovado")} className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50">Aprovar</button>
              <button type="button" disabled={pending} onClick={() => decidir(p, "recusado")} className="min-h-11 rounded-xl border px-5 text-sm text-danger hover:bg-danger-soft disabled:opacity-50">Recusar</button>
            </div>
          )}
          {p.status === "aprovado" && (
            <button type="button" disabled={pending} onClick={() => decidir(p, "concluido")} className="mt-3 min-h-10 rounded-xl border px-4 text-sm hover:bg-brand-soft disabled:opacity-50">
              Marcar como concluído
            </button>
          )}
          {p.observacao_admin && p.status !== "pendente" && <p className="mt-2 text-xs text-foreground/55">Observação: {p.observacao_admin}</p>}
        </li>
      ))}
    </ul>
  );
}
