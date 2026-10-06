// Dados de demonstração para testar o sistema. Idempotente: recria os dados
// dos usuários de demonstração a cada execução.
// Uso: SEED_PASSWORD=... node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const SENHA = process.env.SEED_PASSWORD;
if (!SENHA) { console.error("Defina SEED_PASSWORD (senha dos usuários de demonstração)."); process.exit(1); }
const dia = 86400000;
const ago = (d, h = 0) => new Date(Date.now() - d * dia - h * 3600000).toISOString();
const ok = (r, ctx) => { if (r.error) { console.error("ERRO", ctx, r.error.message); process.exit(1); } return r.data; };

const PDF = (titulo) => Buffer.from(
  `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 80>>stream\nBT /F1 18 Tf 60 780 Td (${titulo} - documento de demonstracao) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R/Size 6>>\n%%EOF`,
);

async function garantirUsuario(email, nome, role = "candidato") {
  const { data: lista } = await sb.auth.admin.listUsers({ perPage: 200 });
  const existente = lista.users.find((u) => u.email === email);
  if (existente) return existente.id;
  const r = await sb.auth.admin.createUser({ email, password: SENHA, email_confirm: true, user_metadata: { role, nome } });
  return ok(r, "createUser " + email).user.id;
}

async function limpar(id) {
  for (const t of ["pontuacao_eventos", "notificacoes", "documentos", "analises_curriculo", "anotacoes_admin",
    "exercicio_lista_mestra_linhas", "exercicio_shazam", "exercicio_autoconhecimento",
    "exercicio_pdi_metas", "exercicio_pdi_5w2h", "exercicio_pdi_status", "planos_contratados", "candidaturas"]) {
    ok(await sb.from(t).delete().eq("candidato_id", id), "limpar " + t);
  }
}

const admin = await garantirUsuario("contato@forgid.com", "Admin Forgid", "admin");

const pessoas = [
  { email: "candidato.teste@forgid.com", nome: "Candidato Teste", plano: "essencia_proposito", perfil: "completo" },
  { email: "mariana.costa@exemplo.com", nome: "Mariana Costa", plano: "clareza_futuro", perfil: "medio" },
  { email: "rafael.souza@exemplo.com", nome: "Rafael Souza", plano: "reconexao_profissional", perfil: "inativo" },
  { email: "juliana.prado@exemplo.com", nome: "Juliana Prado", plano: null, perfil: "novo" },
];

// ---------- Prompts ----------
ok(await sb.from("prompts_ia").delete().neq("id", "00000000-0000-0000-0000-000000000000"), "limpar prompts");
ok(await sb.from("prompts_ia").insert([
  { titulo: "Reescrever resumo profissional", categoria: "Currículo", destaque: true, novo: false, criado_por: admin,
    texto_prompt: "Atue como consultor de carreira. Reescreva meu resumo profissional em até 4 linhas, destacando resultados mensuráveis e a área em que quero atuar.\n\nResumo atual:\n[cole aqui]\n\nÁrea-alvo: [área]" },
  { titulo: "Transformar tarefas em resultados", categoria: "Currículo", destaque: false, novo: true, criado_por: admin,
    texto_prompt: "Transforme esta lista de tarefas em bullets de resultado no formato 'Verbo de ação + o que fiz + impacto mensurável'. Se não houver número, sugira como estimar.\n\nTarefas:\n[cole aqui]" },
  { titulo: "Adaptar currículo a uma vaga", categoria: "Candidatura", destaque: true, novo: false, criado_por: admin,
    texto_prompt: "Compare meu currículo com a descrição da vaga. Liste: 1) palavras-chave que faltam, 2) experiências que devo destacar, 3) o que posso omitir.\n\nCurrículo:\n[cole]\n\nVaga:\n[cole]" },
  { titulo: "Mensagem de conexão para recrutador", categoria: "LinkedIn", destaque: false, novo: false, criado_por: admin,
    texto_prompt: "Escreva uma mensagem de conexão no LinkedIn de até 300 caracteres para [nome], recrutador(a) da [empresa], sobre a vaga de [cargo]. Tom direto e respeitoso, sem parecer genérico." },
  { titulo: "Headline do LinkedIn", categoria: "LinkedIn", destaque: false, novo: true, criado_por: admin,
    texto_prompt: "Crie 5 opções de headline para o meu LinkedIn (até 220 caracteres), combinando meu cargo-alvo, meu diferencial e um resultado concreto.\n\nPerfil: [descreva]" },
  { titulo: "Simulação de entrevista comportamental", categoria: "Entrevista", destaque: true, novo: false, criado_por: admin,
    texto_prompt: "Faça o papel de entrevistador para a vaga de [cargo]. Faça uma pergunta comportamental por vez, espere minha resposta e dê feedback no método STAR antes de seguir." },
  { titulo: "Responder 'fale sobre você'", categoria: "Entrevista", destaque: false, novo: false, criado_por: admin,
    texto_prompt: "Monte uma resposta de 90 segundos para 'fale sobre você', conectando minha trajetória à vaga de [cargo]. Estrutura: presente, passado relevante, futuro desejado." },
  { titulo: "Preparar e-mail de follow-up", categoria: "Candidatura", destaque: false, novo: false, criado_por: admin,
    texto_prompt: "Escreva um e-mail curto de acompanhamento para a vaga de [cargo] enviada há [x] dias. Reforce meu interesse e pergunte sobre próximos passos sem pressionar." },
]), "prompts");

// ---------- Template + arquivos ----------
ok(await sb.from("documentos").delete().not("template_id", "is", null), "limpar documentos de templates");
ok(await sb.from("documento_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000"), "limpar templates");
const tplContrato = `templates/seed-contrato-mentoria.pdf`;
const tplTermo = `templates/seed-termo-confidencialidade.pdf`;
for (const [p, t] of [[tplContrato, "Contrato de Mentoria"], [tplTermo, "Termo de Confidencialidade"]]) {
  ok(await sb.storage.from("documento-templates").upload(p, PDF(t), { upsert: true, contentType: "application/pdf" }), "upload " + p);
}
const templates = ok(await sb.from("documento_templates").insert([
  { titulo: "Contrato de Mentoria", descricao: "Contrato padrão de prestação de serviços de mentoria de carreira.", storage_path: tplContrato, requer_assinatura: true },
  { titulo: "Termo de Confidencialidade", descricao: "Compromisso de sigilo sobre o conteúdo das sessões.", storage_path: tplTermo, requer_assinatura: true },
]).select(), "templates");

// ---------- Candidatos ----------
const VAGAS = [
  ["Analista de Marketing Sênior", "Natura", "Cosméticos", "LinkedIn"],
  ["Gerente de Produto", "Nubank", "Fintech", "Gupy"],
  ["Coordenador de RH", "Ambev", "Bebidas", "LinkedIn"],
  ["Analista de Dados Pleno", "Magazine Luiza", "Varejo", "Gupy"],
  ["Head de Customer Success", "RD Station", "SaaS", "LinkedIn"],
  ["Analista Financeiro", "Itaú", "Bancos", "Site da empresa"],
  ["Product Designer", "iFood", "Delivery", "LinkedIn"],
  ["Gerente Comercial", "TOTVS", "Software", "Indicação"],
];

for (const p of pessoas) {
  const id = await garantirUsuario(p.email, p.nome);
  await limpar(id);

  if (p.plano) ok(await sb.from("planos_contratados").insert({ candidato_id: id, plano: p.plano, criado_por: admin }), "plano");

  // candidaturas
  const cfg = {
    completo: [["entrevista", 12, 3], ["fechada", 30, 8], ["indefinido", 9, 9], ["indefinido", 5, 5], ["entrevista", 4, 1], ["retorno_negativo", 20, 14], ["indefinido", 2, 2], ["indefinido", 1, 1]],
    medio: [["indefinido", 6, 6], ["entrevista", 10, 2], ["indefinido", 3, 3], ["retorno_negativo", 15, 9]],
    inativo: [["indefinido", 25, 25], ["indefinido", 22, 22]],
    novo: [],
  }[p.perfil];

  let n = 0;
  for (const [status, criado, atualizado] of cfg) {
    const [cargo, empresa, segmento, plataforma] = VAGAS[n % VAGAS.length];
    const cand = ok(await sb.from("candidaturas").insert({
      candidato_id: id, cargo, empresa, segmento_empresa: segmento, plataforma_envio: plataforma, status,
      data_envio_curriculo: ago(criado).slice(0, 10),
      link_vaga: "https://www.linkedin.com/jobs/", linkedin_empresa: `https://www.linkedin.com/company/${empresa.toLowerCase().replace(/\W/g, "")}`,
      perfil_recrutador_linkedin: n % 2 === 0
        ? "https://www.linkedin.com/in/ana-lima-rh\nhttps://www.linkedin.com/in/carlos-mendes-talent\nhttps://www.linkedin.com/in/paula-ribeiro-recrutadora"
        : "https://www.linkedin.com/in/ana-lima-rh",
      notas_pessoais: status === "entrevista" ? "Entrevista com gestor agendada. Preparar 3 histórias STAR." : null,
      created_at: ago(criado), updated_at: ago(atualizado),
    }).select().single(), "candidatura");
    const marcados = status === "indefinido" ? n % 3 : 4;
    ok(await sb.from("candidatura_checklist").insert({
      candidatura_id: cand.id,
      indicacao_perfil: marcados >= 4, curriculo_enviado: marcados >= 1,
      seguiu_empresa_linkedin: marcados >= 2, solicitou_conexao_recrutador: marcados >= 3,
    }), "checklist");
    n++;
  }

  // pontuação
  const eventos = {
    completo: [["candidatura_criada", 10, 30], ["checklist_item_marcado", 5, 29], ["status_mudou_para_entrevista", 15, 20], ["analise_curriculo_concluida", 10, 18],
      ["candidatura_criada", 10, 12], ["exercicio_estruturado_concluido", 25, 10], ["documento_assinado_no_prazo", 10, 8], ["candidatura_fechada", 100, 8],
      ["checklist_item_marcado", 5, 6], ["candidatura_criada", 10, 5], ["candidatura_criada", 10, 4], ["status_mudou_para_entrevista", 15, 1]],
    medio: [["candidatura_criada", 10, 15], ["status_mudou_para_entrevista", 15, 10], ["checklist_item_marcado", 5, 9], ["analise_curriculo_concluida", 10, 8], ["candidatura_criada", 10, 3]],
    inativo: [["candidatura_criada", 10, 25], ["candidatura_criada", 10, 22]],
    novo: [],
  }[p.perfil];
  if (eventos.length) ok(await sb.from("pontuacao_eventos").insert(eventos.map(([acao, pontos, d]) => ({ candidato_id: id, acao, pontos, created_at: ago(d) }))), "eventos");

  // documentos
  if (p.perfil !== "novo") {
    const docs = [];
    for (const [i, t] of templates.entries()) {
      const caminho = `${id}/seed-${i}-${t.titulo.replace(/\W+/g, "-").toLowerCase()}.pdf`;
      ok(await sb.storage.from("documentos").upload(caminho, PDF(t.titulo), { upsert: true, contentType: "application/pdf" }), "upload doc");
      const assinado = i === 0 && p.perfil !== "inativo";
      let pathAssinado = null;
      if (assinado) {
        pathAssinado = `${id}/assinados/seed-${i}.pdf`;
        ok(await sb.storage.from("documentos").upload(pathAssinado, PDF(t.titulo + " ASSINADO"), { upsert: true, contentType: "application/pdf" }), "upload assinado");
      }
      docs.push({
        candidato_id: id, template_id: t.id, titulo: t.titulo, storage_path: caminho, storage_path_assinado: pathAssinado,
        requer_assinatura: true, status: assinado ? "assinado" : "pendente_assinatura",
        liberado_em: ago(20), assinado_em: assinado ? ago(8) : null, created_at: ago(20),
      });
    }
    ok(await sb.from("documentos").insert(docs), "documentos");
  }

  // notificações
  const notifs = [
    { tipo: "institucional", titulo: "Bem-vindo(a) à Sandes", mensagem: "Seu acesso está liberado. Comece registrando as vagas para as quais você já se candidatou.", lida: true, d: 28 },
    { tipo: "institucional", titulo: "Novo documento liberado", mensagem: "O Contrato de Mentoria está disponível para assinatura na aba Documentos.", lida: p.perfil === "completo", d: 20 },
  ];
  if (p.perfil === "completo") notifs.push(
    { tipo: "comportamental", titulo: "Candidatura parada: Gerente de Produto · Nubank", mensagem: "Essa candidatura está há 9 dias no mesmo status. Atualize o status ou faça um contato de acompanhamento.", lida: false, d: 1 },
    { tipo: "institucional", titulo: "Lembrete de sessão", mensagem: "Sua sessão de mentoria com a Katryn é amanhã às 14h.", lida: false, d: 0 },
  );
  if (p.perfil === "inativo") notifs.push({ tipo: "comportamental", titulo: "Faz alguns dias sem registrar candidaturas", mensagem: "Sua trajetória continua aqui. Quer retomar com uma missão de dez minutos?", lida: false, d: 2 });
  ok(await sb.from("notificacoes").insert(notifs.map(({ d, ...n }) => ({ ...n, candidato_id: id, criado_por: n.tipo === "institucional" ? admin : null, created_at: ago(d) }))), "notificacoes");

  // exercícios
  if (p.perfil === "completo" || p.perfil === "medio") {
    ok(await sb.from("exercicio_lista_mestra_linhas").insert([
      { candidato_id: id, ano: "2021–2024", empresa: "Grupo Alfa", segmento: "Varejo", atividade_principal: "Gestão da área de marketing digital",
        tarefas_secundarias: "Planejamento de campanhas, gestão de agência, relatórios mensais", resultados_alcancados: "Aumento de 38% nas vendas online em 12 meses; redução de 22% no CAC", competencias_desenvolvidas: "Liderança, análise de dados, negociação", ordem: 0 },
      { candidato_id: id, ano: "2018–2021", empresa: "Beta Soluções", segmento: "Tecnologia", atividade_principal: "Analista de comunicação",
        tarefas_secundarias: "Conteúdo, eventos, newsletter", resultados_alcancados: "Newsletter com 45% de abertura; 3 eventos com mais de 500 participantes", competencias_desenvolvidas: "Comunicação, organização, criatividade", ordem: 1 },
    ]), "lista mestra");
  }
  if (p.perfil === "completo") {
    ok(await sb.from("exercicio_shazam").insert({
      candidato_id: id, status: "concluido",
      momento_positivo_1: "Lançamento da primeira campanha nacional", momento_positivo_2: "Promoção a coordenadora", momento_positivo_3: "Mentoria de dois estagiários",
      momento_desafiador_1: "Corte de orçamento em 2020", momento_desafiador_2: "Conflito com a agência", momento_desafiador_3: "Mudança de chefia",
      momento_chave_selecionado: "Lançamento da primeira campanha nacional", motivo_voltaria: "Era um desafio claro e eu via o impacto do meu trabalho.",
      o_que_move_hoje: "Construir algo com impacto visível e desenvolver pessoas.", aprendizado_sobre_si: "Rendo mais quando tenho autonomia e metas claras.",
      compartilhar_com_mentor: "Quero um próximo papel com mais visão estratégica.",
      sintese_aprendizado: "Preciso de autonomia e propósito.", sintese_aplicacao: "Buscar vagas de gestão com escopo amplo.",
      sintese_comportamento_transformar: "Parar de aceitar tarefas fora do escopo sem negociar.", sintese_fortalecer: "Comunicação de resultados.",
    }), "shazam");
    ok(await sb.from("exercicio_autoconhecimento").insert({
      candidato_id: id, status: "em_andamento",
      autopercepcao: "Sou organizada, comunicativa e orientada a resultado.", feedback_externo: "Colegas dizem que sou calma sob pressão.",
      talentos: "Conectar pessoas e simplificar o complexo.", competencias: "Marketing de performance, gestão de times.",
      motivadores: "Autonomia, impacto, aprendizado.", empresas_alvo: ["Natura", "Nubank", "iFood", "RD Station"],
    }), "autoconhecimento");
    ok(await sb.from("exercicio_pdi_metas").insert([
      { candidato_id: id, competencia: "Liderança de equipes maiores", prazo: "medio", ordem: 0 },
      { candidato_id: id, competencia: "Inglês fluente em reuniões", prazo: "longo", ordem: 1 },
      { candidato_id: id, competencia: "Análise de dados com SQL", prazo: "curto", ordem: 2 },
    ]), "pdi metas");
    ok(await sb.from("exercicio_pdi_5w2h").insert({
      candidato_id: id, what: "Concluir curso de SQL", why: "Ganhar autonomia em análise de dados", when: "Até dezembro", where_: "Online",
      who: "Eu mesma", how: "3 aulas por semana", how_much: "R$ 600", ordem: 0,
    }), "5w2h");
    ok(await sb.from("exercicio_pdi_status").insert({ candidato_id: id, status: "em_andamento" }), "pdi status");

    ok(await sb.from("analises_curriculo").insert([
      { candidato_id: id, storage_path: `${id}/curriculo-v1.pdf`, sucesso: true, score_geral: 6.5, sugestoes_cargos: ["Gerente de Marketing", "Head de Growth", "Coordenadora de Comunicação"],
        pontos_melhoria: ["Trocar listas de tarefas por resultados com números", "Resumo profissional está genérico: cite a área-alvo", "Mover formação para o final", "Incluir ferramentas de dados que domina"], created_at: ago(18) },
      { candidato_id: id, storage_path: `${id}/curriculo-v2.pdf`, sucesso: true, score_geral: 8.2, aderencia_vaga: 7.5, vaga_comparada: "Gerente de Marketing de Performance — Natura",
        sugestoes_cargos: ["Gerente de Marketing de Performance", "Head de Growth"], pontos_melhoria: ["Destacar a redução de CAC logo no resumo", "Adicionar certificações recentes"], created_at: ago(9) },
    ]), "analises");
  }

  // anotações do admin
  if (p.perfil === "completo") ok(await sb.from("anotacoes_admin").insert([
    { candidato_id: id, autor_id: admin, texto: "Perfil forte em marketing. Trabalhar posicionamento para vagas de gestão.", created_at: ago(14) },
    { candidato_id: id, autor_id: admin, texto: "Entrevista na Natura marcada. Revisar histórias STAR antes da próxima sessão.", created_at: ago(2) },
  ]), "anotacoes");
  if (p.perfil === "inativo") ok(await sb.from("anotacoes_admin").insert({ candidato_id: id, autor_id: admin, texto: "Sem retorno há 3 semanas. Entrar em contato por WhatsApp.", created_at: ago(5) }), "anotacao");

  console.log("ok:", p.nome);
}
console.log("Seed concluído.");
