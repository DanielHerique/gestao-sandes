import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { obterEmailGoogle, salvarConexao, trocarCodigo } from "@/lib/google/calendar";

export async function GET(req: NextRequest) {
  const destino = (q: string) => NextResponse.redirect(new URL(`/admin/agenda?google=${q}`, req.url));
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") return NextResponse.redirect(new URL("/login", req.url));

  const codigo = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const esperado = req.cookies.get("google_oauth_state")?.value;
  if (req.nextUrl.searchParams.get("error") || !codigo || !state || state !== esperado) return destino("recusado");

  try {
    const tokens = await trocarCodigo(codigo, req.nextUrl.origin);
    if (!tokens.refresh_token) return destino("sem_refresh");
    const email = await obterEmailGoogle(tokens.access_token);
    await salvarConexao(tokens.refresh_token, email);
    const res = destino("conectado");
    res.cookies.delete("google_oauth_state");
    return res;
  } catch {
    return destino("erro");
  }
}
