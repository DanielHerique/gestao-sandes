"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Icon } from "@/components/icons";
import { useFeedback } from "@/components/ui/feedback";
import {
  CANDIDATURA_STATUS_LABELS,
  CHECKLIST_ITEM_LABELS,
  type CandidaturaStatus,
} from "@/lib/types/database";
import type { CandidaturaComChecklist } from "@/lib/data/candidaturas";
import {
  marcarChecklistItemAction,
  moverStatusAction,
} from "@/app/(candidato)/candidaturas/actions";
import { DetalheCandidatura } from "./detalhe-candidatura";

const COLUNAS: CandidaturaStatus[] = ["indefinido", "entrevista", "fechada", "retorno_negativo"];

const COLUNA_COR: Record<CandidaturaStatus, string> = {
  indefinido: "bg-slate-400",
  entrevista: "bg-amber-500",
  fechada: "bg-emerald-500",
  retorno_negativo: "bg-rose-500",
};

type ItemChecklist = keyof typeof CHECKLIST_ITEM_LABELS;
const ITENS = Object.keys(CHECKLIST_ITEM_LABELS) as ItemChecklist[];

function CartaoCandidatura({
  candidatura,
  onAbrir,
  onMudarStatus,
  onToggleChecklist,
}: {
  candidatura: CandidaturaComChecklist;
  onAbrir: () => void;
  onMudarStatus: (status: CandidaturaStatus) => void;
  onToggleChecklist: (item: ItemChecklist, valor: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidatura.id,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const checklist = candidatura.checklist;
  const concluidos = checklist ? ITENS.filter((i) => checklist[i]).length : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border bg-surface p-3.5 transition-shadow hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onAbrir}
          className="min-w-0 flex-1 text-left"
          aria-label={`Abrir detalhes de ${candidatura.cargo}`}
        >
          <p className="font-medium leading-snug">{candidatura.cargo}</p>
          <p className="mt-0.5 text-sm text-foreground/60">{candidatura.empresa}</p>
        </button>
        <span
          {...listeners}
          {...attributes}
          aria-label="Arrastar"
          className="hidden h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-foreground/30 hover:bg-brand-soft hover:text-brand-strong active:cursor-grabbing md:flex"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${(concluidos / ITENS.length) * 100}%` }}
          />
        </div>
        <span className="num text-xs text-foreground/55">{concluidos}/{ITENS.length}</span>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
        Status
        <select
          value={candidatura.status}
          onChange={(e) => onMudarStatus(e.target.value as CandidaturaStatus)}
          className="min-h-9 min-w-0 flex-1 px-2 text-xs"
        >
          {COLUNAS.map((st) => (
            <option key={st} value={st}>
              {CANDIDATURA_STATUS_LABELS[st]}
            </option>
          ))}
        </select>
      </label>

      <details className="mt-2">
        <summary className="cursor-pointer py-1 text-xs text-foreground/60">Checklist</summary>
        <ul className="mt-1.5 space-y-1.5">
          {ITENS.map((item) => (
            <li key={item}>
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={checklist?.[item] ?? false}
                  onChange={(e) => onToggleChecklist(item, e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span>{CHECKLIST_ITEM_LABELS[item]}</span>
              </label>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Coluna({
  status,
  candidaturas,
  visivelNoCelular,
  children,
}: {
  status: CandidaturaStatus;
  candidaturas: CandidaturaComChecklist[];
  visivelNoCelular: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 flex-col rounded-3xl bg-background/60 p-3 ring-1 ring-line ${
        visivelNoCelular ? "flex" : "hidden md:flex"
      } ${isOver ? "ring-2 !ring-brand" : ""}`}
    >
      <h3 className="mb-3 flex items-center justify-between gap-2 px-1 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${COLUNA_COR[status]}`} />
          {CANDIDATURA_STATUS_LABELS[status]}
        </span>
        <span className="num rounded-full bg-line px-2 py-0.5 text-xs font-normal">{candidaturas.length}</span>
      </h3>
      <div className="flex flex-col gap-2.5">
        {children}
        {candidaturas.length === 0 && (
          <p className="rounded-2xl border border-dashed px-3 py-6 text-center text-xs text-foreground/45">
            Nenhuma candidatura aqui
          </p>
        )}
      </div>
    </div>
  );
}

export function KanbanCandidaturas({
  candidaturasIniciais,
}: {
  candidaturasIniciais: CandidaturaComChecklist[];
}) {
  const [candidaturas, setCandidaturas] = useState(candidaturasIniciais);
  const [origem, setOrigem] = useState(candidaturasIniciais);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);
  const [abaCelular, setAbaCelular] = useState<CandidaturaStatus>("indefinido");
  const [, startTransition] = useTransition();
  const fb = useFeedback();

  // Sincroniza com o servidor quando a lista muda (nova candidatura, etc.)
  if (origem !== candidaturasIniciais) {
    setOrigem(candidaturasIniciais);
    setCandidaturas(candidaturasIniciais);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
  );

  function mudarStatus(id: string, novo: CandidaturaStatus) {
    const atual = candidaturas.find((c) => c.id === id);
    if (!atual || atual.status === novo) return;
    setCandidaturas((prev) => prev.map((c) => (c.id === id ? { ...c, status: novo } : c)));
    startTransition(async () => {
      try {
        const r = await moverStatusAction(id, novo);
        fb.sucesso(
          `Movida para ${CANDIDATURA_STATUS_LABELS[novo]}`,
          r.pontos > 0 ? `+${r.pontos} pontos` : undefined,
        );
      } catch {
        setCandidaturas((prev) => prev.map((c) => (c.id === id ? { ...c, status: atual.status } : c)));
        fb.erro("Não foi possível mover a candidatura");
      }
    });
  }

  function toggleChecklist(id: string, item: ItemChecklist, valor: boolean) {
    setCandidaturas((prev) =>
      prev.map((c) => (c.id === id && c.checklist ? { ...c, checklist: { ...c.checklist, [item]: valor } } : c)),
    );
    startTransition(async () => {
      try {
        const r = await marcarChecklistItemAction(id, item, valor);
        if (r.pontos > 0) fb.sucesso("Etapa concluída", `+${r.pontos} pontos`);
      } catch {
        setCandidaturas((prev) =>
          prev.map((c) => (c.id === id && c.checklist ? { ...c, checklist: { ...c.checklist, [item]: !valor } } : c)),
        );
        fb.erro("Não foi possível atualizar o checklist");
      }
    });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (e.over) mudarStatus(e.active.id as string, e.over.id as CandidaturaStatus);
  }

  const ativa = candidaturas.find((c) => c.id === activeId);
  const abertaCand = candidaturas.find((c) => c.id === aberta) ?? null;

  if (candidaturas.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <Icon name="candidaturas" className="h-6 w-6" />
        </span>
        <p className="mt-4 font-display text-xl font-semibold">Nenhuma candidatura ainda</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-foreground/60">
          Registre a primeira vaga para começar a acompanhar seu funil e ganhar pontos.
        </p>
      </div>
    );
  }

  return (
    <DndContext id="kanban-candidaturas" sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {/* Celular: um status por vez, sem rolagem lateral */}
      <div role="tablist" aria-label="Status das candidaturas" className="mb-4 grid grid-cols-2 gap-2 md:hidden">
        {COLUNAS.map((st) => (
          <button
            key={st}
            role="tab"
            aria-selected={abaCelular === st}
            onClick={() => setAbaCelular(st)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
              abaCelular === st ? "border-transparent bg-ink text-ink-fg" : "bg-surface"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${COLUNA_COR[st]}`} />
              {CANDIDATURA_STATUS_LABELS[st]}
            </span>
            <span className="num text-xs opacity-70">{candidaturas.filter((c) => c.status === st).length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUNAS.map((status) => {
          const itens = candidaturas.filter((c) => c.status === status);
          return (
            <Coluna key={status} status={status} candidaturas={itens} visivelNoCelular={abaCelular === status}>
              {itens.map((c) => (
                <CartaoCandidatura
                  key={c.id}
                  candidatura={c}
                  onAbrir={() => setAberta(c.id)}
                  onMudarStatus={(novo) => mudarStatus(c.id, novo)}
                  onToggleChecklist={(item, valor) => toggleChecklist(c.id, item, valor)}
                />
              ))}
            </Coluna>
          );
        })}
      </div>

      <DragOverlay>
        {ativa ? (
          <div className="w-64 rounded-2xl border bg-surface p-3.5 shadow-xl">
            <p className="font-medium">{ativa.cargo}</p>
            <p className="text-sm text-foreground/60">{ativa.empresa}</p>
          </div>
        ) : null}
      </DragOverlay>

      <DetalheCandidatura
        candidatura={abertaCand}
        onFechar={() => setAberta(null)}
        onAtualizada={(id, campos) =>
          setCandidaturas((prev) => prev.map((c) => (c.id === id ? { ...c, ...campos } : c)))
        }
        onExcluida={(id) => setCandidaturas((prev) => prev.filter((c) => c.id !== id))}
      />
    </DndContext>
  );
}
