import Link from "next/link";
import { Icon } from "@/components/icons";
import { VerMais } from "@/components/ui/ver-mais";
import { requireProfile } from "@/lib/auth/session";
import { carregarInicio } from "@/lib/data/inicio";
import { totalPontos } from "@/lib/data/pontuacao";
import { nivelAtual, pontosParaProximoNivel, proximoNivel } from "@/lib/gamification/pontos";
import { MENSAGENS_SISTEMA } from "@/lib/gamification/mensagens";

const ICONE_TL: Record<string, string> = {
  candidatura: "candidaturas",
  status: "status",
  documento: "documentos",
  curriculo: "curriculo",
  exercicio: "exercicios",
  pontos: "estrela",
};

function Cartao({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
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

  const numeros: [string, string, string][] = [
    ["No mês", String(est.candidaturasNoMes), "candidaturas"],
    ["Total", String(est.totalCandidaturas), "candidaturas"],
    ["Avançaram", est.taxaResposta === null ? "—" : `${est.taxaResposta}%`, "viraram entrevista"],
    ["Resposta", est.tempoMedioRespostaDias === null ? "—" : `${String(est.tempoMedioRespostaDias).replace(".", ",")}d`, "tempo médio"],
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Seu painel</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Olá, {primeiroNome}</h1>
        <p className="mt-3 max-w-xl text-foreground/60">
          {est.totalCandidaturas === 0 ? MENSAGENS_SISTEMA.primeiro_acesso : MENSAGENS_SISTEMA.ritmo_mantido}
        </p>
      </header>

      {/* Nível: cartão escuro de destaque */}
      <Link
        href="/progresso"
        className="group relative block overflow-hidden rounded-3xl bg-ink p-6 text-ink-fg sm:p-8"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242,172,10,.28) 0%, transparent 65%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow !text-brand">Nível atual</p>
            <p className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{nivel.nome}</p>
            <p className="mt-1 text-sm text-ink-muted">{nivel.significado}</p>
          </div>
          <p className="num font-display text-6xl font-semibold leading-none sm:text-7xl">
            {pontos}
            <span className="ml-2 text-base font-normal text-ink-muted">pontos</span>
          </p>
        </div>
        <div className="relative mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%`, boxShadow: "0 0 18px rgba(242,172,10,.6)" }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
            <span>{proximo ? `Faltam ${faltam} pontos para ${proximo.nome}` : "Nível máximo alcançado"}</span>
            <span className="inline-flex items-center gap-1 text-ink-fg transition-transform group-hover:translate-x-0.5">
              Ver trilha <Icon name="seta" className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {numeros.map(([rotulo, valor, legenda]) => (
          <div key={rotulo} className="rounded-2xl border bg-surface p-5">
            <p className="eyebrow !text-foreground/50">{rotulo}</p>
            <p className="num mt-3 font-display text-4xl font-semibold leading-none">{valor}</p>
            <p className="mt-2 text-xs text-foreground/50">{legenda}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Próximos passos">
          {dados.proximosPassos.length === 0 ? (
            <p className="text-sm text-foreground/60">Tudo em dia por aqui. Siga no seu ritmo.</p>
          ) : (
            <ul className="space-y-2">
              {dados.proximosPassos.slice(0, 6).map((p) => (
                <li key={p.texto}>
                  <Link
                    href={p.href}
                    className="group flex items-center gap-3 rounded-xl border p-3.5 text-sm transition-colors hover:border-brand hover:bg-brand-soft"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${p.prioridade === "alta" ? "bg-rose-500" : "bg-brand"}`}
                    />
                    <span className="flex-1">{p.texto}</span>
                    <Icon
                      name="seta"
                      className="h-4 w-4 shrink-0 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-strong"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao
          titulo="Conquistas"
          acao={<span className="num text-sm text-foreground/50">{conquistadas} de {dados.badges.length}</span>}
        >
          <ul className="grid grid-cols-2 gap-3">
            {dados.badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-xl border p-3.5 ${b.conquistada ? "border-transparent bg-brand-soft" : "opacity-55"}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    b.conquistada ? "bg-brand text-brand-fg" : "bg-foreground/5 text-foreground/50"
                  }`}
                >
                  <Icon name={b.conquistada ? "medalha" : "cadeado"} className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-3 text-sm font-medium leading-snug">{b.nome}</p>
                <p className="mt-0.5 text-xs text-foreground/55">{b.descricao}</p>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <Cartao titulo="Linha do tempo">
        {dados.linhaDoTempo.length === 0 ? (
          <p className="text-sm text-foreground/60">Sua atividade vai aparecer aqui.</p>
        ) : (
          <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-line">
            <VerMais inicial={6} passo={6} rotulo="Ver mais atividades">
            {dados.linhaDoTempo.map((e, i) => (
              <li key={i} className="relative flex gap-4">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-surface text-brand-strong">
                  <Icon name={ICONE_TL[e.tipo]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-medium">{e.titulo}</p>
                  {e.detalhe && <p className="truncate text-sm text-foreground/55">{e.detalhe}</p>}
                </div>
                <span className="num shrink-0 pt-1 text-xs text-foreground/45">{dataCurta(e.quando)}</span>
              </li>
            ))}
            </VerMais>
          </ol>
        )}
      </Cartao>
    </div>
  );
}
