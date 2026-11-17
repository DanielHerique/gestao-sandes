import { requireProfile } from "@/lib/auth/session";
import { listarItens, listarResgatesDoCandidato, obterSaldo } from "@/lib/data/loja";
import { ItensLoja } from "@/components/loja/itens-loja";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";
import { RESGATE_ROTULO, type ResgateStatus } from "@/lib/types/database";

const TAMANHO = 8;
const COR: Record<ResgateStatus, string> = {
  pendente: "bg-brand-soft text-brand-strong",
  aprovado: "bg-success-soft text-success",
  concluido: "bg-success-soft text-success",
  recusado: "bg-danger-soft text-danger",
};

export default async function LojaPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const profile = await requireProfile();
  const pagina = lerPagina((await searchParams).pagina);
  const [saldo, itens, historico] = await Promise.all([
    obterSaldo(profile.id),
    listarItens({ somenteAtivos: true }),
    listarResgatesDoCandidato(profile.id, pagina, TAMANHO),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(historico.total / TAMANHO));

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Recompensas</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Loja de benefícios</h1>
        <p className="mt-2 max-w-xl text-sm text-foreground/60">
          Troque pontos por benefícios reais da consultoria. Seu nível não muda quando você resgata: ele depende dos pontos acumulados.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-ink-fg sm:p-8" style={{ boxShadow: "var(--shadow-lift)" }}>
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow !text-brand">Saldo para resgate</p>
            <p className="num mt-2 font-display text-6xl font-semibold leading-none">
              {saldo.disponivel}
              <span className="ml-2 text-base font-normal text-ink-muted">pontos</span>
            </p>
          </div>
          <p className="text-sm text-ink-muted">
            {saldo.acumulados} acumulados · {saldo.gastos} em resgates
          </p>
        </div>
      </div>

      <ItensLoja itens={itens} saldo={saldo.disponivel} />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Meus resgates</h2>
        {historico.itens.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-sm text-foreground/55">Você ainda não resgatou nenhum benefício.</p>
        ) : (
          <ul className="space-y-2.5">
            {historico.itens.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 rounded-2xl border bg-surface p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{r.item_titulo}</p>
                  <p className="text-xs text-foreground/55">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")} · {r.pontos_debitados} pontos
                    {r.observacao_admin && ` · ${r.observacao_admin}`}
                  </p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${COR[r.status]}`}>{RESGATE_ROTULO[r.status]}</span>
              </li>
            ))}
          </ul>
        )}
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/loja" />
      </section>
    </div>
  );
}
