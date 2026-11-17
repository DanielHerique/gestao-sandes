import { requireProfile } from "@/lib/auth/session";
import { candidatoLiberado, horariosLivres, listarSessoesDoCandidato, proximaSessao } from "@/lib/data/agenda";
import { EscolherHorario, ListaSessoes } from "@/components/agenda/candidato-agenda";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";
import { formatarDataHora } from "@/lib/agenda";

const TAMANHO = 8;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const profile = await requireProfile();
  const pagina = lerPagina((await searchParams).pagina);
  const [liberado, proxima, historico] = await Promise.all([
    candidatoLiberado(profile.id),
    proximaSessao(profile.id),
    listarSessoesDoCandidato(profile.id, pagina, TAMANHO),
  ]);
  const slots = liberado && !proxima ? await horariosLivres() : [];
  const totalPaginas = Math.max(1, Math.ceil(historico.total / TAMANHO));

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <p className="eyebrow">Mentoria</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Agenda</h1>
      </header>

      {proxima && (
        <div className="rounded-3xl bg-ink p-6 text-ink-fg" style={{ boxShadow: "var(--shadow-lift)" }}>
          <p className="eyebrow !text-brand">Próxima sessão</p>
          <p className="mt-2 font-display text-2xl capitalize">{formatarDataHora(proxima.inicio)}</p>
          {proxima.meet_link && (
            <a href={proxima.meet_link} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm text-brand-fg">Entrar na videochamada</a>
          )}
        </div>
      )}

      {!proxima && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground/60">Marcar uma sessão</h2>
          {liberado ? (
            <EscolherHorario slots={slots} />
          ) : (
            <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/60">
              O agendamento ainda não está liberado. Quando a consultoria liberar, você recebe um aviso e os horários aparecem aqui.
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Minhas sessões</h2>
        <ListaSessoes sessoes={historico.itens} />
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/agenda" />
      </section>
    </div>
  );
}
