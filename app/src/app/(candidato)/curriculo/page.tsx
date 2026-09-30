import { requireProfile } from "@/lib/auth/session";
import {
  LIMITE_ANALISES,
  contarAnalisesBemSucedidas,
  listarAnalises,
} from "@/lib/data/curriculo";
import { UploadForm } from "@/components/curriculo/upload-form";

export default async function CurriculoPage() {
  const profile = await requireProfile();
  const [usadas, analises] = await Promise.all([
    contarAnalisesBemSucedidas(profile.id),
    listarAnalises(profile.id),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Analisador de currículo</h1>
      <UploadForm restante={LIMITE_ANALISES - usadas} />

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">
          Histórico de análises
        </h2>
        {analises.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhuma análise ainda.</p>
        ) : (
          <ul className="space-y-2">
            {analises.map((a) => (
              <li
                key={a.id}
                className="rounded-md border p-3 text-sm dark:border-neutral-800"
              >
                {a.sucesso ? (
                  <>
                    <p className="font-medium">Score: {a.score_geral}</p>
                    {a.sugestoes_cargos && a.sugestoes_cargos.length > 0 && (
                      <p className="text-neutral-500">
                        Cargos sugeridos: {a.sugestoes_cargos.join(", ")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-rose-600">
                    Falha na análise: {a.erro_mensagem}
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(a.created_at).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
