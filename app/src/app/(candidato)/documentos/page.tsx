import { requireProfile } from "@/lib/auth/session";
import { listarDocumentos } from "@/lib/data/documentos";
import { DocumentoCard } from "@/components/documentos/documento-card";

export default async function DocumentosPage() {
  const profile = await requireProfile();
  const documentos = await listarDocumentos(profile.id);

  const aAssinar = documentos.filter((d) => d.status === "pendente_assinatura").length;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-3xl sm:text-4xl">Meus documentos</h1>
      <p className="mb-6 text-foreground/60">Tudo o que combinamos, com letras miúdas.</p>
      {aAssinar > 0 && (
        <p className="mb-4 rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          {aAssinar === 1 ? "1 documento aguarda sua assinatura" : `${aAssinar} documentos aguardam sua assinatura`}
        </p>
      )}
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

      <section className="mt-6 rounded-2xl bg-ink p-5 text-ink-fg">
        <h2 className="!text-lg !text-ink-fg">Seus dados</h2>
        <p className="mt-2 text-sm text-ink-muted">
          A equipe Sandes só vê o que você registra aqui para acompanhar a sua jornada. Empresas não veem nada sem a sua autorização.
        </p>
        <a
          href="/api/meus-dados"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 font-semibold text-brand-fg"
        >
          Baixar meus dados
        </a>
      </section>
    </div>
  );
}