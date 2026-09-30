# Decisões — Análise do documento KAT_Estrategia_de_Gamificacao.docx

> Registro da análise feita em 30/09/2026 sobre a proposta de estratégia de gamificação enviada pela Katryn (`KAT_Estrategia_de_Gamificacao.docx`, na raiz do projeto), e de como ela foi reconciliada com o PRD já validado.

## Veredito geral

A proposta faz sentido e é consistente com o PRD já validado. Pontos fortes:
- Decisão central ("gamificar prontidão, não prometer contratação") é compatível com o princípio já adotado no PRD (seção 6.1: pontos vêm de ações que geram valor real, não de vaidade).
- Personalização por cenário do usuário (recolocação, transição empregada, primeiro emprego, retorno após pausa, promoção, mudança de área) é um refinamento útil, mas **não vira estrutura de dados obrigatória no MVP** — os planos comerciais já existentes (Reconexão Profissional, Clareza & Futuro, Essência & Propósito) continuam sendo o eixo real de liberação de módulos (PRD 3.1-A).
- Regras de integridade de pontuação (limite diário, exige evidência, não pontua volume/spam, sem ranking) já estavam parcialmente no PRD (6.1) e foram reforçadas.
- Seção "cuidados éticos" do doc KAT (não culpabilizar, não prometer vaga, sem ranking, sem perda punitiva de progresso) é compatível e reforça decisões já tomadas.

## O que foi incorporado ao PRD (seção 6.4)

- Os 5 níveis nomeados da "Trilha KAT" (Ponto de Partida → Direção Clara → História de Valor → Presença Estratégica → Movimento Seguro), mapeados aos marcos reais do funil do PRD (diagnóstico, currículo, LinkedIn, simulações/candidaturas).
- O guia de tom para mensagens do sistema (direto, específico, adulto, honesto, acolhedor) — aplicado a notificações comportamentais e feedback do painel de gamificação.
- Reforço explícito das regras de integridade de pontuação.

## O que NÃO foi incorporado ao MVP (fica fora por ora)

- **As 9 fases completas da "Trilha KAT"** — as fases 6 a 9 do documento (Movimento/candidaturas em massa, Conexões/networking, Processos, Novo ciclo) descrevem funcionalidades de expansão (rotina de vagas gamificada, networking ativo, plano 30-60-90 pós-contratação) que o próprio documento KAT já identifica como recomendação de expansão, não como algo confirmado no material original da Katryn. Ficam como referência para uma Fase 2/3 de gamificação, não bloqueiam o MVP.
- **Desafios coletivos / comunidade** — o PRD já exclui ranking e comparação pública (seção 7, "Fora de escopo"); o documento KAT também recomenda isso só como "expansão" com desafios anônimos, sem ranking individual. Mantido fora do MVP.
- **Loja de recompensas** — já está desenhada no PRD (3.7/6.5) como Fase 2; o documento KAT não conflita com isso.
- **Matriz operacional por plano** (o documento KAT pede, antes de desenhar telas, uma matriz com entrega/critério de qualidade/responsável/prazo/recompensa por plano) — ainda não foi construída. Fica como pendência para quando entrarmos no detalhamento fino de UX/telas dos exercícios estruturados, não bloqueia o início do MVP técnico.

## Decisão explícita: mascote REMOVIDO

O documento KAT continha uma seção 8 ("Mascote e linguagem") propondo um mascote/personagem como guia de processo dentro da plataforma. **Essa ideia foi descartada por decisão do Daniel e não deve ser reconsiderada sem pedido explícito dele.**

O conteúdo útil daquela seção — o guia de tom e os exemplos de mensagens por situação (primeiro acesso, missão concluída, ritmo interrompido, reprovação, sem resposta, conquista da vaga etc.) — foi extraído e incorporado ao PRD (seção 6.4) como guia de tom de *mensagens do sistema*, sem personagem/mascote associado. Nenhuma implementação futura deve introduzir um personagem/avatar de produto sem que isso seja pedido novamente pelo Daniel.

## Arquivo original

O `.docx` original permanece na raiz do projeto (`KAT_Estrategia_de_Gamificacao.docx`) como referência histórica completa, incluindo as partes não incorporadas ao MVP.
