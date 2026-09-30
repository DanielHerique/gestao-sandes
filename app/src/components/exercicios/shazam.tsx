"use client";

import { useState, useTransition } from "react";
import type { ExercicioShazam, ExercicioStatus } from "@/lib/types/database";
import { salvarShazamAction } from "@/app/(candidato)/exercicios/actions";

type Campo = Omit<ExercicioShazam, "candidato_id" | "status" | "updated_at">;

const ETAPAS: { titulo: string; campos: (keyof Campo)[] }[] = [
  {
    titulo: "1. Linha do tempo emocional",
    campos: [
      "momento_positivo_1",
      "momento_positivo_2",
      "momento_positivo_3",
      "momento_desafiador_1",
      "momento_desafiador_2",
      "momento_desafiador_3",
    ],
  },
  {
    titulo: "2. Momento-chave",
    campos: ["momento_chave_selecionado", "motivo_voltaria"],
  },
  {
    titulo: "3. O que te move",
    campos: ["o_que_move_hoje", "aprendizado_sobre_si"],
  },
  {
    titulo: "4. Compartilhar com o mentor",
    campos: ["compartilhar_com_mentor"],
  },
  {
    titulo: "5. Síntese final",
    campos: [
      "sintese_aprendizado",
      "sintese_aplicacao",
      "sintese_comportamento_transformar",
      "sintese_fortalecer",
    ],
  },
];

const LABELS: Record<keyof Campo, string> = {
  momento_positivo_1: "Momento marcante positivo 1",
  momento_positivo_2: "Momento marcante positivo 2",
  momento_positivo_3: "Momento marcante positivo 3",
  momento_desafiador_1: "Momento desafiador 1",
  momento_desafiador_2: "Momento desafiador 2",
  momento_desafiador_3: "Momento desafiador 3",
  momento_chave_selecionado: "Momento-chave selecionado",
  motivo_voltaria: "Por que você voltaria neste momento?",
  o_que_move_hoje: "O que te move hoje?",
  aprendizado_sobre_si: "O que você aprendeu sobre si mesmo?",
  compartilhar_com_mentor: "O que é importante compartilhar com seu mentor?",
  sintese_aprendizado: "Principal aprendizado",
  sintese_aplicacao: "Como você vai aplicar isso",
  sintese_comportamento_transformar: "Comportamento a transformar",
  sintese_fortalecer: "O que fortalecer",
};

export function Shazam({
  dadosIniciais,
}: {
  dadosIniciais: ExercicioShazam | null;
}) {
  const [dados, setDados] = useState<Partial<ExercicioShazam>>(
    dadosIniciais ?? {},
  );
  const [pending, startTransition] = useTransition();
  const statusAnterior: ExercicioStatus = dadosIniciais?.status ?? "nao_iniciado";

  function handleChange(campo: keyof Campo, valor: string) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function salvar(status: ExercicioStatus) {
    const payload = { ...dados, status };
    setDados(payload);
    startTransition(() => {
      salvarShazamAction(payload, statusAnterior);
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-500">
        Ferramenta Shazam — módulo de Autoconhecimento (Essência & Propósito).
      </p>

      <div className="space-y-6">
        {ETAPAS.map((etapa) => (
          <div
            key={etapa.titulo}
            className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
          >
            <h3 className="mb-3 text-sm font-semibold">{etapa.titulo}</h3>
            <div className="space-y-3">
              {etapa.campos.map((campo) => (
                <div key={campo}>
                  <label className="mb-1 block text-xs text-neutral-500">
                    {LABELS[campo]}
                  </label>
                  <textarea
                    defaultValue={dados[campo] ?? ""}
                    onBlur={(e) => handleChange(campo, e.target.value)}
                    rows={2}
                    className="w-full rounded border px-2 py-1.5 text-sm dark:bg-neutral-950"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={pending}
          onClick={() => salvar("em_andamento")}
          className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Salvar rascunho
        </button>
        <button
          disabled={pending}
          onClick={() => salvar("concluido")}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          Concluir exercício
        </button>
      </div>
    </div>
  );
}
