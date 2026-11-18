"use client";

import { useState, useTransition } from "react";
import { useFeedback } from "@/components/ui/feedback";
import { ACAO_ROTULO } from "@/lib/gamification/rotulos";
import { salvarRegrasAction } from "@/app/(admin)/admin/gamificacao/actions";
import type { LinhaRegra } from "@/lib/data/gamificacao-admin";
import type { ConfigGamificacao } from "@/lib/gamification/regras";

function Numero({
  valor,
  onChange,
  rotulo,
  vazioPermitido,
}: {
  valor: number | null;
  onChange: (v: number | null) => void;
  rotulo: string;
  vazioPermitido?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      aria-label={rotulo}
      value={valor ?? ""}
      placeholder={vazioPermitido ? "sem limite" : "0"}
      onChange={(e) => {
        const t = e.target.value;
        if (t === "") return onChange(vazioPermitido ? null : 0);
        onChange(Math.max(0, Number(t)));
      }}
      className="num w-full px-3 py-1.5"
    />
  );
}

export function RegrasForm({ linhasIniciais, configInicial }: { linhasIniciais: LinhaRegra[]; configInicial: ConfigGamificacao }) {
  const [linhas, setLinhas] = useState(linhasIniciais);
  const [config, setConfig] = useState(configInicial);
  const [pending, startTransition] = useTransition();
  const fb = useFeedback();

  const alterado = JSON.stringify(linhas) !== JSON.stringify(linhasIniciais) || JSON.stringify(config) !== JSON.stringify(configInicial);

  function setLinha(acao: string, campos: Partial<LinhaRegra>) {
    setLinhas((prev) => prev.map((l) => (l.acao === acao ? { ...l, ...campos } : l)));
  }
  const setCfg = (k: keyof ConfigGamificacao, v: number) => setConfig((c) => ({ ...c, [k]: v }));

  async function salvar() {
    const ok = await fb.confirmar({
      titulo: "Salvar regras de gamificação",
      descricao: "As novas regras valem para todos os candidatos a partir de agora. Pontos já conquistados não mudam, mas os níveis são recalculados com os novos limites.",
      rotuloConfirmar: "Salvar regras",
      digitar: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await salvarRegrasAction(linhas, config);
        fb.sucesso("Regras salvas", "Já estão valendo para todos os candidatos.");
      } catch (e) {
        fb.erro("Não foi possível salvar", e instanceof Error ? e.message : undefined);
      }
    });
  }

  const niveis: [keyof ConfigGamificacao, string][] = [
    ["nivel_2_pontos", "2. Direção Clara"],
    ["nivel_3_pontos", "3. História de Valor"],
    ["nivel_4_pontos", "4. Presença Estratégica"],
    ["nivel_5_pontos", "5. Movimento Seguro"],
  ];
  const avisos: [keyof ConfigGamificacao, string, string][] = [
    ["aviso_dias_sem_cadastrar", "Aviso de inatividade", "dias sem cadastrar candidatura"],
    ["aviso_dias_candidatura_parada", "Aviso de candidatura parada", "dias no mesmo status"],
    ["bonus_dias_parada", "Bônus por atualizar o funil", "dias parada para valer o bônus"],
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Pontos por ação</h2>
        <ul className="space-y-2.5">
          {linhas.map((l) => (
            <li key={l.acao} className={`rounded-2xl border bg-surface p-4 ${l.ativo ? "" : "opacity-60"}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ACAO_ROTULO[l.acao].titulo}</p>
                  <p className="text-xs text-foreground/55">{ACAO_ROTULO[l.acao].ajuda}</p>
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 lg:w-[26rem]">
                  <label className="block text-xs text-foreground/60">
                    Pontos
                    <Numero rotulo={`Pontos de ${ACAO_ROTULO[l.acao].titulo}`} valor={l.pontos} onChange={(v) => setLinha(l.acao, { pontos: v ?? 0 })} />
                  </label>
                  <label className="block text-xs text-foreground/60">
                    Limite por dia
                    <Numero vazioPermitido rotulo={`Limite diário de ${ACAO_ROTULO[l.acao].titulo}`} valor={l.limiteDiario} onChange={(v) => setLinha(l.acao, { limiteDiario: v })} />
                  </label>
                  <label className="flex min-h-10 items-center gap-2 pb-0.5 text-xs">
                    <input type="checkbox" checked={l.ativo} onChange={(e) => setLinha(l.acao, { ativo: e.target.checked })} />
                    Ativa
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Pontos para chegar a cada nível</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {niveis.map(([k, nome]) => (
            <label key={k} className="block rounded-2xl border bg-surface p-4 text-sm">
              <span className="mb-2 block font-medium">{nome}</span>
              <Numero rotulo={nome} valor={config[k]} onChange={(v) => setCfg(k, v ?? 0)} />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-foreground/55">O nível 1 (Ponto de Partida) começa em 0. Cada limite precisa ser maior que o anterior.</p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Avisos automáticos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {avisos.map(([k, titulo, legenda]) => (
            <label key={k} className="block rounded-2xl border bg-surface p-4 text-sm">
              <span className="block font-medium">{titulo}</span>
              <span className="mb-2 block text-xs text-foreground/55">{legenda}</span>
              <Numero rotulo={titulo} valor={config[k]} onChange={(v) => setCfg(k, v ?? 0)} />
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-3 flex justify-end">
        <button
          type="button"
          onClick={salvar}
          disabled={pending || !alterado}
          className="min-h-12 rounded-2xl bg-brand px-8 text-sm text-brand-fg disabled:bg-neutral disabled:text-foreground/60 disabled:shadow-none"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          {pending ? "Salvando..." : alterado ? "Salvar regras" : "Nenhuma alteração"}
        </button>
      </div>
    </div>
  );
}
