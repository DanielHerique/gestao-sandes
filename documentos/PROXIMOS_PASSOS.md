# Próximos passos

> Atualizado em 10/10/2026. Regra de ouro: **a Fase 2 só entra no sistema depois que o MVP for 100% validado pela equipe.**

## Situação atual

- **MVP:** construído e em validação pela equipe.
- **Fase 2:** código pronto localmente (Agenda + Google Calendar, Loja de recompensas, regras de gamificação, lembretes de sessão). Está só na branch `fase-2`, sem commit, sem migration aplicada e sem deploy. Não afeta o que a equipe testa.
- **IA (análise de currículo):** pausada. Não mexer.
- **Academia LinkedIn:** fica por último, junto com a Katryn.

## 1. Agora: fechar a validação do MVP

- [ ] Equipe seguir o roteiro de testes (`ROTEIRO_DE_TESTES.md` e `GUIA_DE_TESTE_EQUIPE.md`).
- [ ] Coletar os problemas encontrados e corrigir.
- [ ] Decidir onde fica o ambiente de homologação. Recomendação: **Vercel** (plano pago, por ser projeto comercial). Cloudflare só se o custo pesar mais tarde.
- [ ] Manter os arquivos no **Supabase Storage**. Google Drive pode servir como backup, não como bucket.
- [ ] Confirmar que os buckets existem: `documentos`, `curriculos`, `documento-templates`.
- [ ] Confirmar que existe um usuário admin.

## 2. Decisões que dependem da Katryn

- [ ] Matriz operacional por plano (entrega, critério de qualidade, quem valida, prazo, recompensa).
- [ ] Pesos de pontuação definitivos (hoje valem os sugeridos no PRD).
- [ ] Regras dos avisos comportamentais (hoje valem os sugeridos).
- [ ] Conteúdo da Academia LinkedIn.
- [ ] O que conta como "upload bem-sucedido" no analisador de currículo (só quando a IA voltar).

## 3. Quando o MVP estiver 100% validado: ativar a Fase 2

1. [ ] Commitar a Fase 2 na branch `fase-2` e separar o que é de cada fase antes de qualquer merge.
2. [ ] Aplicar a migration `app/supabase/migrations/0006_fase2.sql` no Supabase (precisa da senha do banco, `SUPABASE_DB_PASSWORD`, ou colar no SQL Editor).
3. [ ] Criar as credenciais OAuth no Google Cloud e configurar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `NEXT_PUBLIC_SITE_URL`.
4. [ ] A Katryn conectar o Google Calendar em `/admin/agenda` (aba "Horários e Google").
5. [ ] Cadastrar a disponibilidade semanal e os itens da loja.
6. [ ] Testar de ponta a ponta: liberar candidato, agendar, cancelar, marcar realizada (+20 pontos), lembrete 24h antes, resgate na loja.
7. [ ] Fazer o merge na `main`.

## 4. Ideias novas da Fase 2 (aguardando aprovação da equipe)

A mensagem para a equipe está em `MENSAGENS_PARA_VALIDACAO.md`.

1. Vagas indicadas pela mentora (manual).
2. Banco de perguntas de entrevista.
3. Metas da semana.
4. Lembrete de retorno de candidatura.
5. Modelos de mensagem de networking, feitos pela mentora, em tela nova.
6. Mini CRM da mentora, para trabalhar os leads dela.
7. Calculadora de proposta salarial.
8. Tarefas com prazo.
9. Resumo pós-mentoria.
10. Pesquisa de satisfação (mentora e aplicativo).
11. Relatório mensal com filtros.

Só começar as que a equipe aprovar.

## 5. Descartado (não reconsiderar sem pedido)

Mascote, simulador de entrevista com IA, preparação e feedback de entrevista, banco de histórias (STAR), calendário de entrevistas com exportação, check-in semanal, modo pausa, badges novos, mensagem direta (a comunicação é por WhatsApp), avisos por e-mail ou WhatsApp.
