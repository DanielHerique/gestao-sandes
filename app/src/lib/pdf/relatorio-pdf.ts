import type { RelatorioEngajamento } from "@/lib/data/relatorio";

// Relatório de engajamento no padrão visual da Sandes (grafite + ouro).
type RGB = [number, number, number];
const GRAFITE: RGB = [22, 21, 15];
const GRAFITE_2: RGB = [33, 31, 24];
const OURO: RGB = [242, 172, 10];
const OURO_SUAVE: RGB = [252, 241, 211];
const TEXTO: RGB = [27, 26, 23];
const MUTED: RGB = [110, 106, 96];
const LINHA: RGB = [231, 229, 222];
const FUNDO: RGB = [247, 246, 242];
const CLARO: RGB = [243, 239, 229];
const CLARO_MUTED: RGB = [168, 162, 147];
const VERDE: RGB = [4, 120, 87];
const OURO_ESCURO: RGB = [140, 95, 0];

const ACAO_LABEL: Record<string, string> = {
  candidatura_criada: "Nova candidatura registrada",
  checklist_item_marcado: "Item do checklist concluído",
  status_mudou_para_entrevista: "Candidatura avançou para Entrevista",
  status_atualizado_apos_5_dias_parado: "Status atualizado após período parado",
  analise_curriculo_concluida: "Análise de currículo concluída",
  melhoria_aplicada_reupload_curriculo: "Melhoria de currículo aplicada",
  documento_assinado_no_prazo: "Documento assinado no prazo",
  exercicio_estruturado_concluido: "Exercício estruturado concluído",
  sessao_mentoria_realizada: "Sessão de mentoria realizada",
  candidatura_fechada: "Candidatura fechada com sucesso",
  sequencia_5_dias_bonus: "Bônus de constância",
};

const COR_STATUS: Record<string, RGB> = {
  Indefinido: [148, 163, 184],
  Entrevista: [245, 158, 11],
  Fechada: [16, 185, 129],
  "Retorno negativo": [244, 63, 94],
};

export async function gerarPdfRelatorio(r: RelatorioEngajamento) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const M = 16;
  let y = 0;

  const cor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const preencher = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const traco = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

  function marca(x: number, yy: number, d: number) {
    preencher(OURO);
    doc.circle(x + d / 2, yy + d / 2, d / 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(d * 1.6);
    cor(GRAFITE);
    doc.text("S", x + d / 2, yy + d / 2 + d * 0.22, { align: "center" });
  }

  function cabecalho() {
    preencher(GRAFITE);
    doc.rect(0, 0, W, 38, "F");
    preencher(OURO);
    doc.rect(0, 38, W, 1.2, "F");
    marca(M, 10, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    cor(CLARO);
    doc.text("Sandes", M + 20, 18.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cor(CLARO_MUTED);
    doc.text("CONSULTORIA & RH", M + 20, 23);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    cor(OURO);
    doc.text("RELATÓRIO DE ENGAJAMENTO", W - M, 16, { align: "right" });
    doc.setFont("helvetica", "normal");
    cor(CLARO_MUTED);
    doc.text(
      new Date(r.geradoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
      W - M,
      21.5,
      { align: "right" },
    );
  }

  function cabecalhoCompacto() {
    preencher(GRAFITE);
    doc.rect(0, 0, W, 14, "F");
    preencher(OURO);
    doc.rect(0, 14, W, 0.8, "F");
    marca(M, 3.5, 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    cor(CLARO);
    doc.text("Sandes", M + 10, 8.2);
    cor(CLARO_MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(r.candidatoNome, W - M, 8.2, { align: "right" });
    y = 26;
  }

  function rodape(pagina: number, total: number) {
    traco(LINHA);
    doc.setLineWidth(0.2);
    doc.line(M, H - 14, W - M, H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cor(MUTED);
    doc.text("Sandes Consultoria & RH  ·  Documento confidencial, uso restrito à consultoria", M, H - 9);
    doc.text(`${pagina} / ${total}`, W - M, H - 9, { align: "right" });
  }

  function garantirEspaco(altura: number) {
    if (y + altura > H - 22) {
      doc.addPage();
      cabecalhoCompacto();
    }
  }

  function titulo(texto: string) {
    garantirEspaco(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    cor(OURO_ESCURO);
    doc.text(texto.toUpperCase(), M, y);
    traco(OURO);
    doc.setLineWidth(0.5);
    doc.line(M, y + 2, M + 12, y + 2);
    y += 9;
  }

  function linhaZebra(i: number) {
    if (i % 2 === 0) {
      preencher(FUNDO);
      doc.roundedRect(M, y - 5, W - 2 * M, 8, 2, 2, "F");
    }
  }

  // ---------- Página 1 ----------
  cabecalho();
  y = 52;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  cor(TEXTO);
  doc.text(r.candidatoNome, M, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  cor(MUTED);
  doc.text(r.candidatoEmail, M, y);
  y += 6;
  doc.text(`Plano: ${r.plano}`, M, y);

  // Selo do nível
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const larg = doc.getTextWidth(r.nivel) + 12;
  preencher(OURO_SUAVE);
  doc.roundedRect(W - M - larg, y - 12.5, larg, 8.5, 4.25, 4.25, "F");
  cor(OURO_ESCURO);
  doc.text(r.nivel, W - M - larg / 2, y - 7, { align: "center" });
  y += 12;

  // Indicadores
  const kpis: [string, string][] = [
    [String(r.pontos), "pontos"],
    [String(r.totalCandidaturas), "candidaturas"],
    [String(r.documentosPendentes), "docs pendentes"],
    [String(r.totalEventosPontuacao), "eventos de pontuação"],
  ];
  const gap = 4;
  const kw = (W - 2 * M - gap * 3) / 4;
  kpis.forEach(([v, l], i) => {
    const x = M + i * (kw + gap);
    preencher(i === 0 ? GRAFITE_2 : FUNDO);
    doc.roundedRect(x, y, kw, 24, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    cor(i === 0 ? OURO : TEXTO);
    doc.text(v, x + 5, y + 12.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cor(i === 0 ? CLARO_MUTED : MUTED);
    doc.text(l, x + 5, y + 19);
  });
  y += 36;

  // Candidaturas por status
  titulo("Candidaturas por status");
  const maxCount = Math.max(1, ...Object.values(r.candidaturasPorStatus));
  const larguraBarra = W - 2 * M - 62;
  for (const [status, count] of Object.entries(r.candidaturasPorStatus)) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    cor(TEXTO);
    doc.text(status, M, y + 3.2);
    preencher(FUNDO);
    doc.roundedRect(M + 42, y, larguraBarra, 4.5, 2.25, 2.25, "F");
    if (count > 0) {
      preencher(COR_STATUS[status] ?? OURO);
      doc.roundedRect(M + 42, y, Math.max(4.5, (count / maxCount) * larguraBarra), 4.5, 2.25, 2.25, "F");
    }
    doc.setFont("helvetica", "bold");
    cor(TEXTO);
    doc.text(String(count), W - M, y + 3.4, { align: "right" });
    y += 9;
  }
  y += 6;

  // Exercícios
  titulo("Exercícios estruturados");
  r.exercicios.forEach((e, i) => {
    garantirEspaco(9);
    linhaZebra(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    cor(TEXTO);
    doc.text(e.nome, M + 3, y);
    doc.setFont("helvetica", "bold");
    cor(e.status === "Concluído" ? VERDE : MUTED);
    doc.text(e.status, W - M - 3, y, { align: "right" });
    y += 8;
  });
  y += 6;

  // Candidaturas recentes
  if (r.candidaturasRecentes.length) {
    titulo("Candidaturas recentes");
    r.candidaturasRecentes.forEach((c, i) => {
      garantirEspaco(9);
      linhaZebra(i);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      cor(TEXTO);
      doc.text(doc.splitTextToSize(c.cargo, 75)[0], M + 3, y);
      doc.setFont("helvetica", "normal");
      cor(MUTED);
      doc.text(doc.splitTextToSize(c.empresa, 45)[0], M + 82, y);
      preencher(COR_STATUS[c.status] ?? OURO);
      doc.circle(W - M - 35, y - 1.1, 1.2, "F");
      cor(TEXTO);
      doc.text(c.status, W - M - 32, y);
      y += 8;
    });
    y += 6;
  }

  // Atividade recente
  titulo("Atividade recente");
  if (r.ultimosEventos.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    cor(MUTED);
    doc.text("Nenhuma atividade registrada até agora.", M, y);
    y += 8;
  }
  r.ultimosEventos.forEach((e, i) => {
    garantirEspaco(9);
    linhaZebra(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    cor(MUTED);
    doc.text(new Date(e.data).toLocaleDateString("pt-BR"), M + 3, y);
    cor(TEXTO);
    doc.text(ACAO_LABEL[e.acao] ?? e.acao, M + 28, y);
    doc.setFont("helvetica", "bold");
    cor(VERDE);
    doc.text(`+${e.pontos}`, W - M - 3, y, { align: "right" });
    y += 8;
  });

  // Nota final
  garantirEspaco(26);
  y += 4;
  preencher(OURO_SUAVE);
  doc.roundedRect(M, y, W - 2 * M, 18, 3, 3, "F");
  preencher(OURO);
  doc.rect(M, y + 3, 1.2, 12, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  cor([110, 76, 0]);
  doc.text(
    doc.splitTextToSize(
      "A pontuação reflete ações concretas na busca (candidaturas, exercícios, documentos e uso das ferramentas). Este relatório é um retrato do momento e serve de base para a conversa de acompanhamento.",
      W - 2 * M - 12,
    ),
    M + 6,
    y + 7,
  );

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    rodape(p, total);
  }

  doc.save(`relatorio-sandes-${r.candidatoNome.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
