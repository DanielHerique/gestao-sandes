import { requireProfile } from "@/lib/auth/session";
import { listarEventosPontuacao, totalPontos } from "@/lib/data/pontuacao";
import {
  NIVEIS,
  nivelAtual,
  pontosParaProximoNivel,
  proximoNivel,
} from "@/lib/gamification/pontos";

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

export default async function ProgressoPage() {
  const profile = await requireProfile();
  const [pontos, eventos] = await Promise.all([
    totalPontos(profile.id),
    listarEventosPontuacao(profile.id),
  ]);

  const nivel = nivelAtual(pontos);
  const proximo = proximoNivel(pontos);
  const faltam = pontosParaProximoNivel(pontos);

  const faixaAtual = proximo ? proximo.pontosMinimos - nivel.pontosMinimos : 1;
  const progressoNaFaixa = proximo
    ? Math.min(100, ((pontos - nivel.pontosMinimos) / faixaAtual) * 100)
    : 100;

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">Jornada</p>
      <h1 className="mb-6 mt-2 text-3xl sm:text-4xl">Seu progresso</h1>

      <div
        className="relative overflow-hidden rounded-3xl bg-ink p-6 text-ink-fg sm:p-8"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242,172,10,.28) 0%, transparent 65%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow !text-brand">Nível atual</p>
            <p className="mt-2 font-display text-3xl font-semibold">{nivel.nome}</p>
            <p className="mt-1 text-sm text-ink-muted">{nivel.significado}</p>
          </div>
          <p className="num font-display text-6xl font-semibold leading-none">
            {pontos}
            <span className="ml-2 text-base font-normal text-ink-muted">pontos</span>
          </p>
        </div>
        <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-brand" style={{ width: `${progressoNaFaixa}%`, boxShadow: "0 0 18px rgba(242,172,10,.6)" }} />
        </div>
        <p className="relative mt-3 text-xs text-ink-muted">
          {proximo ? `Faltam ${faltam} pontos para ${proximo.nome}` : "Nível máximo alcançado"}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">
          Trilha de níveis
        </h2>
        <ol className="space-y-2">
          {NIVEIS.map((n) => (
            <li
              key={n.id}
              className={`rounded-md border p-3 text-sm ${
                n.ordem <= nivel.ordem
                  ? "border-brand bg-brand-soft"
                  : "border-line"
              }`}
            >
              <p className="font-medium">
                {n.ordem}. {n.nome}
              </p>
              <p className="text-foreground/60">{n.criterioAvanco}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">
          Linha do tempo de atividade
        </h2>
        {eventos.length === 0 ? (
          <p className="text-sm text-foreground/60">
            Nenhuma atividade registrada ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {eventos.map((evento) => (
              <li
                key={evento.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>{ACAO_LABEL[evento.acao] ?? evento.acao}</span>
                <span className="font-medium text-emerald-600">
                  +{evento.pontos}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
