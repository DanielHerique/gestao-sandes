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
      <h1 className="mb-4 text-xl font-semibold">Seu progresso</h1>

      <div className="rounded-lg border bg-surface p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-foreground/60">Nível atual</p>
            <p className="text-2xl font-semibold">{nivel.nome}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground/60">Pontos</p>
            <p className="text-2xl font-semibold">{pontos}</p>
          </div>
        </div>

        <p className="mt-2 text-sm text-foreground/60">{nivel.significado}</p>

        <div className="mt-4 h-2 rounded-full bg-line">
          <div
            className="h-2 rounded-full bg-brand"
            style={{ width: `${progressoNaFaixa}%` }}
          />
        </div>
        {proximo ? (
          <p className="mt-2 text-xs text-foreground/60">
            Faltam {faltam} pontos para {proximo.nome}
          </p>
        ) : (
          <p className="mt-2 text-xs text-foreground/60">Nível máximo alcançado</p>
        )}
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
