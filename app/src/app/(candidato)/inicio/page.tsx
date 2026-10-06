import Link from "next/link";
import { requireProfile } from "@/lib/auth/session";
import { carregarInicio } from "@/lib/data/inicio";
import { totalPontos } from "@/lib/data/pontuacao";
import { nivelAtual, pontosParaProximoNivel, proximoNivel } from "@/lib/gamification/pontos";
import { MENSAGENS_SISTEMA } from "@/lib/gamification/mensagens";

const ICONE_TL: Record<string, string> = {
  candidatura: "📋",
  status: "🔄",
  documento: "📄",
  curriculo: "🧠",
  exercicio: "✍️",
  pontos: "⭐",
};

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function InicioPage() {
  const profile = await requireProfile();
  const [dados, pontos] = await Promise.all([carregarInicio(profile.id), totalPontos(profile.id)]);
  const { estatisticas: est } = dados;

  const nivel = nivelAtual(pontos);
  const proximo = proximoNivel(pontos);
  const faltam = pontosParaProximoNivel(pontos);
  const faixa = proximo ? proximo.pontosMinimos - nivel.pontosMinimos : 1;
  const pct = proximo ? Math.min(100, ((pontos - nivel.pontosMinimos) / faixa) * 100) : 100;
  const primeiroNome = profile.nome.split(" ")[0];
  const conquistadas = dados.badges.filter((b) => b.conquistada).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Olá, {primeiroNome}</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {est.totalCandidaturas === 0
            ? MENSAGENS_SISTEMA.primeiro_acesso
            : MENSAGENS_SISTEMA.ritmo_mantido}
        </p>
      </div>

      <Link href="/progresso" className="block rounded-xl border bg-brand-soft p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs text-foreground/60">Seu nível</p>
            <p className="text-lg font-semibold">{nivel.nome}</p>
          </div>
          <p className="text-2xl font-semibold">
            {pontos} <span className="text-sm font-normal text-foreground/60">pts</span>
          </p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-background/70">
          <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          {proximo ? `Faltam ${faltam} pontos para ${proximo.nome}` : "Nível máximo alcançado"}
        </p>
      </Link>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Candidaturas no mês", String(est.candidaturasNoMes)],
          ["Total de candidaturas", String(est.totalCandidaturas)],
          ["Viraram entrevista", est.taxaResposta === null ? "—" : `${est.taxaResposta}%`],
          ["Tempo médio de resposta", est.tempoMedioRespostaDias === null ? "—" : `${est.tempoMedioRespostaDias} d`],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-xl border bg-surface p-4">
            <p className="text-xs text-foreground/60">{rotulo}</p>
            <p className="mt-1 text-2xl font-semibold">{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao titulo="Próximos passos">
          {dados.proximosPassos.length === 0 ? (
            <p className="text-sm text-foreground/60">Tudo em dia por aqui. Siga no seu ritmo.</p>
          ) : (
            <ul className="space-y-2">
              {dados.proximosPassos.slice(0, 6).map((p) => (
                <li key={p.texto}>
                  <Link
                    href={p.href}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm hover:bg-brand-soft"
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${p.prioridade === "alta" ? "bg-rose-500" : "bg-brand"}`}
                    />
                    <span>{p.texto}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo={`Conquistas · ${conquistadas}/${dados.badges.length}`}>
          <ul className="grid grid-cols-2 gap-2">
            {dados.badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-lg border p-3 text-xs ${b.conquistada ? "border-brand bg-brand-soft" : "opacity-50"}`}
              >
                <p className="text-base">{b.conquistada ? "🏅" : "🔒"}</p>
                <p className="mt-1 font-medium">{b.nome}</p>
                <p className="text-foreground/60">{b.descricao}</p>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <Cartao titulo="Linha do tempo">
        {dados.linhaDoTempo.length === 0 ? (
          <p className="text-sm text-foreground/60">Sua atividade vai aparecer aqui.</p>
        ) : (
          <ol className="space-y-3">
            {dados.linhaDoTempo.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span aria-hidden>{ICONE_TL[e.tipo]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{e.titulo}</p>
                  {e.detalhe && <p className="truncate text-foreground/60">{e.detalhe}</p>}
                </div>
                <span className="shrink-0 text-xs text-foreground/50">{dataCurta(e.quando)}</span>
              </li>
            ))}
          </ol>
        )}
      </Cartao>
    </div>
  );
}
