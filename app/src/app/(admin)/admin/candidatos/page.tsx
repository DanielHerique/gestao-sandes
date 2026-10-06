import { requireAdmin } from "@/lib/auth/session";
import { listarCarteira, paraLinhasCarteira } from "@/lib/data/admin";
import { CarteiraComFiltros } from "@/components/admin/carteira";

export default async function CarteiraPage() {
  await requireAdmin();
  const carteira = await listarCarteira();

  return (
    <div>
      <h1 className="mb-1 text-3xl sm:text-4xl">Carteira de candidatos</h1>
      <p className="mb-4 text-sm text-foreground/60">
        Filtre por plano, situação de engajamento ou pendências.
      </p>
      <CarteiraComFiltros linhas={paraLinhasCarteira(carteira)} />
    </div>
  );
}
