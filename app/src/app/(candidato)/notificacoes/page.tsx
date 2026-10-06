import { requireProfile } from "@/lib/auth/session";
import { listarNotificacoes } from "@/lib/data/notificacoes";
import { NotificacaoItem } from "@/components/notificacoes/notificacao-item";
import { Paginacao, lerPagina } from "@/components/ui/paginacao";

const TAMANHO = 10;

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const profile = await requireProfile();
  const pagina = lerPagina((await searchParams).pagina);
  const { itens, total } = await listarNotificacoes(profile.id, { pagina, tamanho: TAMANHO });
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO));

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Avisos</p>
      <h1 className="mb-6 mt-2 text-3xl sm:text-4xl">Notificações</h1>
      {itens.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-foreground/60">
          Nenhuma notificação por aqui.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {itens.map((n) => (
            <NotificacaoItem key={n.id} notificacao={n} />
          ))}
        </ul>
      )}
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} caminho="/notificacoes" />
    </div>
  );
}
