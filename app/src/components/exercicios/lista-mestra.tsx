"use client";

import { useFeedback } from "@/components/ui/feedback";

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
  const fb = useFeedback();

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
      <p className="mb-4 text-sm text-foreground/60">
        Base para o Currículo de Impacto. Uma linha por experiência
        profissional.
      </p>

      <div className="space-y-4">
        {linhas.map((linha) => (
          <div
            key={linha.id}
            className="rounded-lg border bg-surface p-4"
          >
            <div className="mb-2 flex justify-end">
              <button
                onClick={async () => {
                  const ok = await fb.confirmar({
                    titulo: "Remover experiência",
                    descricao: "Essa linha da Lista Mestra será apagada.",
                    rotuloConfirmar: "Remover",
                    perigo: true,
                  });
                  if (!ok) return;
                  startTransition(async () => {
                    try {
                      await excluirLinhaListaMestraAction(linha.id);
                      fb.sucesso("Experiência removida");
                    } catch {
                      fb.erro("Não foi possível remover");
                    }
                  });
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Remover
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CAMPOS.map((campo) => (
                <div
                  key={campo.key}
                  className={
                    campo.key === "atividade_principal" ||
                    campo.key === "tarefas_secundarias" ||
                    campo.key === "resultados_alcancados" ||
                    campo.key === "competencias_desenvolvidas"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label className="mb-1 block text-xs text-foreground/60">
                    {campo.label}
                  </label>
                  <input
                    defaultValue={(linha[campo.key] as string) ?? ""}
                    onBlur={(e) =>
                      handleChange(linha.id, campo.key, e.target.value)
                    }
                    className="w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          startTransition(async () => {
            try {
              await adicionarLinhaListaMestraAction({});
              fb.sucesso("Linha adicionada", "Preencha os campos da experiência.");
            } catch {
              fb.erro("Não foi possível adicionar");
            }
          })
        }
        className="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-brand-soft"
      >
        + Adicionar experiência
      </button>
    </div>
  );
}
