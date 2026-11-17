import { requireAdmin } from "@/lib/auth/session";
import { listarValidacoesPendentes } from "@/lib/data/validacoes";
import { ValidacoesLista } from "@/components/admin/validacoes-lista";

export default async function ValidacoesPage() {
  await requireAdmin();
  const itens = await listarValidacoesPendentes();

  return (
    <div>
      <p className="eyebrow">Gestão</p>
      <h1 className="mb-1 mt-2 text-3xl sm:text-4xl">Validações</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Candidaturas com perfis de recrutadores aguardando a indicação da Sandes. Ao confirmar, o checklist é marcado sozinho.
      </p>
      <ValidacoesLista itens={itens} />
    </div>
  );
}
