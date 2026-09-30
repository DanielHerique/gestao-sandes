# Cronograma de Entregas — Sandes CRM (MVP)

> **Referência de escopo:** [PRD.md](./PRD.md) — este cronograma cobre apenas o escopo marcado como **[MVP]** naquele documento.
> **Início:** semana de 28/09/2026 (segunda-feira).
> **Meta de entrega do MVP funcional:** até 31/10/2026, com folga de segurança até a 1ª semana de novembro (06/11/2026).
> **Equipe de desenvolvimento:** Daniel — cronograma calibrado para um ritmo acelerado de desenvolvimento.

---

## Como ler este cronograma

- Dividido em **6 sprints semanais**, cada uma terminando numa entrega demonstrável (não em código invisível "por baixo do capô").
- Cada sprint tem: objetivo da semana, entregáveis concretos, e o que a Katryn recebe pra revisar/validar (ela não participa do código, mas participa da validação de fluxo em pontos-chave).
- Datas são a partir de segunda-feira 28/09. Se algo atrasar, o buffer da Semana 6 absorve o excedente antes de tocar a data-limite de 06/11.
- "Definição de pronto" de cada sprint = funciona de ponta a ponta no navegador, não só no banco de dados.

---

## Semana 1 (28/09 – 04/10) — Fundação técnica + Candidaturas

**Objetivo:** deixar a base técnica pronta (stack, ambiente, modelo de dados, autenticação) e já entregar o módulo mais usado no dia a dia (Kanban de vagas) funcionando de ponta a ponta, com o primeiro gatilho de pontos.

**Fundação técnica (início da semana, pré-requisito para tudo):**
- Stack técnica definida (frontend, backend, banco de dados, storage de arquivos, autenticação, provedor de IA para currículo).
- Repositório criado, projeto inicializado, deploy "hello world" no ar (ambiente de homologação acessível por URL).
- Modelo de dados desenhado (schema das entidades principais: Candidato, Plano, Candidatura, ChecklistCandidatura, Documento, exercícios, PontuacaoEvento).
- Autenticação básica funcionando (login de admin e login de candidato, ainda que sem todas as telas).

**Entregáveis de produto:**
- CRUD de candidaturas (criar, editar, excluir) com todos os campos da planilha real dela (cargo, empresa, segmento, datas, links, plataforma de envio).
- Checklist interno de 4 itens por candidatura (indicação, currículo enviado, seguir empresa, conexão solicitada).
- Kanban visual com as 4 colunas de status dela (Indefinido, Entrevista, Fechada, Retorno negativo) + drag-and-drop.
- Visualização em lista/tabela como alternativa ao Kanban.
- Motor de pontuação: eventos de pontos gerados ao criar candidatura, marcar item do checklist, mudar status — ainda sem painel visual bonito, só o registro funcionando.

**O que a Katryn valida no fim da semana:** ela consegue, sozinha, cadastrar uma candidatura completa e mover pelo Kanban — comparando lado a lado com a planilha que ela já usa, para confirmar que nada essencial ficou de fora.

---

## Semana 2 (05/10 – 11/10) — Planos, módulos e exercícios estruturados (parte 1)

**Objetivo:** o "cérebro" que decide o que cada candidato vê, e o primeiro exercício estruturado funcionando.

**Entregáveis:**
- Cadastro de planos (Reconexão Profissional, Clareza & Futuro, Essência & Propósito, avulso) e atribuição de plano por candidato no admin.
- Lógica de liberação de módulos por plano (ex: só Essência & Propósito libera a aba de Autoconhecimento).
- Exercício "Lista Mestra de Atividades e Resultados" — tabela editável pelo candidato, disponível para todos os planos.
- Exercício "Plano de Desenvolvimento Individual (PDI)" — duas tabelas editáveis (metas por competência, 5W2H), liberado só no plano Essência & Propósito.
- Painel do admin mostrando status de preenchimento de cada exercício por candidato.

**O que a Katryn valida:** cadastro de um candidato de teste em cada plano diferente, confirmando que os módulos certos aparecem/somem conforme o plano.

---

## Semana 3 (12/10 – 18/10) — Exercícios (parte 2) + Documentos

**Objetivo:** fechar todos os exercícios estruturados e entregar o módulo de documentos.

**Entregáveis:**
- Exercício "Ferramenta Shazam" (formulário de 5 etapas).
- Exercício "Aprofundando o Autoconhecimento" (9 perguntas abertas).
- Módulo de Documentos: upload pelo admin, liberação por candidato, marcação "requer assinatura", download pelo candidato, upload da versão assinada, histórico de versões.
- Painel do admin com status de cada documento por candidato (liberado/pendente/assinado).

**O que a Katryn valida:** um fluxo completo de exercícios de Autoconhecimento com um candidato de teste do plano Essência & Propósito, e um fluxo de "enviar contrato → candidato assina → reenvia assinado".

---

## Semana 4 (19/10 – 25/10) — Currículo IA + Prompts de IA + Notificações

**Objetivo:** os módulos que dependem de integração externa (IA) e o sistema de avisos.

**Entregáveis:**
- Analisador de currículo: upload, geração de score, sugestão de áreas compatíveis, pontos de melhoria, comparação com vaga específica — com o limite de 3 uploads bem-sucedidos por candidato.
- Biblioteca de prompts de IA: admin cria/organiza por categoria, candidato visualiza/filtra/copia.
- Notificações institucionais (disparo manual pelo admin) e comportamentais (regras automáticas: inatividade em candidaturas, candidatura parada, cota de currículo quase esgotada).
- Central de notificações na visão do candidato.

**O que a Katryn valida:** faz upload de um currículo de teste e avalia se o resultado da IA faz sentido; testa o disparo de uma notificação manual; provoca uma notificação automática (ex: deixando uma candidatura parada) pra ver se dispara.

---

## Semana 5 (26/10 – 31/10) — Gamificação completa + Dashboard admin + Polimento

**Objetivo:** fechar a experiência de gamificação e dar ao admin a visão consolidada de carteira — esta é a semana-alvo para o MVP estar funcionalmente completo.

**Entregáveis:**
- Painel de progresso/gamificação na visão do candidato: pontos, nível, badges, o que falta para o próximo nível.
- Dashboard de carteira do admin: visão geral de todos os candidatos, indicadores de engajamento.
- Perfil 360º do candidato (visão do admin): candidaturas, documentos, exercícios, pontuação e histórico num só lugar.
- Relatório de engajamento exportável.
- Anotações privadas do consultor, alertas de risco de evasão, filtros de carteira, biblioteca de templates de documentos em lote.
- Linha do tempo pessoal e checklist de próximos passos (visão do candidato).
- Revisão geral de UX/UI, responsividade básica, correção de bugs abertos das semanas anteriores.

**Critério de saída — Definição de "MVP pronto":** a Katryn consegue, sozinha, cadastrar um candidato novo do zero, atribuir um plano, acompanhar candidaturas, liberar documentos, ver exercícios preenchidos e visualizar o engajamento dele — tudo dentro do sistema, sem precisar abrir a planilha antiga ou mandar Word por WhatsApp.

---

## Semana 6 (01/11 – 06/11) — Buffer, testes com usuário real e ajustes finais

**Objetivo:** semana de segurança. Só é necessária na prática se algo das semanas 1–5 atrasar; se tudo correu no ritmo, essa semana vira teste real com a Katryn e/ou um candidato de verdade (não mais dado fictício).

**Entregáveis (cenário sem atraso):**
- Onboarding de 1–2 candidatos reais no sistema (migração manual dos dados da planilha atual deles, se fizer sentido).
- Ajustes finos com base no uso real (nomenclatura, ordem de campos, validações que faltaram).
- Checklist de segurança básica (controle de acesso — candidato só vê os próprios dados; upload de arquivo validado; backup do banco configurado).

**Entregáveis (cenário com atraso):** absorve o que não coube nas semanas anteriores, priorizando nesta ordem se precisar cortar: (1) Kanban + checklist, (2) Planos/módulos, (3) Documentos, (4) Exercícios, (5) Gamificação básica, (6) Currículo IA, (7) Prompts de IA, (8) Dashboard admin completo, (9) Notificações automáticas, (10) polimento visual.

---

## O que fica de fora deste cronograma (Fase 2 — não bloqueia o MVP)

- Agenda de mentoria integrada ao Google Calendar.
- Loja de recompensas (resgate de pontos por benefícios).
- Configuração de regras de gamificação sem código.
- Academia LinkedIn (conteúdo a ser detalhado com a Katryn depois do MVP, por decisão dela).

---

## Riscos e pontos de atenção

- **Analisador de currículo (IA)** é o item de maior incerteza técnica do cronograma (qualidade da extração de PDF, custo/latência do provedor de IA escolhido) — se atrasar, é o primeiro candidato a ser simplificado (ex: reduzir de 4 saídas de análise para 2 no MVP) sem comprometer o resto.
- **Exercícios estruturados** são muitos formulários (4 no total) — tecnicamente simples individualmente, mas o volume pode pressionar o tempo da Semana 2–3 se a UI de cada um receber capricho excessivo. Priorizar função sobre polimento visual nessas telas na primeira passada.
- A meta de "fim de outubro" e a de "1ª semana de novembro" citadas por você viraram, respectivamente, o critério de saída da Semana 5 (alvo) e o fim da Semana 6 (limite com buffer).
