import { createClient } from "@/lib/supabase/server";
import { obterModulosDoPlano, obterPlanoAtivo } from "@/lib/data/planos";
import { LIMITE_ANALISES } from "@/lib/data/curriculo";

const DIA = 1000 * 60 * 60 * 24;

export interface ProximoPasso {
  texto: string;
  href: string;
  prioridade: "alta" | "normal";
}

export interface EventoLinhaTempo {
  quando: string;
  titulo: string;
  detalhe?: string;
  tipo: "candidatura" | "status" | "documento" | "curriculo" | "exercicio" | "pontos";
}

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  conquistada: boolean;
}

export interface EstatisticasPessoais {
  candidaturasNoMes: number;
  totalCandidaturas: number;
  taxaResposta: number | null; // % que viraram entrevista ou fechada
  tempoMedioRespostaDias: number | null;
  porStatus: Record<string, number>;
}

export interface DadosInicio {
  proximosPassos: ProximoPasso[];
  linhaDoTempo: EventoLinhaTempo[];
  badges: Badge[];
  estatisticas: EstatisticasPessoais;
}

export async function carregarInicio(candidatoId: string): Promise<DadosInicio> {
  const supabase = await createClient();
  const agora = Date.now();

  const [
    { data: candidaturas },
    { data: checklists },
    { data: documentos },
    { data: analises },
    { data: shazam },
    { data: autoconhecimento },
    { data: pdi },
    { count: linhasMestra },
    { data: eventos },
    planoAtivo,
  ] = await Promise.all([
    supabase.from("candidaturas").select("id, cargo, empresa, status, created_at, updated_at").eq("candidato_id", candidatoId),
    supabase.from("candidatura_checklist").select("candidatura_id, indicacao_perfil, curriculo_enviado, seguiu_empresa_linkedin, solicitou_conexao_recrutador"),
    supabase.from("documentos").select("titulo, status, requer_assinatura, assinado_em, liberado_em").eq("candidato_id", candidatoId),
    supabase.from("analises_curriculo").select("sucesso, score_geral, created_at").eq("candidato_id", candidatoId),
    supabase.from("exercicio_shazam").select("status, updated_at").eq("candidato_id", candidatoId).maybeSingle(),
    supabase.from("exercicio_autoconhecimento").select("status, updated_at").eq("candidato_id", candidatoId).maybeSingle(),
    supabase.from("exercicio_pdi_status").select("status, updated_at").eq("candidato_id", candidatoId).maybeSingle(),
    supabase.from("exercicio_lista_mestra_linhas").select("id", { count: "exact", head: true }).eq("candidato_id", candidatoId),
    supabase.from("pontuacao_eventos").select("acao, pontos, created_at").eq("candidato_id", candidatoId).order("created_at", { ascending: false }).limit(15),
    obterPlanoAtivo(candidatoId),
  ]);

  const cands = candidaturas ?? [];
  const docs = documentos ?? [];
  const anals = analises ?? [];
  const analisesOk = anals.filter((a) => a.sucesso).length;
  const modulos = planoAtivo ? await obterModulosDoPlano(planoAtivo.plano) : null;

  // ---------- Estatísticas pessoais (PRD 5.1 item 8) ----------
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const respondidas = cands.filter((c) => c.status !== "indefinido");
  const viraramEntrevista = cands.filter((c) => c.status === "entrevista" || c.status === "fechada");
  const tempos = respondidas.map(
    (c) => (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / DIA,
  );
  const porStatus: Record<string, number> = {};
  for (const c of cands) porStatus[c.status] = (porStatus[c.status] ?? 0) + 1;

  const estatisticas: EstatisticasPessoais = {
    candidaturasNoMes: cands.filter((c) => new Date(c.created_at) >= inicioMes).length,
    totalCandidaturas: cands.length,
    taxaResposta: cands.length ? Math.round((viraramEntrevista.length / cands.length) * 100) : null,
    tempoMedioRespostaDias: tempos.length
      ? Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10) / 10
      : null,
    porStatus,
  };

  // ---------- Próximos passos (PRD 5.1 item 6) ----------
  const passos: ProximoPasso[] = [];
  const pendentes = docs.filter(
    (d) => d.requer_assinatura && (d.status === "liberado" || d.status === "pendente_assinatura"),
  );
  if (pendentes.length) {
    passos.push({
      texto: `Assinar ${pendentes.length === 1 ? `o documento "${pendentes[0].titulo}"` : `${pendentes.length} documentos pendentes`}`,
      href: "/documentos",
      prioridade: "alta",
    });
  }
  if (cands.length === 0) {
    passos.push({ texto: "Registrar sua primeira candidatura", href: "/candidaturas", prioridade: "alta" });
  }
  for (const c of cands) {
    if (c.status !== "indefinido" && c.status !== "entrevista") continue;
    const dias = Math.floor((agora - new Date(c.updated_at).getTime()) / DIA);
    if (dias >= 5) {
      passos.push({
        texto: `Atualizar o status de ${c.cargo} · ${c.empresa} (parada há ${dias} dias)`,
        href: "/candidaturas",
        prioridade: dias >= 10 ? "alta" : "normal",
      });
    }
  }
  const completos = new Set(
    (checklists ?? [])
      .filter((c) => c.indicacao_perfil && c.curriculo_enviado && c.seguiu_empresa_linkedin && c.solicitou_conexao_recrutador)
      .map((c) => c.candidatura_id),
  );
  const semChecklist = cands.filter((c) => !completos.has(c.id) && c.status === "indefinido").length;
  if (semChecklist > 0) {
    passos.push({ texto: `Completar o checklist de ${semChecklist} candidatura(s)`, href: "/candidaturas", prioridade: "normal" });
  }
  if (analisesOk === 0) {
    passos.push({ texto: "Enviar seu currículo para a primeira análise", href: "/curriculo", prioridade: "normal" });
  } else if (analisesOk < LIMITE_ANALISES) {
    passos.push({
      texto: `Você ainda tem ${LIMITE_ANALISES - analisesOk} análise(s) de currículo disponível(is)`,
      href: "/curriculo",
      prioridade: "normal",
    });
  }
  if ((linhasMestra ?? 0) === 0) {
    passos.push({ texto: "Começar a Lista Mestra de Atividades e Resultados", href: "/exercicios", prioridade: "normal" });
  }
  if (modulos?.autoconhecimento) {
    if (shazam?.status !== "concluido") passos.push({ texto: "Concluir a Ferramenta Shazam", href: "/exercicios", prioridade: "normal" });
    if (autoconhecimento?.status !== "concluido") passos.push({ texto: "Concluir o Aprofundando o Autoconhecimento", href: "/exercicios", prioridade: "normal" });
    if (pdi?.status !== "concluido") passos.push({ texto: "Concluir o Plano de Desenvolvimento Individual", href: "/exercicios", prioridade: "normal" });
  }
  passos.sort((a, b) => (a.prioridade === b.prioridade ? 0 : a.prioridade === "alta" ? -1 : 1));

  // ---------- Linha do tempo (PRD 5.1 item 5) ----------
  const tl: EventoLinhaTempo[] = [];
  for (const c of cands) {
    tl.push({ quando: c.created_at, titulo: "Candidatura registrada", detalhe: `${c.cargo} · ${c.empresa}`, tipo: "candidatura" });
    if (c.status !== "indefinido" && c.updated_at !== c.created_at) {
      const rotulos: Record<string, string> = { entrevista: "avançou para Entrevista", fechada: "foi fechada", retorno_negativo: "recebeu retorno negativo" };
      const rot = rotulos[c.status] ?? "mudou de status";
      tl.push({ quando: c.updated_at, titulo: `Candidatura ${rot}`, detalhe: `${c.cargo} · ${c.empresa}`, tipo: "status" });
    }
  }
  for (const d of docs) {
    if (d.assinado_em) tl.push({ quando: d.assinado_em, titulo: "Documento assinado", detalhe: d.titulo, tipo: "documento" });
  }
  for (const a of anals) {
    if (a.sucesso) tl.push({ quando: a.created_at, titulo: "Currículo analisado", detalhe: a.score_geral != null ? `Score ${a.score_geral}` : undefined, tipo: "curriculo" });
  }
  for (const [nome, ex] of [["Ferramenta Shazam", shazam], ["Autoconhecimento", autoconhecimento], ["PDI", pdi]] as const) {
    if (ex?.status === "concluido") tl.push({ quando: ex.updated_at, titulo: "Exercício concluído", detalhe: nome, tipo: "exercicio" });
  }
  tl.sort((a, b) => b.quando.localeCompare(a.quando));

  // ---------- Badges (PRD 6.4 / 5.1 item 4) ----------
  const badges: Badge[] = [
    { id: "primeiro_passo", nome: "Primeiro passo", descricao: "Registrou a primeira candidatura", conquistada: cands.length >= 1 },
    { id: "ritmo", nome: "Ritmo de busca", descricao: "Registrou 5 candidaturas", conquistada: cands.length >= 5 },
    { id: "entrevista", nome: "Na mesa de entrevista", descricao: "Uma candidatura chegou a entrevista", conquistada: cands.some((c) => c.status === "entrevista" || c.status === "fechada") },
    { id: "checklist", nome: "Método aplicado", descricao: "Completou o checklist de uma candidatura", conquistada: completos.size >= 1 },
    { id: "curriculo", nome: "Currículo em foco", descricao: "Concluiu uma análise de currículo", conquistada: analisesOk >= 1 },
    { id: "documento", nome: "Em dia com a papelada", descricao: "Assinou um documento", conquistada: docs.some((d) => d.status === "assinado") },
    { id: "historia", nome: "Experiência vira evidência", descricao: "Preencheu a Lista Mestra", conquistada: (linhasMestra ?? 0) >= 1 },
    { id: "autoconhecimento", nome: "Olhar para dentro", descricao: "Concluiu um exercício de autoconhecimento", conquistada: shazam?.status === "concluido" || autoconhecimento?.status === "concluido" || pdi?.status === "concluido" },
  ];

  // eventos de pontuação recentes entram como "pontos" só se a timeline estiver curta
  if (tl.length < 5) {
    for (const e of eventos ?? []) {
      tl.push({ quando: e.created_at, titulo: `+${e.pontos} pontos`, detalhe: e.acao.replaceAll("_", " "), tipo: "pontos" });
    }
    tl.sort((a, b) => b.quando.localeCompare(a.quando));
  }

  return { proximosPassos: passos, linhaDoTempo: tl.slice(0, 12), badges, estatisticas };
}
