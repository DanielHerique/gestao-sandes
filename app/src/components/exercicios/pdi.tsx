"use client";

import { useFeedback } from "@/components/ui/feedback";

import { useState, useTransition } from "react";
import type {
  ExercicioPdi5w2h,
  ExercicioPdiMeta,
  ExercicioStatus,
} from "@/lib/types/database";
import {
  adicionarPdi5w2hAction,
  adicionarPdiMetaAction,
  atualizarStatusPdiAction,
  excluirPdi5w2hAction,
  excluirPdiMetaAction,
} from "@/app/(candidato)/exercicios/actions";

const PRAZO_LABEL: Record<string, string> = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
};

const CAMPOS_5W2H: { key: keyof ExercicioPdi5w2h; label: string }[] = [
  { key: "what", label: "O quê (What)" },
  { key: "why", label: "Por quê (Why)" },
  { key: "when", label: "Quando (When)" },
  { key: "where_", label: "Onde (Where)" },
  { key: "who", label: "Quem (Who)" },
  { key: "how", label: "Como (How)" },
  { key: "how_much", label: "Quanto (How much)" },
];

export function Pdi({
  metasIniciais,
  linhas5w2hIniciais,
  statusInicial,
}: {
  metasIniciais: ExercicioPdiMeta[];
  linhas5w2hIniciais: ExercicioPdi5w2h[];
  statusInicial: ExercicioStatus;
}) {
  const [novaCompetencia, setNovaCompetencia] = useState("");
  const [novoPrazo, setNovoPrazo] = useState<"curto" | "medio" | "longo">(
    "curto",
  );
  const [, startTransition] = useTransition();
  const [pendingStatus, startStatusTransition] = useTransition();
  const fb = useFeedback();

  return (
    <div>
      <p className="mb-4 text-sm text-foreground/60">
        Plano de Desenvolvimento Individual — módulo de Autoconhecimento
        (Essência & Propósito).
      </p>

      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold">
          Metas de desenvolvimento por competência
        </h3>
        <ul className="mb-3 space-y-2">
          {metasIniciais.map((meta) => (
            <li
              key={meta.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <span>
                {meta.competencia} —{" "}
                <span className="text-foreground/60">
                  {meta.prazo ? PRAZO_LABEL[meta.prazo] : ""}
                </span>
              </span>
              <button
                onClick={async () => {
                  const ok = await fb.confirmar({
                    titulo: "Remover meta",
                    descricao: `"${meta.competencia}" será removida do seu PDI.`,
                    rotuloConfirmar: "Remover",
                    perigo: true,
                  });
                  if (!ok) return;
                  startTransition(async () => {
                    try {
                      await excluirPdiMetaAction(meta.id);
                      fb.sucesso("Meta removida");
                    } catch {
                      fb.erro("Não foi possível remover");
                    }
                  });
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={novaCompetencia}
            onChange={(e) => setNovaCompetencia(e.target.value)}
            placeholder="Competência"
            className="min-w-0 flex-1 px-3.5 py-2"
          />
          <select
            value={novoPrazo}
            onChange={(e) =>
              setNovoPrazo(e.target.value as "curto" | "medio" | "longo")
            }
            className="px-3.5 py-2"
          >
            <option value="curto">Curto prazo</option>
            <option value="medio">Médio prazo</option>
            <option value="longo">Longo prazo</option>
          </select>
          <button
            onClick={() => {
              if (!novaCompetencia.trim()) return;
              const competencia = novaCompetencia.trim();
              startTransition(async () => {
                try {
                  await adicionarPdiMetaAction(competencia, novoPrazo);
                  fb.sucesso("Meta adicionada", competencia);
                } catch {
                  fb.erro("Não foi possível adicionar a meta");
                }
              });
              setNovaCompetencia("");
            }}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-brand-soft"
          >
            Adicionar
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold">Plano de ação (5W2H)</h3>
        <div className="space-y-4">
          {linhas5w2hIniciais.map((linha) => (
            <div
              key={linha.id}
              className="rounded-lg border bg-surface p-4"
            >
              <div className="mb-2 flex justify-end">
                <button
                  onClick={() =>
                    {
                      fb.confirmar({
                        titulo: "Remover linha do 5W2H",
                        descricao: "Essa linha do plano de ação será apagada.",
                        rotuloConfirmar: "Remover",
                        perigo: true,
                      }).then((ok) => {
                        if (!ok) return;
                        startTransition(async () => {
                          try {
                            await excluirPdi5w2hAction(linha.id);
                            fb.sucesso("Linha removida");
                          } catch {
                            fb.erro("Não foi possível remover");
                          }
                        });
                      });
                    }
                  }
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remover
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                {CAMPOS_5W2H.map((c) => (
                  <p key={c.key}>
                    <span className="text-foreground/60">{c.label}: </span>
                    {(linha[c.key] as string) || "—"}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            startTransition(async () => {
              try {
                await adicionarPdi5w2hAction({});
                fb.sucesso("Linha adicionada ao 5W2H");
              } catch {
                fb.erro("Não foi possível adicionar");
              }
            })
          }
          className="mt-3 rounded-md border px-4 py-2 text-sm hover:bg-brand-soft"
        >
          + Adicionar linha 5W2H
        </button>
      </section>

      <div className="flex gap-2">
        <button
          disabled={pendingStatus}
          onClick={() =>
            startStatusTransition(async () => {
              try {
                await atualizarStatusPdiAction("em_andamento");
                fb.sucesso("PDI marcado como em andamento");
              } catch {
                fb.erro("Não foi possível atualizar");
              }
            })
          }
          className="rounded-md border px-4 py-2 text-sm hover:bg-brand-soft"
        >
          Marcar em andamento
        </button>
        <button
          disabled={pendingStatus}
          onClick={() =>
            fb
              .confirmar({
                titulo: "Concluir o PDI",
                descricao: "A conclusão é registrada para a consultoria.",
                rotuloConfirmar: "Concluir exercício",
              })
              .then((ok) => {
                if (!ok) return;
                startStatusTransition(async () => {
                  try {
                    await atualizarStatusPdiAction("concluido");
                    fb.sucesso("Exercício concluído");
                  } catch {
                    fb.erro("Não foi possível concluir");
                  }
                });
              })
          }
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          Concluir exercício
        </button>
        <span className="self-center text-xs text-foreground/60">
          Status atual: {statusInicial}
        </span>
      </div>
    </div>
  );
}
