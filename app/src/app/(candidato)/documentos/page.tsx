import { requireProfile } from "@/lib/auth/session";
import { listarDocumentos } from "@/lib/data/documentos";
import { DocumentoCard } from "@/components/documentos/documento-card";

export default async function DocumentosPage() {
  const profile = await requireProfile();
  const documentos = await listarDocumentos(profile.id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Meus documentos</h1>
      {documentos.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Nenhum documento liberado pela consultoria ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <DocumentoCard key={doc.id} documento={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
