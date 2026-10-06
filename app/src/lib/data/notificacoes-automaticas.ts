import { createAdminClient } from "@/lib/supabase/admin";
import { MENSAGENS_SISTEMA } from "@/lib/gamification/mensagens";
import { nivelAtual } from "@/lib/gamification/pontos";
import { LIMITE_ANALISES } from "@/lib/data/curriculo";

// Notificações comportamentais — PRD 3.8 (b).
// Roda quando o candidato abre o app. Cada aviso é deduplicado pelo título,
// então abrir várias vezes não gera repetição.

const DIA = 1000 * 60 * 60 * 24;
const JANELA_REPETICAO_DIAS = 3;

interface Aviso {
  titulo: string;
  mensagem: string;
  repetivel: boolean; // false = só uma vez na vida
}

export async function gerarNotificacoesComportamentais(
  candidatoId: string,
): Promise<number> {
  const admin = createAdminClient();
  const agora = Date.now();

  const [{ data: profile }, { data: candidaturas }, { count: analises }, { data: eventos }, { data: existentes }] =
    await Promise.all([
      admin.from("profiles").select("created_at").eq("id", candidatoId).single(),
      admin
        .from("candidaturas")
        .select("cargo, empresa, status, created_at, updated_at")
        .eq("candidato_id", candidatoId),
      admin
        .from("analises_curriculo")
        .select("id", { count: "exact", head: true })
        .eq("candidato_id", candidatoId)
        .eq("sucesso", true),
      admin.from("pontuacao_eventos").select("pontos").eq("candidato_id", candidatoId),
      admin
        .from("notificacoes")
        .select("titulo, created_at")
        .eq("candidato_id", candidatoId)
        .eq("tipo", "comportamental"),
    ]);

  if (!profile) return 0;

  const avisos: Aviso[] = [];
  const lista = candidaturas ?? [];

  // 1) Inatividade no cadastro de vagas (2+ dias)
  const contaTemDias = (agora - new Date(profile.created_at).getTime()) / DIA;
  const ultimaCriacao = lista
    .map((c) => new Date(c.created_at).getTime())
    .sort((a, b) => b - a)[0];
  const diasSemCadastrar = ultimaCriacao
    ? (agora - ultimaCriacao) / DIA
    : contaTemDias;
  if (diasSemCadastrar >= 2 && contaTemDias >= 2) {
    avisos.push({
      titulo: "Faz alguns dias sem registrar candidaturas",
      mensagem: MENSAGENS_SISTEMA.ritmo_interrompido,
      repetivel: true,
    });
  }

  // 2) Candidatura parada há 10+ dias
  for (const c of lista) {
    if (c.status !== "indefinido" && c.status !== "entrevista") continue;
    const dias = Math.floor((agora - new Date(c.updated_at).getTime()) / DIA);
    if (dias >= 10) {
      avisos.push({
        titulo: `Candidatura parada: ${c.cargo} · ${c.empresa}`,
        mensagem: `Essa candidatura está há ${dias} dias no mesmo status. Atualize o status ou faça um contato de acompanhamento. ${MENSAGENS_SISTEMA.sem_resposta}`,
        repetivel: true,
      });
    }
  }

  // 3) Cota do analisador de currículo
  const usadas = analises ?? 0;
  if (usadas === LIMITE_ANALISES - 1) {
    avisos.push({
      titulo: "Resta 1 análise de currículo",
      mensagem:
        "Você já usou duas das três análises. Aplique as melhorias sugeridas antes de usar a última.",
      repetivel: false,
    });
  } else if (usadas >= LIMITE_ANALISES) {
    avisos.push({
      titulo: "Análises de currículo esgotadas",
      mensagem:
        "Você usou as três análises disponíveis. Para uma nova revisão, fale com a consultoria.",
      repetivel: false,
    });
  }

  // 4) Marco de gamificação: nível alcançado (exceto o inicial)
  const pontos = (eventos ?? []).reduce((t, e) => t + e.pontos, 0);
  const nivel = nivelAtual(pontos);
  if (nivel.ordem > 1) {
    avisos.push({
      titulo: `Você alcançou o nível ${nivel.nome}`,
      mensagem: `${nivel.significado}. Continue no seu ritmo.`,
      repetivel: false,
    });
  }

  let criadas = 0;
  for (const aviso of avisos) {
    const anteriores = (existentes ?? []).filter((n) => n.titulo === aviso.titulo);
    const jaExiste = aviso.repetivel
      ? anteriores.some(
          (n) => agora - new Date(n.created_at).getTime() < JANELA_REPETICAO_DIAS * DIA,
        )
      : anteriores.length > 0;
    if (jaExiste) continue;

    const { error } = await admin.from("notificacoes").insert({
      candidato_id: candidatoId,
      tipo: "comportamental",
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
    });
    if (!error) criadas++;
  }
  return criadas;
}
