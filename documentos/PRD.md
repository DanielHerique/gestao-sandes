# Sandes CRM — Sistema de Gestão de Mentoria e Candidatos

> **Status:** Documentação de escopo (pré-desenvolvimento). Stack ainda não definida.
> **Contexto:** Sistema novo, construído do zero. A referência ao "Vaggaai" serve apenas como inspiração de fluxo/conceito — aquele projeto está cancelado/pausado e nenhum código ou dado será reaproveitado dele.

---

## 1. Visão geral

A Sandes Consultoria & RH atua em duas frentes: consultoria de RH para empresas (PJ) e mentoria de carreira para profissionais (PF). Este sistema resolve a segunda frente — é uma plataforma de **gestão do relacionamento entre a consultoria (Katryn) e os profissionais que ela mentora**.

Não é um site de vagas nem um agregador de oportunidades. O objetivo central é dar visibilidade e estrutura ao processo de mentoria: acompanhar o esforço e o progresso de cada mentorado, formalizar a relação por meio de documentos, e usar dados de engajamento para embasar decisões da consultoria (inclusive para argumentar, com dados, quando um processo não avança por falta de empenho do próprio candidato).

Dois papéis:
- **Administrador** (Katryn / consultoria) — visão de portfólio: todos os mentorados, seu progresso, documentos, engajamento.
- **Candidato/Mentorado** (cliente PF) — visão pessoal: suas candidaturas, seus documentos, seu currículo, seu progresso e pontuação.

Para a v1, existe apenas um administrador (a própria Katryn). O modelo de dados deve prever múltiplos consultores no futuro (ex: campo de "responsável" numa tabela de usuários admin), mas a v1 não precisa construir gestão de equipe, permissões por consultor, nem atribuição de carteira de clientes.

### 1.1 Estratégia de entrega: MVP vs. Fase 2

O escopo completo deste documento é grande. Para viabilizar um lançamento rápido, ele é dividido em duas ondas:

- **MVP** — o necessário para a Katryn substituir planilhas/WhatsApp solto por um sistema de verdade: candidaturas, documentos, notificações básicas e gamificação central. Tudo o que está descrito neste documento como MVP é o alvo da primeira versão a ser construída.
- **Fase 2** — funcionalidades de alto valor mas maior complexidade técnica ou dependência de terceiros (ex: integração com Google Calendar), que ficam documentadas desde já para não perder o racional, mas entram depois que o MVP estiver validado em uso real.

Cada módulo abaixo está marcado com **[MVP]** ou **[Fase 2]**.

### 1.2 Base real do processo (fonte: documentos de trabalho da Katryn)

Este PRD foi atualizado após análise dos materiais reais que a Katryn usa hoje (planilhas de gestão, apresentações de kick-off/diagnóstico, checklist de LinkedIn e exercícios de sessão), disponíveis em `~/gestao-sandes/processo/`. Os achados centrais que moldam o desenho do sistema:

- Ela vende **planos/pacotes de mentoria** com quantidade e tipo de sessão fixos (ex: Reconexão Profissional — 3 sessões; Clareza & Futuro — 5/6 sessões; Essência & Propósito — 8 sessões), além de serviços avulsos (consultoria de LinkedIn, simulação de entrevista). Cada plano libera um conjunto diferente de módulos/exercícios — por exemplo, só quem contrata Essência & Propósito passa pelos exercícios de Autoconhecimento (Shazam, PDI). Isso vira o conceito de **plano contratado** no sistema (seção 3.1-A).
- O acompanhamento de candidaturas que ela já faz hoje numa planilha (`PLANILHA DE GESTÃO DE VAGAS E CANDIDATURAS`) tem uma estrutura específica que o Kanban do sistema deve replicar fielmente (seção 3.1).
- O processo de mentoria inclui **exercícios estruturados e recorrentes** que hoje ela manda como Word avulso (Ferramenta Shazam, PDI 5W2H, Aprofundando o Autoconhecimento, Lista Mestra de Atividades e Resultados). Esses exercícios entram no MVP como formulários nativos do sistema (seção 3.1-B) — resolvendo, inclusive, a necessidade de o candidato "preencher/editar" que hoje ela cobre enviando arquivo Word.
- O checklist de LinkedIn que ela já usa é conteúdo pronto para a futura Academia LinkedIn (fica de fora do MVP por decisão explícita — será detalhado depois com ela).

---

## 2. Papéis e visões

### 2.1 Administrador (Katryn)
Enxerga todos os candidatos como uma carteira. Para cada candidato, consegue ver: dados de contato, andamento das candidaturas registradas, documentos pendentes/assinados, uso do analisador de currículo, pontuação de engajamento e histórico de atividade.

### 2.2 Candidato/Mentorado
Enxerga apenas os próprios dados. Registra manualmente as vagas em que se candidatou fora da plataforma (a plataforma não tem banco de vagas próprio nem integra com portais de vaga), acompanha o status de cada candidatura, acessa/assina documentos liberados pela consultoria, usa o analisador de currículo (limitado) e acompanha sua pontuação de gamificação.

---

## 3. Módulos funcionais

### 3.1 Candidaturas (Kanban de vagas) — **[MVP]**
Peça central da visão do candidato — substitui diretamente a `PLANILHA DE GESTÃO DE VAGAS E CANDIDATURAS` que a Katryn já usa hoje (uma cópia por candidato), trazendo a mesma estrutura de dados para dentro do sistema.

Campos por candidatura (nomenclatura alinhada à planilha real dela):
- Cargo (obrigatório)
- Empresa (obrigatório)
- Segmento da empresa
- Data do envio do currículo
- Link da vaga (opcional)
- LinkedIn da empresa (opcional)
- Plataforma de envio do currículo (texto livre — ex: LinkedIn, Gupy, site da empresa, e-mail)
- Perfil do responsável pelo recrutamento (link do recrutador no LinkedIn)
- Notas pessoais do candidato (campo livre)
- Anexos específicos daquela candidatura (opcional — ex: versão do currículo enviada, carta de apresentação)

**Checklist interno da candidatura** (sub-tarefas booleanas, replicando as 4 colunas OK/Pendente da planilha dela):
- [ ] Indicação de perfil profissional feita pela Sandes
- [ ] Currículo enviado
- [ ] Seguir a página da empresa no LinkedIn
- [ ] Solicitar conexão ao responsável pelo recrutamento no LinkedIn

Cada item do checklist, ao ser marcado, é um gatilho de gamificação (ver seção 6.2).

**Status do Kanban** (colunas = os 4 valores que ela já usa, para manter familiaridade e não reeducar o vocabulário dela):
1. Indefinido (estado inicial/padrão)
2. Entrevista
3. Fechada (contratado/sucesso)
4. Retorno negativo

> Nota de produto: os 9 status mais granulares cogitados numa versão anterior deste PRD (Em triagem, Teste técnico, Proposta recebida etc.) foram substituídos por esses 4, para bater com o vocabulário real que a Katryn já usa e entende — mais simples de adotar. Se depois do MVP ela sentir falta de granularidade extra, podemos reavaliar.

Visualização em Kanban (colunas = status, cards = candidaturas) além de lista/tabela. O avanço de status e a conclusão de itens do checklist são os principais gatilhos de pontos de gamificação (ver seção 6).

### 3.1-A Planos contratados e módulos liberados — **[MVP]**
Cada candidato tem um **plano contratado**, atribuído pelo admin, que determina quais módulos/exercícios aparecem para ele. Isso reflete a estrutura comercial real da Sandes:

| Plano | Sessões | Módulos incluídos |
|---|---|---|
| Reconexão Profissional | 3 | Currículo de Impacto, LinkedIn (Estratégia & Valor), Simulação de entrevista (RH) |
| Clareza & Futuro | 5–6 | Currículo de Impacto, LinkedIn (Estratégia & Valor), Simulação de entrevista (RH + Gestores/Líderes) |
| Essência & Propósito | 8 | Tudo do Clareza & Futuro **+** módulo de Autoconhecimento (Ferramenta Shazam, Exercício de Aprofundamento do Autoconhecimento, PDI) |
| Serviços avulsos | 1–2 | Apenas o módulo específico contratado (ex: só Consultoria de LinkedIn, ou só Simulação de Entrevista) |

O admin cadastra/edita o plano do candidato no perfil dele; o sistema usa esse campo para mostrar/esconder módulos na visão do candidato (ex: candidato do plano Reconexão Profissional não vê a aba de exercícios de Autoconhecimento). Estrutura simples de flags por módulo, não precisa de motor de regras complexo no MVP.

### 3.1-B Exercícios estruturados (formulários guiados) — **[MVP]**
Formulários nativos do sistema que substituem os documentos Word avulsos que a Katryn envia hoje para cada exercício da mentoria. O candidato preenche diretamente na plataforma (resolve a necessidade de edição sem precisar de um editor de documento rico) e o admin acompanha o preenchimento no perfil do candidato.

**a) Lista Mestra de Atividades e Resultados** (base para o Currículo de Impacto — parte de todos os planos)
Tabela editável pelo candidato, linha por experiência profissional, colunas: Ano, Empresa, Segmento, Atividade principal, Tarefas secundárias, Resultados alcançados, Competências desenvolvidas.

**b) Ferramenta Shazam** (módulo de Autoconhecimento — só Essência & Propósito)
Formulário em 5 etapas:
1. Linha do tempo emocional — 3 momentos marcantes positivos + 3 momentos desafiadores (6 campos de texto)
2. Seleção de 1 momento-chave entre os 6 + "Por que você voltaria neste momento?"
3. "O que te move hoje?" + "O que você aprendeu sobre si mesmo?"
4. "O que é importante compartilhar com seu mentor/consultor agora?"
5. Síntese final — 4 perguntas de fechamento (aprendizado, aplicação, comportamento a transformar, o que fortalecer)

**c) Aprofundando o Autoconhecimento** (módulo de Autoconhecimento — só Essência & Propósito)
9 perguntas abertas de texto livre (autopercepção, feedback externo, talentos, competências, motivadores, e lista de 10 empresas-alvo).

**d) Plano de Desenvolvimento Individual — PDI** (módulo de Autoconhecimento — só Essência & Propósito)
Duas tabelas editáveis:
- Metas de desenvolvimento por competência (Competência × prazo Curto/Médio/Longo)
- Plano de ação 5W2H (What, Why, When, Where, Who, How, How Much)

O admin vê, no perfil do candidato, o status de preenchimento de cada exercício (não iniciado / em andamento / concluído) e pode consultar as respostas.

### 3.2 Documentos — **[MVP]**
Módulo de gestão documental bidirecional entre consultoria e candidato.

Fluxo:
- Admin faz upload de um documento (ex: contrato, termo de confidencialidade, plano de mentoria) e decide se ele fica **visível/liberado** para um candidato específico ou não (controle de visibilidade por documento × candidato).
- Documentos podem ser marcados como **"requer assinatura"**.
- Quando requer assinatura: o candidato baixa o documento, assina (fisicamente ou digitalmente, fora da plataforma) e faz upload do arquivo assinado de volta.
- Admin vê, por candidato, quais documentos estão: liberados/não liberados, pendentes de assinatura, assinados e enviados, ou vencidos/expirados (se aplicável).
- Histórico de versões (se o admin reenviar o mesmo documento atualizado).

Isso serve tanto como repositório de arquivos quanto como checklist de compliance da consultoria (ex: "só inicio a mentoria depois do contrato assinado").

> **Definição de escopo — visualização, não edição:** este módulo cobre visualização (PDF e/ou preview do documento) + download + upload da versão assinada. Não inclui um editor de documento tipo Google Docs (inserir/deletar linhas e texto livremente dentro da plataforma) — essa necessidade de "preencher/editar" já é resolvida pelo módulo de Exercícios Estruturados (3.1-B), que são formulários nativos do sistema. Um editor de documento rico fica fora de escopo até que surja um caso de uso concreto que os formulários não cubram.

### 3.3 Analisador de currículo (IA) — **[MVP]**
- Candidato faz upload do currículo (PDF/DOCX).
- Limite de **3 uploads bem-sucedidos por candidato** (análises que geram resultado completo; falhas técnicas de parsing não devem consumir a cota — ver nota de produto abaixo).
- Saída da análise:
  - **Score geral** do currículo (qualidade, clareza, formatação, ATS-friendliness).
  - **Sugestão de áreas/cargos compatíveis** com o perfil identificado.
  - **Pontos de melhoria específicos** (ex: "faltam métricas quantitativas", "verbos fracos", "seção de experiência desorganizada").
  - **Comparação com vaga específica** (opcional, por análise): candidato cola a descrição de uma vaga e o sistema avalia aderência currículo × vaga.
- Admin consegue ver, por candidato, quantas análises já foram feitas, quando, e os resultados (para acompanhar evolução do currículo ao longo da mentoria).

> **Nota de produto:** definir com clareza o que conta como "upload bem-sucedido" antes de implementar — evita que um erro de parsing (arquivo corrompido, PDF escaneado sem texto) consuma a cota do candidato injustamente.

### 3.4 Biblioteca de prompts de IA — **[MVP]**
Aba mantida pelo admin com prompts prontos, curados pela consultoria, para os candidatos copiarem e usarem em ferramentas de IA externas (ChatGPT, Claude, etc.) — por exemplo, prompts para melhorar o currículo, preparar respostas de entrevista, escrever mensagens de networking no LinkedIn ou simular uma entrevista técnica.

- Admin cria/edita/organiza os prompts (texto do prompt + título + categoria/tag, ex: "Entrevista", "LinkedIn", "Currículo", "Networking").
- Candidato vê a lista (com busca/filtro por categoria) e tem um botão de **copiar** para levar o texto direto pra ferramenta de IA que ele usa.
- Não executa a IA dentro da plataforma — é só um repositório de prompts prontos, mantido pela expertise da consultoria, com baixo custo de implementação (sem custo de tokens de IA embutido no produto).
- Admin pode marcar prompts como "novo" ou "em destaque" para chamar atenção do candidato quando adicionar conteúdo.
- Bom candidato a virar gatilho de notificação (ex: "novo prompt disponível: Preparação para entrevista técnica").

### 3.5 Academia LinkedIn (conteúdo educativo) — **[MVP]**
Aba de conteúdo educativo mantida pelo admin, com material sobre como usar o LinkedIn de forma estratégica na busca por vagas. A ser detalhado com a Katryn em uma sessão específica, mas o escopo inicial cobre:

- Como fazer busca detalhada/avançada de vagas no LinkedIn (filtros, palavras-chave, alertas de vaga).
- Como deixar o perfil mais profissional (foto, banner, headline, seção "sobre", experiências).
- Estratégias de networking e visibilidade (conexões, interações, publicações).

Estrutura sugerida (mesmo padrão da Biblioteca de Prompts): conteúdo organizado por categoria/módulo, mantido pelo admin (texto, e possivelmente vídeo/imagem — a definir), consumido pelo candidato como material de consulta. Pode evoluir para um formato mais estruturado tipo "curso em etapas" na Fase 2, mas para o MVP entra como biblioteca de conteúdo simples (lista de artigos/guias).

### 3.6 Agenda de mentoria integrada ao Google Calendar — **[Fase 2]**
Agendamento de sessões de mentoria entre candidato e consultoria, com integração real ao Google Calendar da Katryn.

**Visão do Admin:**
- Conecta a própria conta Google via OAuth (uma vez, nas configurações).
- Define blocos de disponibilidade recorrente (ex: terças e quintas, 14h–18h) direto no sistema.
- O sistema cruza esses blocos com os eventos já existentes no Google Calendar da Katryn (lidos via API) para não oferecer horário que já está ocupado por outro compromisso dela (pessoal ou de outro candidato).
- Admin decide, por candidato, se ele está **liberado para agendar** uma sessão (ex: só libera quando faz sentido no fluxo da mentoria, não é auto-serviço irrestrito).
- Admin vê todas as sessões agendadas, pode cancelar/reagendar.

**Visão do Candidato:**
- Só vê a opção de agendar se o admin liberou.
- Ao abrir a tela de agendamento, vê os horários realmente vagos (cruzamento de disponibilidade configurada × Google Calendar real da Katryn).
- Escolhe um horário, confirma, e o sistema cria o evento automaticamente no Google Calendar da Katryn (e idealmente envia convite/confirmação por e-mail).
- Vê suas sessões futuras e passadas.

**Dependências técnicas:** Google Calendar API, fluxo OAuth 2.0 (a Katryn precisa autorizar o acesso do sistema à agenda dela), tratamento de fuso horário, e política de cancelamento/reagendamento (janela mínima de antecedência, por exemplo).

> Motivo de ficar na Fase 2: é o módulo com maior complexidade técnica e maior dependência de uma API externa (autenticação, renovação de token, tratamento de erros de sincronização) — não deveria bloquear o lançamento do MVP.

### 3.7 Loja de recompensas (resgate de pontos) — **[Fase 2]**
Extensão do sistema de gamificação: candidatos acumulam pontos e podem trocá-los por benefícios reais oferecidos pela consultoria — por exemplo, uma sessão de mentoria extra, uma revisão de currículo além da cota de 3, ou uma sessão de preparação de entrevista avulsa.

Regras centrais (ver detalhamento completo na seção 6.5):
- Cada item da loja tem um **custo em pontos** e um **estoque/cota limitada por período** (ex: só 5 "sessões bônus" liberadas por mês no total, entre todos os candidatos).
- O resgate **não é automático**: candidato resgata (pontos são debitados na hora), mas o benefício vira um **pedido pendente** que o admin precisa aprovar/agendar manualmente — protege a agenda e a capacidade real de atendimento da Katryn.
- Admin controla, no painel, quais itens estão disponíveis, seus custos e o estoque restante do período.

> Depende do módulo de Agenda (3.6) para o principal item de resgate (reunião extra) fazer sentido de forma fluida — por isso também fica na Fase 2. Pode ser lançado como "pedido manual" simplificado antes da agenda estar pronta, se fizer sentido priorizar.

### 3.8 Notificações — **[MVP]**
Dois tipos de gatilho:

**a) Institucionais (vindas da consultoria/admin)**
- Lembrete de reunião agendada (ex: "Você tem uma sessão de mentoria amanhã às 14h") — depende do módulo de Agenda (Fase 2) para lembretes automáticos; no MVP, pode ser um lembrete manual disparado pelo admin.
- Comunicados gerais da Katryn.
- Aviso de novo documento liberado / pendente de assinatura.

**b) Comportamentais (automáticas, baseadas em regras de engajamento)**
- Inatividade no cadastro de vagas (ex: "Você não registra uma nova candidatura há 2 dias").
- Candidatura parada há muito tempo em um status sem atualização (ex: "Essa candidatura está em 'Entrevistado' há 10 dias — atualize o status").
- Cota do analisador de currículo quase esgotada ou já usada.
- Marcos de gamificação (ex: "Você subiu de nível!").

Canais possíveis (a definir na fase de stack): notificação in-app (obrigatória) + e-mail (recomendado) + WhatsApp (opcional/futuro, já que a Sandes usa muito WhatsApp como canal principal com os clientes).

### 3.9 Gamificação — **[MVP, com loja em Fase 2]**
Ver seção 6 dedicada abaixo — é substancial o suficiente para tratamento próprio. Pontuação e níveis são MVP; a loja de resgate (3.7) é Fase 2.

---

## 4. Funcionalidades — Administrador

### 4.1 MVP (10 funcionalidades centrais)
1. **Dashboard de carteira** — visão geral de todos os candidatos ativos, com indicadores de saúde: quantos estão engajados vs. estagnados, quantos com documentos pendentes, quantos com candidaturas paradas.
2. **Perfil 360º do candidato** — página única por candidato reunindo candidaturas, documentos, histórico de análises de currículo, pontuação e linha do tempo de atividade.
3. **Gestão de documentos em lote** — enviar um mesmo documento (ex: termo padrão) para múltiplos candidatos de uma vez, com liberação individual.
4. **Relatório de engajamento exportável** — gerar um resumo (PDF/planilha) do engajamento de um candidato num período, útil como evidência objetiva em conversas difíceis ("o processo não andou por falta de ação do candidato").
5. **Anotações privadas do consultor** — campo de notas internas por candidato, visível só para o admin (não aparece pro mentorado), para registrar impressões e histórico de conversas.
6. **Alertas de risco de evasão** — lista destacada de candidatos com sinais de baixo engajamento (sem login recente, sem candidaturas novas, documentos pendentes há muito tempo).
7. **Biblioteca de templates de documentos** — repositório de modelos reutilizáveis (contrato padrão, termo de confidencialidade) para acelerar o envio a novos candidatos.
8. **Filtros e segmentação de carteira** — filtrar candidatos por status de engajamento, etapa predominante das candidaturas, pontuação, data de entrada na mentoria etc.
9. **Biblioteca de prompts de IA** — criar, editar e organizar por categoria os prompts prontos que ficam disponíveis para os candidatos copiarem (ver 3.4).
10. **Gestão de planos e módulos** — atribuir o plano contratado (Reconexão Profissional, Clareza & Futuro, Essência & Propósito, avulso) a cada candidato, controlando quais módulos/exercícios ficam visíveis para ele (ver 3.1-A).

> *Academia LinkedIn (ver 3.5) segue documentada no módulo funcional, mas sai da lista das 10 funcionalidades centrais do MVP — seu conteúdo depende de detalhamento direto com a Katryn e será tratado por último, como ela pediu.*

### 4.2 Fase 2
- **Agenda de mentoria + integração Google Calendar** — conectar conta Google, definir disponibilidade, ver/gerenciar sessões (ver 3.6).
- **Gestão da loja de recompensas** — cadastrar itens, custos em pontos, controlar estoque/cota do período, aprovar resgates pendentes (ver 3.7 e 6.5).
- **Configuração de regras de gamificação** — painel para ajustar pesos de pontuação e limiares de notificação comportamental sem depender de alteração de código.

---

## 5. Funcionalidades — Candidato

### 5.1 MVP (10 funcionalidades centrais)
1. **Kanban pessoal de candidaturas** — o módulo já descrito em 3.1, com drag-and-drop entre status.
2. **Central de documentos** — ver, baixar, assinar e reenviar documentos liberados pela consultoria, com indicação clara do que está pendente.
3. **Analisador de currículo** — upload, score, sugestões e comparação com vaga, dentro do limite de 3 usos.
4. **Painel de progresso/gamificação** — visualização de pontos, nível atual, badges conquistadas e o que falta para o próximo nível.
5. **Linha do tempo pessoal** — histórico cronológico de tudo que o candidato fez na plataforma (candidaturas registradas, avanços de etapa, documentos assinados, análises de currículo).
6. **Checklist de próximos passos** — lista sugerida de ações recomendadas (ex: "atualize o status da candidatura X", "faltam documentos para assinar", "já pensou em usar sua 3ª análise de currículo?").
7. **Central de notificações** — histórico de todos os avisos recebidos (institucionais e comportamentais), com opção de marcar como lido.
8. **Estatísticas pessoais** — número de candidaturas no mês, taxa de resposta (quantas viraram entrevista), tempo médio de resposta das empresas — dados que ajudam o próprio candidato a entender seu funil.
9. **Biblioteca de prompts de IA** — acessar, filtrar por categoria e copiar os prompts curados pela consultoria (ver 3.4).
10. **Exercícios estruturados** — preencher a Lista Mestra de Atividades, Ferramenta Shazam, Aprofundando o Autoconhecimento e PDI, conforme liberado pelo plano contratado (ver 3.1-B).

> *Academia LinkedIn (ver 3.5) segue documentada no módulo funcional, mas sai da lista das 10 funcionalidades centrais do MVP pelo mesmo motivo da visão do admin — conteúdo a ser detalhado por último com a Katryn.*

### 5.2 Fase 2
- **Agenda de sessões com a consultoria** — ver horários vagos reais da Katryn (cruzados com Google Calendar) e marcar sessão, quando liberado pelo admin (ver 3.6).
- **Loja de recompensas** — trocar pontos acumulados por benefícios (reunião extra, revisão extra de currículo etc.), sujeito a aprovação do admin (ver 3.7 e 6.5).

> *Perfil e preferências (dados de contato, área de interesse, disponibilidade, preferências de canal de notificação) fica como funcionalidade de suporte esperada em qualquer sistema com login, não como um dos itens de diferenciação — entra naturalmente como parte do cadastro/onboarding, não como feature dedicada.*

---

## 6. Sistema de gamificação

### 6.1 Princípios
- Pontuação é **métrica individual**, sem ranking/leaderboard entre candidatos — evita constranger quem está com dificuldade e mantém o foco em progresso pessoal.
- O sistema deve gerar sinal confiável para o admin sobre **quem está engajado e quem não está**, funcionando como evidência objetiva do lado do esforço do candidato no processo de mentoria.
- Pontos vêm de **ações que geram valor real** para o processo de recolocação, não de vaidade (ex: não pontuar só por logar na plataforma).

### 6.2 Ações que geram pontos (sugestão de pesos — ajustável no painel de config do admin, Fase 2)

| Ação | Pontos | Racional |
|---|---|---|
| Cadastrar nova candidatura | +10 | Ação-base de esforço ativo de busca |
| Marcar item do checklist da candidatura (indicação, currículo enviado, seguir empresa, conexão solicitada) | +5 cada | Reforça a execução completa do processo, não só o registro inicial |
| Mudar status para "Entrevista" | +15 | Sinal de que o esforço está gerando retorno |
| Atualizar status de candidatura parada há mais de 5 dias | +5 | Incentiva manter o funil atualizado, não só cadastrar e esquecer |
| Completar uma análise de currículo | +10 | Uso ativo de uma ferramenta de melhoria (limitado pela cota de 3) |
| Aplicar melhoria sugerida (ex: re-upload de currículo após feedback) | +15 | Fecha o ciclo de feedback, mostra receptividade |
| Assinar e devolver um documento dentro do prazo | +10 | Compliance/organização com a consultoria |
| Concluir um exercício estruturado (Lista Mestra, Shazam, Autoconhecimento, PDI) | +25 | Exercícios são o coração do método — engajamento real com a mentoria, não só com a busca de vaga |
| Comparecer a uma sessão de mentoria agendada *(Fase 2)* | +20 | Maior sinal de comprometimento com o processo |
| Chegar a "Fechada" numa candidatura | +100 | Resultado final — o objetivo de tudo |
| Sequência de atividade (ex: registrar algo por 5 dias seguidos) | +20 bônus | Reforça constância, não só picos de atividade |

### 6.3 Ações que reduzem ou sinalizam baixo engajamento (não necessariamente pontos negativos, mas gatilhos de alerta para o admin)
- Nenhuma candidatura nova cadastrada em N dias (configurável, sugestão: 2 dias) → notificação ao candidato + sinal visível no dashboard do admin.
- Candidatura parada no mesmo status por muito tempo sem atualização → sinal de possível desistência não declarada.
- Não comparecimento a sessão agendada *(depende de 3.6, Fase 2)*.
- Documento pendente de assinatura há muito tempo sem ação.

Esses sinais alimentam o "Relatório de engajamento exportável" (funcionalidade #4 do admin) — a ideia é que a falta de pontos e o acúmulo de alertas, ao longo do tempo, constituam evidência objetiva e não-subjetiva de baixo empenho do candidato, algo que a consultoria pode usar em conversas de avaliação de continuidade da mentoria.

### 6.4 Níveis / progressão

> Atualizado após análise do documento `KAT_Estrategia_de_Gamificacao.docx` (estratégia de gamificação enviada pela Katryn, ver `documentos/DECISOES_GAMIFICACAO.md` para o racional completo da fusão com este PRD).

5 níveis nomeados, por faixa de pontos acumulados, alinhados aos marcos reais do processo de mentoria (não são faixas genéricas — cada nível corresponde a uma entrega concreta do funil):

| Nível | Critério de avanço | Significado |
|---|---|---|
| 1. Ponto de Partida | Diagnóstico/perfil concluído | O candidato entende onde está |
| 2. Direção Clara | Objetivo e prioridades definidos | O próximo movimento faz sentido |
| 3. História de Valor | Currículo e narrativa validados (Lista Mestra + revisão) | Experiência vira evidência |
| 4. Presença Estratégica | LinkedIn estruturado / checklist aplicado | O mercado entende a proposta |
| 5. Movimento Seguro | Simulações concluídas e candidaturas ativas | O candidato age com método |

Badges opcionais por marcos específicos (ex: "Primeira entrevista", "Currículo nota 9+", "Mentoria em dia"). Detalhamento fino de faixas de pontos por nível fica para a fase de UX, não é bloqueante para a arquitetura.

**Guia de tom para mensagens do sistema** (aplicável a notificações comportamentais, seção 3.8-b, e a textos de feedback do painel de gamificação):
- Direto: uma mensagem, uma razão, uma ação sugerida.
- Específico: reconhece o que foi feito, nunca elogio genérico.
- Adulto: sem diminutivos, sem euforia constante, sem linguagem infantil.
- Honesto: nunca promete vaga, prazo ou retorno do mercado.
- Acolhedor: valida a dificuldade sem terminar a mensagem só na emoção.

Regras de integridade da pontuação (aplicam-se à seção 6.2 já existente): pontos não diminuem/não zeram por inatividade; repetição de uma mesma ação tem limite diário; sem ranking público entre candidatos (já coberto em 6.1); pausa do candidato é permitida sem perda de progresso.

### 6.5 Loja de recompensas — **[Fase 2]**
Mecânica de resgate de pontos por benefícios reais, complementar aos níveis/badges (que são só reconhecimento simbólico).

**Exemplos de itens da loja:**
- Sessão de mentoria extra (além do cadenciamento padrão combinado no plano do candidato).
- Revisão de currículo extra (além das 3 análises de IA — uma revisão manual/humana da Katryn, por exemplo).
- Sessão avulsa de preparação para entrevista.

**Regras de funcionamento:**
- Cada item tem um **custo em pontos** definido pelo admin.
- Cada item tem uma **cota/estoque limitado por período** (ex: mês) — o admin define quantas unidades daquele benefício consegue absorver na agenda dela sem sobrecarregar. Quando a cota do período esgota, o item fica indisponível para resgate até o próximo período, mesmo que o candidato tenha pontos suficientes.
- O resgate **debita os pontos imediatamente**, mas gera um **pedido pendente de aprovação** — não libera o benefício automaticamente. O admin vê a fila de pedidos pendentes, aprova (e agenda/organiza a entrega do benefício, por exemplo criando a sessão extra na Agenda) ou, em casos excepcionais, recusa (com devolução dos pontos ao candidato).
- Histórico de resgates fica visível tanto pro candidato (o que já resgatou, status do pedido) quanto pro admin (fila de pedidos + histórico completo).

**Racional de design:** a loja é o que dá "uso" concreto aos pontos além do reconhecimento simbólico dos níveis, aumentando o incentivo para o candidato se engajar de verdade — mas a aprovação manual e o estoque limitado garantem que isso nunca vire uma obrigação incontrolável para a capacidade real de atendimento da Katryn.

---

## 7. Fora de escopo

- Banco de vagas próprio / vagas cadastradas pela consultoria para os candidatos aplicarem.
- Ranking ou comparação pública entre candidatos.
- Múltiplos consultores/admins com carteiras segregadas (mas o modelo de dados não deve impedir isso no futuro).
- Integração com portais de vaga externos (LinkedIn, Gupy, etc.) para importar candidaturas automaticamente.
- Qualquer reaproveitamento de código/dados do projeto Vaggaai (cancelado).

---

## 8. Roadmap resumido

**MVP (onda 1):**
- Candidaturas (Kanban + checklist) — 3.1
- Planos contratados e módulos liberados — 3.1-A
- Exercícios estruturados (Lista Mestra, Shazam, Autoconhecimento, PDI) — 3.1-B
- Documentos (visualização/assinatura, sem editor rico) — 3.2
- Analisador de currículo (IA) — 3.3
- Biblioteca de prompts de IA — 3.4
- Notificações (institucionais manuais + comportamentais) — 3.8
- Gamificação: pontos, níveis, badges — 3.9 / seção 6.1–6.4
- 10 funcionalidades de admin (seção 4.1) + 10 de candidato (seção 5.1)

**Fase 2 (onda 2):**
- Agenda de mentoria + integração Google Calendar — 3.6
- Loja de recompensas (resgate de pontos) — 3.7 / seção 6.5
- Configuração de regras de gamificação sem código
- Lembretes automáticos de reunião (depende da Agenda)

**Fora das ondas, a ser detalhado por último:**
- Academia LinkedIn — 3.5 (conteúdo depende de sessão de detalhamento com a Katryn)

---

## 9. Próximos passos

1. Validar este escopo funcional com a Katryn (nomenclatura de status já reflete a planilha dela; validar pesos de pontuação e regras de notificação).
2. Ver documento de cronograma (`CRONOGRAMA.md`) para entregas semanais até o MVP.
3. Detalhar o conteúdo da Academia LinkedIn com a Katryn por último (módulos, quantidade de conteúdo inicial) — checklist de LinkedIn já levantado em `~/gestao-sandes/processo/Check List -LinkedIn - Sandes Consultoria & RH.pdf` como ponto de partida.
4. Definir stack técnica (frontend, backend, banco de dados, storage de arquivos, provedor de IA para análise de currículo, serviço de notificação/e-mail, e futuramente Google Calendar API).
5. Desenhar modelo de dados detalhado (entidades: Candidato, Plano, Candidatura, ChecklistCandidatura, ExercicioListaMestra, ExercicioShazam, ExercicioAutoconhecimento, ExercicioPDI, Documento, AnaliseCurriculo, Notificacao, PontuacaoEvento, PromptIA, e — Fase 2 — ConteudoAcademia, SessaoMentoria, DisponibilidadeAdmin, ItemLoja, ResgateLoja).
6. Wireframes/protótipo de telas-chave do MVP: Kanban de candidaturas, central de documentos, exercícios estruturados, dashboard do admin, painel de gamificação, biblioteca de prompts.
