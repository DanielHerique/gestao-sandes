"use client";

import { useFeedback } from "@/components/ui/feedback";

import { useState, useTransition } from "react";
import type {
  ExercicioAutoconhecimento,
  ExercicioStatus,
} from "@/lib/types/database";
import { salvarAutoconhecimentoAction } from "@/app/(candidato)/exercicios/actions";

type CampoTexto = Exclude<
  keyof ExercicioAutoconhecimento,
  "candidato_id" | "status" | "updated_at" | "empresas_alvo"
>;

const PERGUNTAS: { campo: CampoTexto; label: string }[] = [
  { campo: "autopercepcao", label: "Como você se percebe profissionalmente?" },
  { campo: "feedback_externo", label: "Que feedback você já recebeu de outras pessoas?" },
  { campo: "talentos", label: "Quais são seus talentos naturais?" },
  { campo: "competencias", label: "Quais competências você mais desenvolveu?" },
  { campo: "motivadores", label: "O que te motiva no trabalho?" },
  { campo: "pergunta_6", label: "O que você faz melhor do que a maioria?" },
  { campo: "pergunta_7", label: "Em que contexto você entrega seu melhor?" },
  { campo: "pergunta_8", label: "O que você quer evitar na próxima etapa da carreira?" },
];

export function Autoconhecimento({
  dadosIniciais,
}: {
  dadosIniciais: ExercicioAutoconhecimento | null;
}) {
  const [dados, setDados] = useState<Partial<ExercicioAutoconhecimento>>(
    dadosIniciais ?? {},
  );
  const [empresas, setEmpresas] = useState(
    (dadosIniciais?.empresas_alvo ?? []).join(", "),
  );
  const [pending, startTransition] = useTransition();
  const statusAnterior: ExercicioStatus = dadosIniciais?.status ?? "nao_iniciado";
  const fb = useFeedback();

  function handleChange(campo: CampoTexto, valor: string) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar(status: ExercicioStatus) {
    if (status === "concluido") {
      const ok = await fb.confirmar({
        titulo: "Concluir o Autoconhecimento",
        descricao: "Você poderá rever as respostas depois. A conclusão é registrada para a consultoria.",
        rotuloConfirmar: "Concluir exercício",
      });
      if (!ok) return;
    }
    const payload = {
      ...dados,
      status,
      empresas_alvo: empresas
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .slice(0, 10),
    };
    setDados(payload);
    startTransition(async () => {
      try {
        await salvarAutoconhecimentoAction(payload, statusAnterior);
        fb.sucesso(status === "concluido" ? "Exercício concluído" : "Progresso salvo");
      } catch {
        fb.erro("Não foi possível salvar", "Suas respostas continuam na tela.");
      }
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-foreground/60">
        Aprofundando o Autoconhecimento — módulo de Autoconhecimento (Essência
        & Propósito).
      </p>

      <div className="space-y-4">
        {PERGUNTAS.map((p) => (
          <div
            key={p.campo}
            className="rounded-lg border bg-surface p-4"
          >
            <label className="mb-1 block text-sm font-medium">
              {p.label}
            </label>
            <textarea
              defaultValue={dados[p.campo] ?? ""}
              onBlur={(e) => handleChange(p.campo, e.target.value)}
              rows={2}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </div>
        ))}

        <div className="rounded-lg border bg-surface p-4">
          <label className="mb-1 block text-sm font-medium">
            Lista de até 10 empresas-alvo (separadas por vírgula)
          </label>
          <input
            value={empresas}
            onChange={(e) => setEmpresas(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={pending}
          onClick={() => salvar("em_andamento")}
          className="rounded-md border px-4 py-2 text-sm hover:bg-brand-soft"
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
