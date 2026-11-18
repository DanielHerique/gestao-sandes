# Plano das próximas etapas (depois do visual)

Base: Figma "Plataforma Sandes - Design" (ver `docs/figma-plataforma-sandes.md` e `docs/DESIGN_SYSTEM.md`) e as 9 solicitações do MVP (`docs/solicitacoes-mvp-para-agente.md`).

## Etapa A: visual (feita)

- Registro do estilo: `docs/DESIGN_SYSTEM.md` e `app/CLAUDE.md`.
- Tokens do Figma em `globals.css` (cores, raios, sombras, espaço), fonte Asap, só tema claro, botões em pílula com 48 px, foco visível.
- Navegação nova: cabeçalho no desktop, barra inferior com 5 itens no celular e menu "Mais".
- Cores soltas do Tailwind trocadas por tokens; brilhos e degradês removidos; travessões tirados dos textos da interface.

**Falta conferir a olho** (não havia navegador no ambiente): login, Início, Vagas, Currículo, Exercícios, Documentos e o painel admin em 390, 810 e 1440 px. Ajustar o que ficar fora do padrão.

## Etapa B: telas no formato do Figma (ainda só visual, com os dados atuais)

Ordem do guia deles: componentes isolados, depois as telas.

1. Extrair componentes reaproveitáveis: Botão, Etiqueta, Campo, Cartão (claro, escuro, âmbar), Item de missão, Selo de nível. Hoje as telas repetem classes do Tailwind.
2. Reorganizar as telas do mentorado como em D01 a D05: Início (selo da mentoria, "Seu próximo passo cabe nesta semana", cartão do nível, próxima sessão, suas vagas), Vagas (cartões com progresso do checklist e etiqueta "Indicação em validação"), Currículo (nota, "O que já funciona", "O que ajustar", aviso "A IA aponta, a mentoria decide"), Exercícios, Documentos (cartão escuro "Seus dados").
3. Cabeçalho das telas com título (Display) e frase de apoio, como no Figma.

## Etapa C: confirmar com a Sandes antes de mexer em dados

Perguntas a levar ao grupo (sem resposta, não implementar):

1. O Figma tira **pontos e loja** do MVP e passa para a Fase 2. Confirmam?
2. **Níveis por marco:** quais são os 6 níveis, o nome e as 3 missões de cada um, e quem marca o marco (a Katryn, com um clique)?
3. **Desconto:** 5% em todos os serviços por nível concluído? Acumula ou é fixo?
4. **Serviços:** nomes, preços (Apresentação & Confiança R$ 699, Conexão & Autoridade R$ 699, Mentoria Essência & Propósito R$ 3.899), texto de cada um e o número de WhatsApp.
5. **Planos** (itens 6 das solicitações): nome de cada plano e o nível inicial e final de cada um.
6. **Semana ativa:** quais ações contam (registrar vaga, item do checklist, linha da Lista Mestra) e quando começa a semana.
7. Os itens 4 e 9 das solicitações (pontos por movimento errado) deixam de existir sem pontos?

## Etapa D: funcionalidade nova do MVP (depois das respostas)

Cada passo fecha sozinho, com migration própria (`0008`, `0009`, ...).

1. **Níveis por marco e missões:** tabelas de níveis, missões e conclusão; validação pela mentora com um clique; Início mostra "Faltam X marcos para o próximo passo".
2. **Semana ativa:** registro de ação por semana, pausa combinada, faixa S1 a S5 no Início.
3. **Cupom por nível:** desconto liberado ao concluir o nível, mostrado no Início.
4. **Serviços:** tela com lista, preço e botão de WhatsApp; cartão premium "Consultoria individual com Katryn Sandes".
5. **Painel "Hoje" da Katryn:** quatro números (precisa de contato, atenção, não começou, em ritmo), fila do dia (validar marco, validar indicação, mensagem pronta, enviar boas-vindas) e "Esta semana: X de Y com semana ativa".
6. **Candidaturas:** dica de follow-up em vaga parada, botão "Registrar o que aprendi" no Reprovado, confirmação ao ir direto para Aprovado (já existe em duas etapas).
7. **Fase 2 para depois de validar:** agenda com Google Calendar, loja, regras de pontos, raio-x da vaga, treino de entrevista, planos em assinatura. O código existe e fica desligado do menu enquanto isso (decidir se esconde ou remove).

## Já entregue das 9 solicitações

Itens 1 (Validações), 2 (Novo mentorado), 3 (boas-vindas), 4 (próximo passo; muda de forma na etapa D), 5 (tutorial), 7 (colunas), 8 (ordem do checklist). Pendentes de resposta: 6 e 9.

## Antes de publicar

- Aplicar migrations no Supabase (a `0007` já foi aplicada).
- O plano gratuito do Supabase pausa o projeto após cerca de uma semana sem uso. Avisar a Sandes ou migrar para o plano pago antes da validação.

## Atualização: feito sem depender da cliente

- Início: botão "Registrar uma vaga" e cartão "Semana ativa" (calculado das ações já registradas, sem pausa ainda).
- Vagas: etiqueta "Indicação em validação" e dica de follow-up após 7 dias.
- Serviços: tela com preços do Figma. Os botões de WhatsApp só aparecem com `NEXT_PUBLIC_WHATSAPP_SANDES` definido (Vercel e `.env.local`).
- Documentos: aviso de assinatura pendente e cartão "Seus dados" com download em JSON (`/api/meus-dados`).
- Currículo: aviso "A IA aponta, a mentoria decide".
- Katryn: dashboard virou "Hoje", com "Novo mentorado" e fila de indicações a validar.
- Agenda e Loja saíram dos menus (Fase 2). As tabelas existem desde a migration 0006.

Continua dependendo da cliente: níveis por marco e missões, pausa da semana ativa, cupom, valores e textos finais de Serviços, número do WhatsApp, "Contar como foi a sessão", planos (item 6), movimentos errados (item 9).

## Fase 2 em andamento

- Feito: Raio-x da vaga (`/raio-x`) e Treino de entrevista (`/treino-entrevista`), com IA da Anthropic e limite diário por pessoa (migration `0008_usos_ia.sql`). Exigem `ANTHROPIC_API_KEY` na Vercel.
- Não feito por falta de definição: menu lateral no desktop (os 3 grupos não estão descritos no Figma), "Sua voz" e Histórias, planos em assinatura, check-in e retrospectiva (dependem de pontos ficarem ou não).
