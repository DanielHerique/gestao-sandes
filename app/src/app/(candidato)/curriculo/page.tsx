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
      <h1 className="mb-6 text-3xl sm:text-4xl">Analisador de currículo</h1>
      <UploadForm restante={LIMITE_ANALISES - usadas} />

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">
          Histórico de análises
        </h2>
        {analises.length === 0 ? (
          <p className="text-sm text-foreground/60">Nenhuma análise ainda.</p>
        ) : (
          <ul className="space-y-2">
            {analises.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border bg-surface p-4 text-sm"
              >
                {a.sucesso ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold">
                        Score {a.score_geral}/10
                      </span>
                      {a.aderencia_vaga != null && (
                        <span className="text-sm text-foreground/70">
                          Aderência à vaga: {a.aderencia_vaga}/10
                        </span>
                      )}
                    </div>
                    {a.sugestoes_cargos && a.sugestoes_cargos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground/60">Cargos compatíveis</p>
                        <p className="mt-1 flex flex-wrap gap-1.5">
                          {a.sugestoes_cargos.map((c) => (
                            <span key={c} className="rounded-full border px-2.5 py-0.5 text-xs">{c}</span>
                          ))}
                        </p>
                      </div>
                    )}
                    {a.pontos_melhoria && a.pontos_melhoria.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground/60">Pontos de melhoria</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                          {a.pontos_melhoria.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-rose-600">
                    Falha na análise: {a.erro_mensagem}
                  </p>
                )}
                <p className="mt-1 text-xs text-foreground/50">
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
