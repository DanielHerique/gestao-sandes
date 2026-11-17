import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { contarPendentes, listarItens, listarResgatesAdmin } from "@/lib/data/loja";
import { FilaResgates, ListaItens, NovoItemForm } from "@/components/admin/loja-admin";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";
import type { ResgateStatus } from "@/lib/types/database";

const TAMANHO = 10;
const ABAS: { id: ResgateStatus | "todos"; rotulo: string }[] = [
  { id: "pendente", rotulo: "Pendentes" },
  { id: "aprovado", rotulo: "Aprovados" },
  { id: "concluido", rotulo: "Concluídos" },
  { id: "recusado", rotulo: "Recusados" },
  { id: "todos", rotulo: "Todos" },
];

export default async function AdminLojaPage({ searchParams }: { searchParams: Promise<{ pagina?: string; fila?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const fila = (ABAS.find((a) => a.id === sp.fila)?.id ?? "pendente") as ResgateStatus | "todos";
  const pagina = lerPagina(sp.pagina);

  const [itens, pedidos, pendentes] = await Promise.all([
    listarItens({ somenteAtivos: false }),
    listarResgatesAdmin(fila, pagina, TAMANHO),
    contarPendentes(),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pedidos.total / TAMANHO));

  return (
    <div className="max-w-5xl space-y-10">
      <header>
        <p className="eyebrow">Gamificação</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Loja de recompensas</h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground/60">
          Defina os benefícios, o custo em pontos e a cota mensal. Os pedidos não são automáticos: você aprova e organiza a entrega.
        </p>
      </header>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-sm font-semibold text-foreground/60">Pedidos</h2>
          {ABAS.map((a) => (
            <Link
              key={a.id}
              href={`/admin/loja?fila=${a.id}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${fila === a.id ? "border-transparent bg-ink text-ink-fg" : "hover:bg-brand-soft"}`}
            >
              {a.rotulo}
              {a.id === "pendente" && pendentes > 0 && <span className="num ml-1.5 rounded-full bg-brand px-1.5 text-xs text-brand-fg">{pendentes}</span>}
            </Link>
          ))}
        </div>
        <FilaResgates pedidos={pedidos.itens} />
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/admin/loja" extra={{ fila }} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">Itens da loja</h2>
        <ListaItens itens={itens} />
      </section>

      <NovoItemForm />
    </div>
  );
}
