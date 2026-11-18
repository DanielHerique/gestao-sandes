"use client";

import { useState, useTransition } from "react";
import { gerarRaioXAction, type RaioXVaga } from "@/app/(candidato)/raio-x/actions";
import { useFeedback } from "@/components/ui/feedback";

function Bloco({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="text-lg">{titulo}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

export function RaioXForm() {
  const [vaga, setVaga] = useState("");
  const [resumo, setResumo] = useState("");
  const [dados, setDados] = useState<RaioXVaga | null>(null);
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  function gerar() {
    startTransition(async () => {
      const r = await gerarRaioXAction(vaga, resumo);
      if (r.ok) setDados(r.dados);
      else fb.erro("Não foi possível gerar", r.mensagem);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-surface p-5">
        <label className="block text-sm font-semibold">
          Descrição da vaga
          <textarea
            value={vaga}
            onChange={(e) => setVaga(e.target.value)}
            rows={8}
            maxLength={8000}
            className="mt-1 w-full p-3 font-normal"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">Cole o texto completo do anúncio.</span>
        </label>
        <label className="block text-sm font-semibold">
          Seu resumo profissional (opcional)
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={4}
            maxLength={3000}
            className="mt-1 w-full p-3 font-normal"
          />
          <span className="mt-1 block text-xs font-normal text-foreground/60">
            Com ele, o raio-x mostra onde você já combina com a vaga e o que falta mostrar.
          </span>
        </label>
        <button
          type="button"
          onClick={gerar}
          disabled={pending || vaga.trim().length < 80}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-brand-fg disabled:bg-neutral disabled:text-foreground/60"
        >
          {pending ? "Analisando..." : "Gerar raio-x"}
        </button>
      </div>

      {dados && (
        <div className="space-y-4">
          <section className="rounded-2xl bg-ink p-5 text-ink-fg">
            <p className="eyebrow !text-brand">O que a empresa busca</p>
            <p className="mt-2">{dados.resumo}</p>
          </section>
          <Bloco titulo="Requisitos essenciais" itens={dados.requisitos} />
          <Bloco titulo="Palavras-chave para o currículo" itens={dados.palavrasChave} />
          <Bloco titulo="O que já funciona" itens={dados.pontosFortes} />
          <Bloco titulo="O que ajustar" itens={dados.lacunas} />
          <Bloco titulo="Como adaptar seu currículo" itens={dados.comoAdaptar} />
          <Bloco titulo="Diferenciais" itens={dados.diferenciais} />
          <Bloco titulo="Pontos de atenção" itens={dados.sinaisDeAtencao} />
          <Bloco titulo="Perguntas prováveis na entrevista" itens={dados.perguntasProvaveis} />
          <p className="rounded-2xl bg-premium p-4 text-sm">
            <span className="font-bold">A IA aponta, a mentoria decide.</span> Leve este raio-x para a próxima sessão.
          </p>
        </div>
      )}
    </div>
  );
}
