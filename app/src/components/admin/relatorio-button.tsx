"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { useFeedback } from "@/components/ui/feedback";
import { gerarRelatorioAction } from "@/app/(admin)/admin/candidatos/[id]/relatorio-actions";

export function RelatorioButton({ candidatoId }: { candidatoId: string }) {
  const [pending, setPending] = useState(false);
  const fb = useFeedback();

  async function handleClick() {
    setPending(true);
    try {
      const relatorio = await gerarRelatorioAction(candidatoId);
      const { gerarPdfRelatorio } = await import("@/lib/pdf/relatorio-pdf");
      await gerarPdfRelatorio(relatorio);
      fb.sucesso("Relatório gerado", "O PDF foi baixado no seu computador.");
    } catch {
      fb.erro("Não foi possível gerar o relatório", "Tente novamente em instantes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-medium text-ink-fg disabled:opacity-60"
    >
      <Icon name="documentos" className="h-4 w-4 text-brand" />
      {pending ? "Gerando..." : "Exportar relatório (PDF)"}
    </button>
  );
}
