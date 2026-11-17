import { requireProfile } from "@/lib/auth/session";
import { listarEventosPaginados, totalPontos } from "@/lib/data/pontuacao";
import { carregarNiveis } from "@/lib/gamification/regras";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";
import {
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
  candidatura_fechada: "Candidatura aprovada",
  sequencia_5_dias_bonus: "Bônus de constância",
};

const TAMANHO = 10;

export default async function ProgressoPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const profile = await requireProfile();
  const pagina = lerPagina((await searchParams).pagina);
  const [pontos, { itens: eventos, total: totalEventos }] = await Promise.all([
    totalPontos(profile.id),
    listarEventosPaginados(profile.id, { pagina, tamanho: TAMANHO }),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(totalEventos / TAMANHO));

  const niveis = await carregarNiveis();
  const nivel = nivelAtual(pontos, niveis);
  const proximo = proximoNivel(pontos, niveis);
  const faltam = pontosParaProximoNivel(pontos, niveis);

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
        <div className="relative mt-8 h-2 overflow-hidden rounded-full bg-ink-2">
          <div className="h-full rounded-full bg-brand" style={{ width: `${progressoNaFaixa}%` }} />
        </div>
        <p className="relative mt-3 text-xs text-ink-muted">
          {proximo ? `Faltam ${faltam} pontos para você alcançar o próximo passo: ${proximo.nome}` : "Você chegou ao último nível da trilha. Parabéns pela jornada."}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">
          Trilha de níveis
        </h2>
        <ol className="space-y-2">
          {niveis.map((n) => (
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
                {proximo && n.id === proximo.id && (
                  <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-brand-fg">Próximo passo</span>
                )}
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
                <span className="font-medium text-success">
                  +{evento.pontos}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/progresso" />
      </div>
    </div>
  );
}
