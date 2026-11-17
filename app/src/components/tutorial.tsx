"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { marcarTutorialVistoAction } from "@/app/(candidato)/tutorial-actions";

const EVENTO = "abrir-tutorial";

const PASSOS = [
  {
    titulo: "Pontos e níveis",
    texto:
      "Cada ação sua na plataforma gera pontos. Os pontos fazem você subir de nível, e o painel sempre mostra quanto falta para o próximo passo.",
  },
  {
    titulo: "Cadastre suas candidaturas",
    texto:
      "Em Candidaturas, registre cada vaga e acompanhe em quatro colunas: Em andamento, Entrevistas, Aprovado e Reprovado. Arraste o cartão ou use o seletor para mover.",
  },
  {
    titulo: "Siga o checklist",
    texto:
      "Cada candidatura tem quatro etapas: currículo enviado, seguir a página da empresa, solicitar conexão ao recrutador e a indicação da Sandes. A indicação é marcada pela sua mentora.",
  },
  {
    titulo: "Currículo com IA",
    texto: "Envie seu currículo em Currículo (IA) para receber uma análise com pontos de melhoria. Aplicar as melhorias também pontua.",
  },
  {
    titulo: "Documentos",
    texto: "Em Documentos ficam os arquivos da consultoria. Assinar dentro do prazo gera pontos e mantém tudo em dia.",
  },
];

export function BotaoComoFunciona() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENTO))}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-ink-fg transition-colors hover:bg-white/10"
    >
      <Icon name="ajuda" className="h-[18px] w-[18px]" />
      Como funciona
    </button>
  );
}

export function Tutorial({ jaVisto }: { jaVisto: boolean }) {
  const [aberto, setAberto] = useState(!jaVisto);
  const [passo, setPasso] = useState(0);
  const [registrado, setRegistrado] = useState(jaVisto);

  useEffect(() => {
    const abrir = () => {
      setPasso(0);
      setAberto(true);
    };
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  function fechar() {
    setAberto(false);
    if (!registrado) {
      setRegistrado(true);
      marcarTutorialVistoAction().catch(() => setRegistrado(false));
    }
  }

  const ultimo = passo === PASSOS.length - 1;
  const atual = PASSOS[passo];

  return (
    <Modal
      aberto={aberto}
      onFechar={fechar}
      titulo="Como funciona"
      subtitulo={`Passo ${passo + 1} de ${PASSOS.length}`}
      rodape={
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={fechar} className="min-h-11 rounded-xl px-3 text-sm text-foreground/60 hover:text-foreground">
            Pular
          </button>
          <div className="flex gap-2">
            {passo > 0 && (
              <button type="button" onClick={() => setPasso(passo - 1)} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={() => (ultimo ? fechar() : setPasso(passo + 1))}
              className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg"
            >
              {ultimo ? "Começar" : "Próximo"}
            </button>
          </div>
        </div>
      }
    >
      <h3 className="font-display text-2xl">{atual.titulo}</h3>
      <p className="mt-3 text-foreground/70">{atual.texto}</p>
      <div className="mt-6 flex gap-1.5" aria-hidden>
        {PASSOS.map((p, i) => (
          <span key={p.titulo} className={`h-1.5 flex-1 rounded-full ${i <= passo ? "bg-brand" : "bg-foreground/10"}`} />
        ))}
      </div>
    </Modal>
  );
}
