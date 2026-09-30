import { requireProfile } from "@/lib/auth/session";
import { obterModulosDoPlano, obterPlanoAtivo } from "@/lib/data/planos";
import {
  listarListaMestra,
  listarPdi5w2h,
  listarPdiMetas,
  obterAutoconhecimento,
  obterShazam,
  obterStatusPdi,
} from "@/lib/data/exercicios";
import { ExerciciosTabs } from "@/components/exercicios/exercicios-tabs";

export default async function ExerciciosPage() {
  const profile = await requireProfile();
  const planoAtivo = await obterPlanoAtivo(profile.id);
  const modulos = planoAtivo ? await obterModulosDoPlano(planoAtivo.plano) : null;
  const autoconhecimentoLiberado = modulos?.autoconhecimento ?? false;

  const [listaMestra, shazam, autoconhecimento, pdiMetas, pdi5w2h, pdiStatus] =
    await Promise.all([
      listarListaMestra(profile.id),
      obterShazam(profile.id),
      obterAutoconhecimento(profile.id),
      listarPdiMetas(profile.id),
      listarPdi5w2h(profile.id),
      obterStatusPdi(profile.id),
    ]);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold">Exercícios estruturados</h1>
      {!planoAtivo && (
        <p className="mb-4 text-sm text-amber-600">
          Nenhum plano contratado atribuído ainda — apenas a Lista Mestra está
          disponível.
        </p>
      )}
      <div className="mt-4">
        <ExerciciosTabs
          autoconhecimentoLiberado={autoconhecimentoLiberado}
          listaMestra={listaMestra}
          shazam={shazam}
          autoconhecimento={autoconhecimento}
          pdiMetas={pdiMetas}
          pdi5w2h={pdi5w2h}
          pdiStatus={pdiStatus}
        />
      </div>
    </div>
  );
}
