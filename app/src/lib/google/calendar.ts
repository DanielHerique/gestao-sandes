import { createAdminClient } from "@/lib/supabase/admin";

// Integração com o Google Calendar da consultoria (PRD 3.6).
// Só funciona com GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET configurados.
// Qualquer falha aqui NUNCA derruba o agendamento: a sessão existe no sistema
// mesmo que o Google esteja fora do ar ou desconectado.

export const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function googleConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function urlDeRetorno(origem: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? origem;
  return `${base.replace(/\/$/, "")}/api/google/callback`;
}

export function urlDeAutorizacao(origem: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: urlDeRetorno(origem),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export async function trocarCodigo(
  codigo: string,
  origem: string,
): Promise<{ refresh_token?: string; access_token: string }> {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: codigo,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: urlDeRetorno(origem),
      grant_type: "authorization_code",
    }),
  });
  if (!r.ok) throw new Error(`Google recusou o código (${r.status})`);
  return r.json();
}

export async function obterEmailGoogle(accessToken: string): Promise<string | null> {
  const r = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  return (await r.json()).email ?? null;
}

export async function salvarConexao(refreshToken: string, email: string | null): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("google_conexao")
    .upsert({ id: 1, refresh_token: refreshToken, email, conectado_em: new Date().toISOString() });
  if (error) throw error;
}

export async function removerConexao(): Promise<void> {
  const admin = createAdminClient();
  await admin.from("google_conexao").delete().eq("id", 1);
}

export async function statusConexao(): Promise<{ configurado: boolean; conectado: boolean; email: string | null }> {
  const configurado = googleConfigurado();
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("google_conexao").select("email").eq("id", 1).maybeSingle();
    return { configurado, conectado: Boolean(data), email: data?.email ?? null };
  } catch {
    return { configurado, conectado: false, email: null };
  }
}

async function tokenDeAcesso(): Promise<{ token: string; calendarId: string } | null> {
  if (!googleConfigurado()) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("google_conexao").select("refresh_token, calendar_id").eq("id", 1).maybeSingle();
  if (!data) return null;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) return null;
  return { token: (await r.json()).access_token, calendarId: data.calendar_id };
}

/** Horários ocupados no Google Calendar da consultoria. Vazio se desconectado. */
export async function listarOcupadosGoogle(inicioIso: string, fimIso: string): Promise<{ inicio: string; fim: string }[]> {
  try {
    const t = await tokenDeAcesso();
    if (!t) return [];
    const r = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { authorization: `Bearer ${t.token}`, "content-type": "application/json" },
      body: JSON.stringify({ timeMin: inicioIso, timeMax: fimIso, items: [{ id: t.calendarId }] }),
    });
    if (!r.ok) return [];
    const j = await r.json();
    const busy = j.calendars?.[t.calendarId]?.busy ?? [];
    return busy.map((b: { start: string; end: string }) => ({ inicio: b.start, fim: b.end }));
  } catch {
    return [];
  }
}

export async function criarEventoGoogle(dados: {
  titulo: string;
  inicio: string;
  fim: string;
  emailCandidato: string;
  descricao?: string;
}): Promise<{ eventId: string; meetLink: string | null } | null> {
  try {
    const t = await tokenDeAcesso();
    if (!t) return null;
    const r = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(t.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${t.token}`, "content-type": "application/json" },
        body: JSON.stringify({
          summary: dados.titulo,
          description: dados.descricao,
          start: { dateTime: dados.inicio, timeZone: "America/Sao_Paulo" },
          end: { dateTime: dados.fim, timeZone: "America/Sao_Paulo" },
          attendees: [{ email: dados.emailCandidato }],
          conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
        }),
      },
    );
    if (!r.ok) return null;
    const j = await r.json();
    return { eventId: j.id, meetLink: j.hangoutLink ?? null };
  } catch {
    return null;
  }
}

export async function cancelarEventoGoogle(eventId: string): Promise<void> {
  try {
    const t = await tokenDeAcesso();
    if (!t) return;
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(t.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE", headers: { authorization: `Bearer ${t.token}` } },
    );
  } catch {
    // sem efeito: a sessão já foi cancelada no sistema
  }
}
