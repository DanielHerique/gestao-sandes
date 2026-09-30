# Pendências — dependem do Daniel

> Itens que não consigo resolver sozinho porque exigem credenciais, decisão de negócio, ou acesso a algo fora do meu alcance. Atualizado conforme o desenvolvimento avança.

---

## 1. Credenciais e setup externo

- [ ] **Criar projeto no Supabase** (supabase.com) e me passar:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (para operações admin/server-side, ex: motor de pontuação)
- [ ] Depois que o projeto existir, preciso aplicar a migration `app/supabase/migrations/0001_init.sql` (e as que forem sendo criadas) nele — posso fazer isso sozinho assim que tiver acesso via `supabase` CLI logado ou a connection string do Postgres.
- [ ] **Provedor de IA para o analisador de currículo** (PRD 3.3) — qual serviço usar (Anthropic/OpenAI/outro) e a API key correspondente. Vou implementar a lógica do lado do código já, mas a chamada real de IA fica mockada até isso vir.
- [ ] **Storage de arquivos** (documentos assinados, currículos, anexos de candidatura) — Supabase Storage cobre isso nativamente, uso por padrão assim que o projeto Supabase existir, mas confirmar se não há preferência por outro serviço (S3, etc.).
- [ ] Decisão de **onde fazer deploy do ambiente de homologação** (Vercel é o caminho mais natural para Next.js — confirmar se pode usar sua conta ou se cria uma nova).

## 2. Decisões de produto/negócio (Katryn precisa validar ou você decide)

- [ ] **Pesos de pontuação definitivos** (PRD 6.2) — a tabela no PRD é "sugestão ajustável"; seguir com os valores documentados até haver feedback da Katryn.
- [ ] **Regras de notificação comportamental** (ex: "2 dias sem candidatura nova") — usando os valores sugeridos no PRD por padrão.
- [ ] **Matriz operacional por plano** (pedida no documento KAT, seção final) — entrega, critério de qualidade, responsável pela validação, prazo esperado e recompensa funcional, por plano. Ainda não existe; não bloqueia a construção do backend/CRUD, mas vai ser necessária para o detalhamento fino das telas de exercícios.
- [ ] **Conteúdo da Academia LinkedIn** (PRD 3.5) — combinado que fica para detalhar por último com a Katryn.
- [ ] **Definição de "upload bem-sucedido"** no analisador de currículo (PRD 3.3, nota de produto) — o que conta/não conta na cota de 3 análises.

## 3. Itens que ficam registrados mas não fazem parte do MVP (não são bloqueio)

- Mascote — **descartado por decisão sua**, ver `documentos/DECISOES_GAMIFICACAO.md`. Não reconsiderar sem pedido explícito.
- Agenda + Google Calendar (Fase 2) — vai exigir OAuth da conta Google da Katryn quando chegar a hora.
- Loja de recompensas (Fase 2).

---

## O que já foi construído (código completo, aguardando só as credenciais para rodar de verdade)

Todas as 10 funcionalidades do candidato (PRD 5.1) e as principais do admin (PRD 4.1) têm código funcional, com build e lint limpos:

**Candidato:**
- Kanban de candidaturas com drag-and-drop + checklist de 4 itens (3.1)
- Exercícios estruturados: Lista Mestra, Shazam, Autoconhecimento, PDI — liberados conforme o plano (3.1-A/B)
- Central de documentos: visualização, download, upload de versão assinada (3.2)
- Analisador de currículo: upload, cota de 3, histórico — chamada de IA real pendente (3.3)
- Biblioteca de prompts de IA, com busca/filtro e botão copiar (3.4)
- Painel de progresso/gamificação: níveis nomeados, barra de progresso, linha do tempo (6.4)
- Central de notificações (3.8)
- Login/logout com Supabase Auth, proteção de rotas por role no proxy

**Admin:**
- Dashboard de carteira com alertas de risco de evasão (4.1.1, 4.1.6)
- Perfil 360º do candidato: candidaturas, análises, pontuação, anotações privadas (4.1.2, 4.1.5)
- Atribuição de plano contratado por candidato (4.1.10)
- Gestão de templates de documentos + envio em lote (4.1.3, 4.1.7)
- Gestão da biblioteca de prompts (4.1.9)
- Relatório de engajamento exportável em PDF (4.1.4)

**Motor de gamificação:** pontuação automática (candidatura criada, checklist, status, exercícios, documentos assinados etc.) com limite diário anti-spam, níveis nomeados fundidos da proposta KAT, guia de tom de mensagens sem mascote.

**Schema do banco:** 3 migrations SQL versionadas em `app/supabase/migrations/`, cobrindo todas as entidades do MVP, com RLS completo (candidato só vê o próprio dado, admin vê tudo, anotações nunca aparecem pro candidato).

## O que ainda falta (não é possível sem você)

- [ ] **Filtros e segmentação de carteira avançados** (PRD 4.1 item 8) — a listagem atual (`/admin/candidatos`) já existe mas sem filtros interativos; fácil de adicionar, fica para depois de validar o resto.
- [ ] Ligar tudo a um Supabase real (aplicar as 3 migrations, criar buckets de Storage `documentos`, `curriculos`, `documento-templates`, criar o primeiro usuário admin).
- [ ] Conectar provedor de IA real no analisador de currículo (hoje lança erro controlado e não consome a cota, conforme a regra do PRD).
- [ ] Academia LinkedIn (3.5) — combinado que fica por último com a Katryn.
- [ ] Fase 2 completa: Agenda + Google Calendar, Loja de recompensas.

Assim que as credenciais chegarem, aplico as migrations, crio os buckets e conecto tudo de ponta a ponta para teste real no navegador.
