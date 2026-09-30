"use client";

import { useTransition } from "react";
import type { ExercicioListaMestraLinha } from "@/lib/types/database";
import {
  adicionarLinhaListaMestraAction,
  atualizarLinhaListaMestraAction,
  excluirLinhaListaMestraAction,
} from "@/app/(candidato)/exercicios/actions";

const CAMPOS: {
  key: keyof ExercicioListaMestraLinha;
  label: string;
}[] = [
  { key: "ano", label: "Ano" },
  { key: "empresa", label: "Empresa" },
  { key: "segmento", label: "Segmento" },
  { key: "atividade_principal", label: "Atividade principal" },
  { key: "tarefas_secundarias", label: "Tarefas secundárias" },
  { key: "resultados_alcancados", label: "Resultados alcançados" },
  { key: "competencias_desenvolvidas", label: "Competências desenvolvidas" },
];

export function ListaMestra({
  linhas,
}: {
  linhas: ExercicioListaMestraLinha[];
}) {
  const [, startTransition] = useTransition();

  function handleChange(
    id: string,
    campo: keyof ExercicioListaMestraLinha,
    valor: string,
  ) {
    startTransition(() => {
      atualizarLinhaListaMestraAction(id, { [campo]: valor });
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-neutral-500">
        Base para o Currículo de Impacto. Uma linha por experiência
        profissional.
      </p>

      <div className="space-y-4">
        {linhas.map((linha) => (
          <div
            key={linha.id}
            className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
          >
            <div className="mb-2 flex justify-end">
              <button
                onClick={() =>
                  startTransition(() => excluirLinhaListaMestraAction(linha.id))
                }
                className="text-xs text-rose-600 hover:underline"
              >
                Remover
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CAMPOS.map((campo) => (
                <div
                  key={campo.key}
                  className={
                    campo.key === "atividade_principal" ||
                    campo.key === "tarefas_secundarias" ||
                    campo.key === "resultados_alcancados" ||
                    campo.key === "competencias_desenvolvidas"
                      ? "col-span-2"
                      : "col-span-1"
                  }
                >
                  <label className="mb-1 block text-xs text-neutral-500">
                    {campo.label}
                  </label>
                  <input
                    defaultValue={(linha[campo.key] as string) ?? ""}
                    onBlur={(e) =>
                      handleChange(linha.id, campo.key, e.target.value)
                    }
                    className="w-full rounded border px-2 py-1.5 text-sm dark:bg-neutral-950"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          startTransition(() => adicionarLinhaListaMestraAction({}))
        }
        className="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        + Adicionar experiência
      </button>
    </div>
  );
}
