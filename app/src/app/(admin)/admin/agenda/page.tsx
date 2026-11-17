import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listarCandidatosAgenda, listarDisponibilidade, listarSessoesAdmin } from "@/lib/data/agenda";
import { statusConexao } from "@/lib/google/calendar";
import { Disponibilidade, GoogleCard, Liberacoes, SessoesAdmin } from "@/components/agenda/admin-agenda";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";

const TAMANHO = 10;
const ABAS = [
  { id: "proximas", rotulo: "Próximas sessões" },
  { id: "passadas", rotulo: "Histórico" },
  { id: "liberacoes", rotulo: "Liberar candidatos" },
  { id: "horarios", rotulo: "Horários e Google" },
] as const;
type AbaId = (typeof ABAS)[number]["id"];

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; pagina?: string; busca?: string; google?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const aba: AbaId = ABAS.find((a) => a.id === sp.aba)?.id ?? "proximas";
  const pagina = lerPagina(sp.pagina);
  const busca = sp.busca?.trim() ?? "";

  let conteudo: React.ReactNode;
  let total = 0;

  if (aba === "proximas" || aba === "passadas") {
    const r = await listarSessoesAdmin(aba, pagina, TAMANHO);
    total = r.total;
    conteudo = <SessoesAdmin sessoes={r.itens} />;
  } else if (aba === "liberacoes") {
    const r = await listarCandidatosAgenda(busca, pagina, TAMANHO);
    total = r.total;
    conteudo = (
      <>
        <form className="mb-4 flex gap-2" action="/admin/agenda">
          <input type="hidden" name="aba" value="liberacoes" />
          <input name="busca" defaultValue={busca} placeholder="Buscar por nome ou e-mail" aria-label="Buscar candidato" className="min-w-0 flex-1 px-3.5 py-2" />
          <button type="submit" className="min-h-11 rounded-xl border px-4 text-sm hover:bg-brand-soft">Buscar</button>
        </form>
        <Liberacoes candidatos={r.itens} />
      </>
    );
  } else {
    const [blocos, google] = await Promise.all([listarDisponibilidade(), statusConexao()]);
    conteudo = (
      <div className="space-y-6">
        <GoogleCard {...google} resultado={sp.google} />
        <Disponibilidade blocos={blocos} />
      </div>
    );
  }
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO));

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <p className="eyebrow">Mentoria</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Agenda</h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">
          Cada liberação vale para uma sessão. Os candidatos só veem horários livres, já cruzados com o seu Google Calendar.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <Link key={a.id} href={`/admin/agenda?aba=${a.id}`} className={`rounded-full border px-3.5 py-1.5 text-sm ${aba === a.id ? "border-transparent bg-ink text-ink-fg" : "hover:bg-brand-soft"}`}>
            {a.rotulo}
          </Link>
        ))}
      </div>
      {conteudo}
      {aba !== "horarios" && <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/admin/agenda" extra={{ aba, busca }} />}
    </div>
  );
}
