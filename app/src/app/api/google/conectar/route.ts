import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { googleConfigurado, urlDeAutorizacao } from "@/lib/google/calendar";

// Inicia o OAuth com o Google. Só o admin pode conectar a agenda da consultoria.
export async function GET(req: NextRequest) {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!googleConfigurado()) {
    return NextResponse.redirect(new URL("/admin/agenda?google=nao_configurado", req.url));
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(urlDeAutorizacao(req.nextUrl.origin, state));
  res.cookies.set("google_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
