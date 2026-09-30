import { requireAdmin } from "@/lib/auth/session";
import {
  listarCandidatosAtivos,
  listarTemplates,
} from "@/lib/data/documento-templates";
import { TemplateManager } from "@/components/admin/template-manager";

export default async function AdminDocumentosPage() {
  await requireAdmin();
  const [templates, candidatos] = await Promise.all([
    listarTemplates(),
    listarCandidatosAtivos(),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Templates de documentos</h1>
      <TemplateManager templates={templates} candidatos={candidatos} />
    </div>
  );
}
