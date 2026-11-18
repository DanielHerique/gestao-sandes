import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Exportação dos dados do próprio usuário (LGPD). Respeita o RLS: só devolve o que é dele. */
export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new NextResponse("Não autenticado", { status: 401 });
  const id = auth.user.id;

  const [perfil, candidaturas, eventos, documentos, analises, notificacoes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id),
    supabase.from("candidaturas").select("*").eq("candidato_id", id),
    supabase.from("pontuacao_eventos").select("*").eq("candidato_id", id),
    supabase.from("documentos").select("*").eq("candidato_id", id),
    supabase.from("analises_curriculo").select("*").eq("candidato_id", id),
    supabase.from("notificacoes").select("*").eq("candidato_id", id),
  ]);

  const ids = (candidaturas.data ?? []).map((c: { id: string }) => c.id);
  const checklist = ids.length ? await supabase.from("candidatura_checklist").select("*").in("candidatura_id", ids) : { data: [] };

  const corpo = {
    gerado_em: new Date().toISOString(),
    perfil: perfil.data,
    candidaturas: candidaturas.data,
    checklist: checklist.data,
    pontuacao: eventos.data,
    documentos: documentos.data,
    analises_curriculo: analises.data,
    notificacoes: notificacoes.data,
  };

  return new NextResponse(JSON.stringify(corpo, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados-sandes.json"',
    },
  });
}
