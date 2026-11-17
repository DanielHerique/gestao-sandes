import { requireAdmin } from "@/lib/auth/session";
import { obterRegrasParaEdicao } from "@/lib/data/gamificacao-admin";
import { RegrasForm } from "@/components/admin/regras-form";

export default async function GamificacaoAdminPage() {
  await requireAdmin();
  const { linhas, config } = await obterRegrasParaEdicao();
  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Configuração</p>
      <h1 className="mb-1 mt-2 text-3xl sm:text-4xl">Regras de gamificação</h1>
      <p className="mb-8 max-w-2xl text-sm text-foreground/60">
        Ajuste pontos, limites diários, níveis e prazos dos avisos sem depender de alteração no sistema.
        Pontos já conquistados nunca diminuem.
      </p>
      <RegrasForm linhasIniciais={linhas} configInicial={config} />
    </div>
  );
}
