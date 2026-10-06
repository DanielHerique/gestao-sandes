"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
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

const COLUNAS: CandidaturaStatus[] = [
  "indefinido",
  "entrevista",
  "fechada",
  "retorno_negativo",
];

const COLUNA_COR: Record<CandidaturaStatus, string> = {
  indefinido: "border-t-slate-400",
  entrevista: "border-t-amber-500",
  fechada: "border-t-emerald-500",
  retorno_negativo: "border-t-rose-500",
};

function CandidaturaCard({
  candidatura,
  onToggleChecklist,
  onMudarStatus,
}: {
  candidatura: CandidaturaComChecklist;
  onMudarStatus: (status: CandidaturaStatus) => void;
  onToggleChecklist: (
    item: keyof typeof CHECKLIST_ITEM_LABELS,
    valor: boolean,
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: candidatura.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const checklist = candidatura.checklist;
  const itensChecklist = Object.keys(
    CHECKLIST_ITEM_LABELS,
  ) as (keyof typeof CHECKLIST_ITEM_LABELS)[];
  const concluidos = checklist
    ? itensChecklist.filter((item) => checklist[item]).length
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-surface p-3 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab pb-2 active:cursor-grabbing"
      >
        <p className="font-medium">{candidatura.cargo}</p>
        <p className="text-sm text-foreground/60">{candidatura.empresa}</p>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <div className="h-1.5 flex-1 rounded-full bg-line">
          <div
            className="h-1.5 rounded-full bg-emerald-500"
            style={{ width: `${(concluidos / itensChecklist.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-foreground/60">
          {concluidos}/{itensChecklist.length}
        </span>
      </div>

      <label className="mt-2 flex items-center gap-2 text-xs text-foreground/60">
        Status
        <select
          value={candidatura.status}
          onChange={(e) => onMudarStatus(e.target.value as CandidaturaStatus)}
          className="min-h-9 flex-1 rounded-lg border bg-background px-2 text-xs"
        >
          {COLUNAS.map((st) => (
            <option key={st} value={st}>
              {CANDIDATURA_STATUS_LABELS[st]}
            </option>
          ))}
        </select>
      </label>

      <details className="mt-2">
        <summary className="cursor-pointer py-1 text-xs text-foreground/60">
          Checklist
        </summary>
        <ul className="mt-1.5 space-y-1">
          {itensChecklist.map((item) => (
            <li key={item}>
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={checklist?.[item] ?? false}
                  onChange={(e) => onToggleChecklist(item, e.target.checked)}
                  className="mt-0.5"
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
  onToggleChecklist,
  onMudarStatus,
}: {
  status: CandidaturaStatus;
  candidaturas: CandidaturaComChecklist[];
  onMudarStatus: (candidaturaId: string, status: CandidaturaStatus) => void;
  onToggleChecklist: (
    candidaturaId: string,
    item: keyof typeof CHECKLIST_ITEM_LABELS,
    valor: boolean,
  ) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[85%] shrink-0 snap-center flex-col rounded-xl border-t-4 sm:w-72 sm:snap-start bg-surface p-3 ${COLUNA_COR[status]} ${
        isOver ? "ring-2 ring-brand" : ""
      }`}
    >
      <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
        {CANDIDATURA_STATUS_LABELS[status]}
        <span className="rounded-full bg-line px-2 py-0.5 text-xs font-normal">
          {candidaturas.length}
        </span>
      </h3>
      <div className="flex flex-col gap-2">
        {candidaturas.map((c) => (
          <CandidaturaCard
            key={c.id}
            candidatura={c}
            onMudarStatus={(novo) => onMudarStatus(c.id, novo)}
            onToggleChecklist={(item, valor) =>
              onToggleChecklist(c.id, item, valor)
            }
          />
        ))}
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    mudarStatus(active.id as string, over.id as CandidaturaStatus);
  }

  function mudarStatus(candidaturaId: string, novoStatus: CandidaturaStatus) {
    setCandidaturas((prev) =>
      prev.map((c) =>
        c.id === candidaturaId ? { ...c, status: novoStatus } : c,
      ),
    );

    startTransition(() => {
      moverStatusAction(candidaturaId, novoStatus);
    });
  }

  function handleToggleChecklist(
    candidaturaId: string,
    item: keyof typeof CHECKLIST_ITEM_LABELS,
    valor: boolean,
  ) {
    setCandidaturas((prev) =>
      prev.map((c) =>
        c.id === candidaturaId && c.checklist
          ? { ...c, checklist: { ...c.checklist, [item]: valor } }
          : c,
      ),
    );

    startTransition(() => {
      marcarChecklistItemAction(candidaturaId, item, valor);
    });
  }

  const activeCandidatura = candidaturas.find((c) => c.id === activeId);

  return (
    <DndContext
      id="kanban-candidaturas"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:gap-4">
        {COLUNAS.map((status) => (
          <Coluna
            key={status}
            status={status}
            candidaturas={candidaturas.filter((c) => c.status === status)}
            onToggleChecklist={handleToggleChecklist}
            onMudarStatus={mudarStatus}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCandidatura ? (
          <div className="w-64 rounded-lg border bg-surface p-3 shadow-lg">
            <p className="font-medium">{activeCandidatura.cargo}</p>
            <p className="text-sm text-foreground/60">
              {activeCandidatura.empresa}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
