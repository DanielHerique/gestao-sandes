"use client";

import { useState } from "react";
import { gerarRelatorioAction } from "@/app/(admin)/admin/candidatos/[id]/relatorio-actions";
import type { RelatorioEngajamento } from "@/lib/data/relatorio";

const ACAO_LABEL: Record<string, string> = {
  candidatura_criada: "Nova candidatura registrada",
  checklist_item_marcado: "Item do checklist concluído",
  status_mudou_para_entrevista: "Candidatura avançou para Entrevista",
  status_atualizado_apos_5_dias_parado: "Status atualizado após período parado",
  analise_curriculo_concluida: "Análise de currículo concluída",
  melhoria_aplicada_reupload_curriculo: "Melhoria de currículo aplicada",
  documento_assinado_no_prazo: "Documento assinado no prazo",
  exercicio_estruturado_concluido: "Exercício estruturado concluído",
  sessao_mentoria_realizada: "Sessão de mentoria realizada",
  candidatura_fechada: "Candidatura fechada com sucesso",
  sequencia_5_dias_bonus: "Bônus de constância",
};

async function gerarPdf(relatorio: RelatorioEngajamento) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("Relatório de engajamento — Sandes Consultoria & RH", 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Candidato: ${relatorio.candidatoNome}`, 14, y);
  y += 6;
  doc.text(`E-mail: ${relatorio.candidatoEmail}`, 14, y);
  y += 6;
  doc.text(`Plano: ${relatorio.plano}`, 14, y);
  y += 6;
  doc.text(`Nível: ${relatorio.nivel} (${relatorio.pontos} pontos)`, 14, y);
  y += 10;

  doc.setFontSize(13);
  doc.text("Candidaturas", 14, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`Total: ${relatorio.totalCandidaturas}`, 14, y);
  y += 6;
  for (const [status, count] of Object.entries(relatorio.candidaturasPorStatus)) {
    doc.text(`  ${status}: ${count}`, 14, y);
    y += 6;
  }
  y += 4;

  doc.setFontSize(13);
  doc.text("Documentos pendentes de assinatura", 14, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`${relatorio.documentosPendentes}`, 14, y);
  y += 10;

  doc.setFontSize(13);
  doc.text("Últimos eventos de engajamento", 14, y);
  y += 7;
  doc.setFontSize(10);
  for (const evento of relatorio.ultimosEventos) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const data = new Date(evento.data).toLocaleDateString("pt-BR");
    doc.text(
      `${data} — ${ACAO_LABEL[evento.acao] ?? evento.acao} (+${evento.pontos})`,
      14,
      y,
    );
    y += 6;
  }

  y += 6;
  doc.setFontSize(9);
  doc.text(
    `Gerado em ${new Date(relatorio.geradoEm).toLocaleString("pt-BR")}`,
    14,
    y,
  );

  doc.save(`relatorio-${relatorio.candidatoNome.replace(/\s+/g, "-")}.pdf`);
}

export function RelatorioButton({ candidatoId }: { candidatoId: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const relatorio = await gerarRelatorioAction(candidatoId);
      await gerarPdf(relatorio);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-brand-soft disabled:opacity-50"
    >
      {pending ? "Gerando..." : "Exportar relatório (PDF)"}
    </button>
  );
}
