import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { registrarEventoPontuacao } from "@/lib/data/pontuacao";
import { cancelarEventoGoogle, criarEventoGoogle, listarOcupadosGoogle } from "@/lib/google/calendar";
import {
  ANTECEDENCIA_CANCELAR_H,
  JANELA_DIAS,
  formatarDataHora,
  gerarSlots,
  type Slot,
} from "@/lib/agenda";
import type { AgendaDisponibilidade, AgendaSessao, SessaoStatus } from "@/lib/types/database";

export class AgendaError extends Error {}

// ---------- Disponibilidade (admin) ----------
export async function listarDisponibilidade(): Promise<AgendaDisponibilidade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_disponibilidade")
    .select("*")
    .order("dia_semana")
    .order("hora_inicio");
  if (error) throw error;
  return (data ?? []) as AgendaDisponibilidade[];
}

export interface BlocoInput {
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  duracao_min: number;
}

export async function criarBloco(b: BlocoInput): Promise<void> {
  if (b.hora_fim <= b.hora_inicio) throw new AgendaError("O horário final precisa ser depois do inicial.");
  if (b.hora_inicio.slice(0, 5) === b.hora_fim.slice(0, 5)) throw new AgendaError("Bloco vazio.");
  const supabase = await createClient();
  const { error } = await supabase.from("agenda_disponibilidade").insert(b);
  if (error) throw error;
}

export async function atualizarBloco(id: string, campos: { ativo: boolean }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("agenda_disponibilidade").update(campos).eq("id", id);
  if (error) throw error;
}

export async function removerBloco(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("agenda_disponibilidade").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Liberação por candidato ----------
export async function candidatoLiberado(candidatoId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.from("agenda_liberacoes").select("liberado").eq("candidato_id", candidatoId).maybeSingle();
  return Boolean(data?.liberado);
}

export async function definirLiberacao(adminId: string, candidatoId: string, liberado: boolean): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("agenda_liberacoes").upsert({
    candidato_id: candidatoId,
    liberado,
    liberado_em: liberado ? new Date().toISOString() : null,
    liberado_por: adminId,
  });
  if (error) throw error;
  if (liberado) {
    await admin.from("notificacoes").insert({
      candidato_id: candidatoId,
      tipo: "institucional",
      titulo: "Agende sua sessão de mentoria",
      mensagem: "A consultoria liberou o agendamento da sua próxima sessão. Abra a Agenda e escolha o melhor horário.",
      criado_por: adminId,
    });
  }
}

export interface CandidatoAgenda {
  id: string;
  nome: string;
  email: string;
  liberado: boolean;
}

export async function listarCandidatosAgenda(busca: string, pagina: number, tamanho: number) {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  let q = supabase
    .from("profiles")
    .select("id, nome, email, agenda_liberacoes(liberado)", { count: "exact" })
    .eq("role", "candidato")
    .order("nome")
    .range(de, de + tamanho - 1);
  const termo = busca.trim().replace(/[%,()]/g, "");
  if (termo) q = q.or(`nome.ilike.%${termo}%,email.ilike.%${termo}%`);
  const { data, error, count } = await q;
  if (error) throw error;
  const itens: CandidatoAgenda[] = (data ?? []).map((p: Record<string, unknown>) => {
    const lib = p.agenda_liberacoes as { liberado: boolean } | { liberado: boolean }[] | null;
    const liberado = Array.isArray(lib) ? lib[0]?.liberado : lib?.liberado;
    return { id: p.id as string, nome: p.nome as string, email: p.email as string, liberado: Boolean(liberado) };
  });
  return { itens, total: count ?? 0 };
}

// ---------- Horários livres ----------
/** Blocos configurados × sessões já marcadas × Google Calendar real. */
export async function horariosLivres(): Promise<Slot[]> {
  const admin = createAdminClient();
  const agora = Date.now();
  const inicioIso = new Date(agora).toISOString();
  const fimIso = new Date(agora + (JANELA_DIAS + 2) * 86400000).toISOString();

  const [{ data: blocos }, { data: sessoes }, google] = await Promise.all([
    admin.from("agenda_disponibilidade").select("*").eq("ativo", true),
    admin.from("agenda_sessoes").select("inicio, fim").eq("status", "agendada").gte("fim", inicioIso).lte("inicio", fimIso),
    listarOcupadosGoogle(inicioIso, fimIso),
  ]);
  return gerarSlots((blocos ?? []) as AgendaDisponibilidade[], [...(sessoes ?? []), ...google], agora);
}

// ---------- Agendar / cancelar ----------
export async function agendarSessao(
  candidato: { id: string; nome: string; email: string },
  inicioIso: string,
): Promise<AgendaSessao> {
  const admin = createAdminClient();
  if (!(await candidatoLiberado(candidato.id))) {
    throw new AgendaError("O agendamento ainda não foi liberado pela consultoria.");
  }
  const slot = (await horariosLivres()).find((s) => s.inicio === new Date(inicioIso).toISOString());
  if (!slot) throw new AgendaError("Esse horário não está mais disponível. Escolha outro.");

  const { data, error } = await admin
    .from("agenda_sessoes")
    .insert({ candidato_id: candidato.id, inicio: slot.inicio, fim: slot.fim })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new AgendaError("Alguém acabou de reservar esse horário. Escolha outro.");
    throw error;
  }
  let sessao = data as AgendaSessao;

  // Uma liberação vale para uma sessão
  await admin.from("agenda_liberacoes").update({ liberado: false }).eq("candidato_id", candidato.id);

  const evento = await criarEventoGoogle({
    titulo: `Mentoria: ${candidato.nome}`,
    inicio: slot.inicio,
    fim: slot.fim,
    emailCandidato: candidato.email,
    descricao: "Sessão de mentoria agendada pela plataforma Sandes Consultoria.",
  });
  if (evento) {
    const { data: atualizada } = await admin
      .from("agenda_sessoes")
      .update({ google_event_id: evento.eventId, meet_link: evento.meetLink })
      .eq("id", sessao.id)
      .select()
      .single();
    if (atualizada) sessao = atualizada as AgendaSessao;
  }

  await admin.from("notificacoes").insert({
    candidato_id: candidato.id,
    tipo: "institucional",
    titulo: "Sessão confirmada",
    mensagem: `Sua sessão de mentoria está marcada para ${formatarDataHora(slot.inicio)}.${evento?.meetLink ? ` Link: ${evento.meetLink}` : ""}`,
  });
  return sessao;
}

export async function cancelarSessao(
  quem: { id: string; admin: boolean },
  sessaoId: string,
  motivo?: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.from("agenda_sessoes").select("*").eq("id", sessaoId).maybeSingle();
  const s = data as AgendaSessao | null;
  if (!s || s.status !== "agendada") throw new AgendaError("Essa sessão não pode mais ser cancelada.");
  if (!quem.admin) {
    if (s.candidato_id !== quem.id) throw new AgendaError("Sessão não encontrada.");
    if (new Date(s.inicio).getTime() - Date.now() < ANTECEDENCIA_CANCELAR_H * 3600000) {
      throw new AgendaError(
        `Cancelamentos só são possíveis com ${ANTECEDENCIA_CANCELAR_H}h de antecedência. Fale com a consultoria.`,
      );
    }
  }

  const { error } = await admin
    .from("agenda_sessoes")
    .update({ status: "cancelada", cancelado_por: quem.id, observacao: motivo?.trim() || s.observacao })
    .eq("id", sessaoId)
    .eq("status", "agendada");
  if (error) throw error;
  if (s.google_event_id) await cancelarEventoGoogle(s.google_event_id);

  // A pessoa não usou a sessão: devolve a liberação para ela reagendar
  await admin.from("agenda_liberacoes").upsert({
    candidato_id: s.candidato_id,
    liberado: true,
    liberado_em: new Date().toISOString(),
  });

  if (quem.admin) {
    await admin.from("notificacoes").insert({
      candidato_id: s.candidato_id,
      tipo: "institucional",
      titulo: "Sessão cancelada pela consultoria",
      mensagem: `A sessão de ${formatarDataHora(s.inicio)} foi cancelada.${motivo?.trim() ? ` Motivo: ${motivo.trim()}.` : ""} Você já pode escolher um novo horário na Agenda.`,
      criado_por: quem.id,
    });
  }
}

/** Admin registra o desfecho. Comparecer gera pontos (uma vez por sessão). */
export async function registrarDesfecho(
  adminId: string,
  sessaoId: string,
  status: Extract<SessaoStatus, "realizada" | "faltou">,
): Promise<{ pontos: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("agenda_sessoes")
    .update({ status })
    .eq("id", sessaoId)
    .eq("status", "agendada")
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AgendaError("Essa sessão já foi atualizada.");
  const s = data as AgendaSessao;

  if (status === "realizada") {
    const ev = await registrarEventoPontuacao(s.candidato_id, "sessao_mentoria_realizada", { tipo: "sessao", id: s.id }, { unico: true });
    return { pontos: ev?.pontos ?? 0 };
  }
  await admin.from("notificacoes").insert({
    candidato_id: s.candidato_id,
    tipo: "institucional",
    titulo: "Sessão não realizada",
    mensagem: `Não registramos sua presença na sessão de ${formatarDataHora(s.inicio)}. Fale com a consultoria para combinar um novo horário.`,
    criado_por: adminId,
  });
  return { pontos: 0 };
}

// ---------- Listagens ----------
export interface SessaoDoCandidato extends AgendaSessao {
  cancelavel: boolean; // agendada e ainda dentro da antecedência mínima
}

export async function listarSessoesDoCandidato(candidatoId: string, pagina: number, tamanho: number) {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  const { data, error, count } = await supabase
    .from("agenda_sessoes")
    .select("*", { count: "exact" })
    .eq("candidato_id", candidatoId)
    .order("inicio", { ascending: false })
    .range(de, de + tamanho - 1);
  if (error) throw error;
  const agora = Date.now();
  const itens = ((data ?? []) as AgendaSessao[]).map((s) => ({
    ...s,
    cancelavel: s.status === "agendada" && new Date(s.inicio).getTime() - agora >= ANTECEDENCIA_CANCELAR_H * 3600000,
  }));
  return { itens, total: count ?? 0 };
}

export async function proximaSessao(candidatoId: string): Promise<AgendaSessao | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agenda_sessoes")
    .select("*")
    .eq("candidato_id", candidatoId)
    .eq("status", "agendada")
    .gte("fim", new Date().toISOString())
    .order("inicio")
    .limit(1)
    .maybeSingle();
  return (data as AgendaSessao | null) ?? null;
}

export interface SessaoComCandidato extends AgendaSessao {
  candidato_nome: string;
}

export async function listarSessoesAdmin(
  filtro: "proximas" | "passadas",
  pagina: number,
  tamanho: number,
): Promise<{ itens: SessaoComCandidato[]; total: number }> {
  const supabase = await createClient();
  const de = (pagina - 1) * tamanho;
  const agora = new Date().toISOString();
  let q = supabase
    .from("agenda_sessoes")
    .select("*, candidato:profiles!agenda_sessoes_candidato_id_fkey(nome)", { count: "exact" })
    .range(de, de + tamanho - 1);
  q =
    filtro === "proximas"
      ? q.eq("status", "agendada").gte("fim", agora).order("inicio", { ascending: true })
      : q.or(`status.neq.agendada,fim.lt.${agora}`).order("inicio", { ascending: false });
  const { data, error, count } = await q;
  if (error) throw error;
  const itens = (data ?? []).map((r: Record<string, unknown>) => {
    const { candidato, ...resto } = r as unknown as { candidato?: { nome?: string } | { nome?: string }[] } & AgendaSessao;
    const nome = Array.isArray(candidato) ? candidato[0]?.nome : candidato?.nome;
    return { ...(resto as AgendaSessao), candidato_nome: nome ?? "Candidato" };
  });
  return { itens, total: count ?? 0 };
}

// ---------- Lembretes automáticos (PRD 3.8) ----------
/** Avisa sobre sessões nas próximas 24h. Deduplicado pelo título (data/hora da sessão). */
export async function gerarLembretesDeSessao(candidatoId: string): Promise<number> {
  const admin = createAdminClient();
  const agora = Date.now();
  const { data: sessoes } = await admin
    .from("agenda_sessoes")
    .select("id, inicio, meet_link")
    .eq("candidato_id", candidatoId)
    .eq("status", "agendada")
    .gt("inicio", new Date(agora).toISOString())
    .lte("inicio", new Date(agora + 24 * 3600000).toISOString());
  if (!sessoes?.length) return 0;

  const { data: existentes } = await admin
    .from("notificacoes")
    .select("titulo")
    .eq("candidato_id", candidatoId)
    .like("titulo", "Lembrete: sessão%");
  const jaTem = new Set((existentes ?? []).map((n) => n.titulo));

  const novas = sessoes
    .map((s) => ({ s, titulo: `Lembrete: sessão ${formatarDataHora(s.inicio)}` }))
    .filter(({ titulo }) => !jaTem.has(titulo))
    .map(({ s, titulo }) => ({
      candidato_id: candidatoId,
      tipo: "institucional" as const,
      titulo,
      mensagem: `Você tem uma sessão de mentoria ${formatarDataHora(s.inicio)}.${s.meet_link ? ` Link: ${s.meet_link}` : ""}`,
    }));
  if (novas.length) await admin.from("notificacoes").insert(novas);
  return novas.length;
}
