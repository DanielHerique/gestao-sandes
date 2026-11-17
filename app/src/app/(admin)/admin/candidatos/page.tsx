import { requireAdmin } from "@/lib/auth/session";
import { carteiraPaginada } from "@/lib/data/admin";
import { CarteiraComFiltros } from "@/components/admin/carteira";
import { NovoMentorado } from "@/components/admin/novo-mentorado";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";

const TAMANHO = 12;

export default async function CarteiraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const filtros = { busca: um(sp.busca), plano: um(sp.plano), situacao: um(sp.situacao), ordem: um(sp.ordem) };
  const pagina = lerPagina(sp.pagina);

  const { linhas, total } = await carteiraPaginada({ ...filtros, pagina, tamanho: TAMANHO });
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Gestão</p>
          <h1 className="mb-1 mt-2 text-3xl sm:text-4xl">Carteira de candidatos</h1>
        </div>
        <NovoMentorado />
      </div>
      <p className="mb-6 text-sm text-foreground/60">
        Filtre por plano, situação de engajamento ou pendências.
      </p>
      <CarteiraComFiltros linhas={linhas} total={total} filtros={filtros} />
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/admin/candidatos" extra={filtros} />
    </div>
  );
}
