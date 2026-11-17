# Figma "Plataforma Sandes - Design": resumo para implementação

Fonte: capturas do arquivo (privado) enviadas pelo Daniel em 17/11/2026. Páginas do Figma: Design System Sandes, Guia para devs, KAT · MVP.

## Escopo do MVP (frame 00): "Menos telas, mesmo cuidado"

**Fica (já existe):** Início (próximo passo e semana da pessoa), Candidaturas (4 colunas e checklist, como pedido no PDF), Currículo com IA (3 análises, com saída para revisão humana), Exercícios (Lista Mestra e exercícios do plano), Documentos (assinatura e status), Painel da Katryn (carteira, anotações e relatório em PDF).

**Simplifica:**
- Pontos e loja saem. Ficam 6 níveis por marco, validados pela mentora com um clique.
- Cupons: desconto fixo por nível concluído, mostrado no Início. Sem carteira de pontos.
- Missões: 3 por nível, escritas uma vez pela Sandes. Sem geração semanal.
- Semana ativa: basta 1 ação na semana para manter o ritmo. Pausa de 1 semana sem perder nada.
- Serviços: lista com preço e botões de WhatsApp. Pagamento fora da plataforma.

**Fase 2 (depois de validar):** Raio-x da vaga e Treino de entrevista, planos em assinatura, Sua voz e Histórias, loja/conquistas/ranking, menu lateral desktop (o MVP é responsivo: a mesma tela, mais larga).

**Gamificação mínima (inspirada no Duolingo):**
- 1 ação na semana mantém a semana ativa.
- A ação mínima é pequena: registrar 1 vaga, 1 item do checklist, 1 linha da Lista Mestra.
- Ritmo semanal, nunca diário, e pausa sem culpa.
- Os 7 primeiros dias recebem atenção extra: boas-vindas, primeira missão e contato da equipe.
- Texto de compromisso: "Quero manter minha semana ativa".

## Design system

- **Cores:** amber/500 #FF9800 (botão principal, progresso, marca), amber/200 #FFD580 (cupom, cartão premium), amber/100 #FFF0D1 (etiqueta, item ativo), amber/700 #9E6400 (texto âmbar em fundo claro). Neutros: charcoal/900 #1F2429, graphite/800 #2E353C, gray/600 #585F63, gray/200 #E6E7E8, mist/100 #F1F2F3, offwhite/50 #F7F7F4 (fundo), white #FFFFFF (cartões). Estados: success/700 #2F6F3E e /100 #E7F3EA; error/700 #B3261E e /100 #FDE0E0; info/700 #1A5FB4 e /100 #E3EFFD.
- **Regra do âmbar:** botão âmbar com texto carvão (8,3:1). Nunca texto branco sobre âmbar, nem âmbar como letra em fundo claro.
- **Tipografia:** Asap em tudo, pesos 400, 600 e 700. Display 32/38 (700), Title 24/30 (700), Heading 18/24 (600), Body 16/24, Body strong 16/24 (600), Small 14/20, Caption 12/16 (600), Button 16/20 (600), Number 28/32 (700). Títulos com até 10 palavras, sem ponto final e sem travessão.
- **Espaço:** grade de 4 px (4, 8, 12, 16, 20, 24, 32, 40, 64, 96). **Raios:** sm (etiquetas), md (campos e notas), lg (cartões), full (botões e filtros). Filho nunca mais redondo que o pai. **Sombras:** flutuante (hover e menus) e sobreposição (modal). Borda ou sombra, nunca as duas fortes.
- **Componentes:**
  - Botão: pílula. Principal âmbar com texto carvão, um por seção. Secundário com borda carvão. Link para ações leves. Altura mínima de 48 px e foco visível.
  - Etiqueta: nunca clicável. Estados de sucesso, erro e informação só na plataforma e sempre com texto.
  - Campo: rótulo acima, ajuda opcional e erro em vermelho na linha de baixo. Nunca placeholder no lugar do rótulo.
  - Cartão: claro por padrão, escuro para o mais importante da tela (um por tela), âmbar para oferta e premium.
  - Item de missão (tempo e pontos, a linha inteira é área de toque), selo de nível, cartão de plano, navegação, ícones.
- **Ícones:** linha, traço 2, cantos arredondados, grade de 24 px, nunca preenchidos nem emoji. Lista: home, briefcase, trending-up, book-open, gift, bell, check, lock, clock, arrow-right, plus, menu, award, send, target, file-text, search, mic, message-circle, download, shield, edit-3, eye, alert-circle, chevron, user, play.
- **Navegação:** celular com barra superior e navegação inferior de 5 itens (Início, Vagas, Currículo, Exercícios, Mais). Desktop com cabeçalho superior (Início, Vagas, Currículo, Exercícios, Documentos, Serviços, sino e avatar). O menu lateral de 3 grupos é da Fase 2.

## Regras do guia para devs

- Nenhum hex, px ou fonte solta no código de tela. Tudo vem de token ou estilo.
- Camadas: primitivos, tokens (variáveis CSS ou tema Tailwind com o mesmo nome do Figma), componentes, telas.
- Nomes iguais aos do Figma, trocando a barra por hífen (`--color-bg-surface`, `--spacing-16`, `--radius-lg`, `--shadow-float`).
- Alvo de toque de pelo menos 48 px, funciona em 390, 810 e 1440 px sem rolagem lateral, navegável por teclado com contraste AA.
- Etiqueta não é clicável (se precisa de clique, é Botão). Um botão principal por seção. Um cartão escuro por tela.
- Ordem de construção: tokens, tipografia e ícones, componentes isolados, estrutura comum (cabeçalho e navegação), telas do mentorado, painel da Katryn.

## Telas

- **D01 Início:** selo da mentoria ("Mentoria Clareza & Futuro"), "Olá, [nome]", "Seu próximo passo cabe nesta semana.", botão "Registrar uma vaga". Cartão do nível ("Nível 3 de 6 · História de Valor", barra, "2 de 3 missões", missões com tempo, aviso "Ao concluir este nível, você libera 5% de desconto em serviços Sandes"). Cartão escuro "Semana ativa" (S1 a S5 e Agora, "5 semanas ativas nas últimas 6. A semana 4 foi uma pausa combinada."). Próxima sessão. Suas vagas (em andamento, entrevistas, resposta recebida).
- **D02 Vagas:** "Minhas vagas", botão "Registrar vaga em 1 minuto". Colunas Em andamento, Entrevistas, Aprovado ("Quando chegar, a gente celebra junto"), Reprovado (botão "Registrar o que aprendi"). Cartão mostra progresso do checklist (3 de 4), "Indicação em validação" e dica "Que tal um follow-up curto hoje?" para vagas paradas. Rodapé: "Arraste os cartões entre as colunas. Ir direto para Aprovado pede confirmação."
- **D03 Currículo:** nota (8,2), "O que já funciona", "O que ajustar", histórico de análises, "Nova análise" (PDF até 10 MB, 1 análise disponível neste mês) e o aviso "A IA aponta, a mentoria decide".
- **D04 Exercícios:** "Do seu plano": Lista Mestra, Mapa de objetivos (em breve) e cartão sobre Shazam, Autoconhecimento e PDI.
- **D05 Documentos:** aviso de documento a assinar, lista (Termo de confidencialidade, Contrato, Privacidade e dados LGPD, Recibos) e cartão escuro "Seus dados" com "Baixar meus dados".
- **D06 Serviços:** "Seu desconto de 5% vale em todos. A conversa acontece no WhatsApp." Cartões com preço (Apresentação & Confiança R$ 699, Conexão & Autoridade R$ 699, Mentoria Essência & Propósito R$ 3.899), botão "Conversar no WhatsApp" e cartão premium "Consultoria individual com Katryn Sandes" ("Solicitar horário").
- **07 Painel da Katryn ("Hoje"):** cabeçalho com Hoje, Mentorados, Documentos e botão "Novo mentorado". Quatro números (precisa de contato, atenção, não começou, em ritmo). "Fila de hoje" com ações Validar marco, Validar indicação (Ver vaga), Mensagem pronta, Enviar boas-vindas, Abrir perfil. Cartão "Mensagem pronta para o [nome]" com botão "Abrir no WhatsApp". Cartão "Esta semana: 8 de 12 mentorados com semana ativa" (meta do MVP: 70% com semana ativa nas primeiras 4 semanas).
- **Mobile 01 a 06:** as mesmas telas em coluna única, com a tela "Mais" (Documentos, Contar como foi a sessão, Meu perfil e pausa, lista de serviços e consultoria individual).

## Impacto no que já foi construído

- Itens 1, 2, 7 e 8 das solicitações coincidem com o Figma (validação da indicação, "Novo mentorado", colunas novas, ordem do checklist).
- Pontos, loja, resgates, regras de pontos e agenda (Fase 2 atual) saem do MVP e passam para "Fase 2 depois de validar".
- Os itens 4 e 9 das solicitações mudam de sentido: sem pontos, o próximo passo é por marco ("Falta 1 marco para você alcançar o próximo passo: Presença Estratégica") e não há pontuação para movimento errado.
- Novos: níveis por marco com missões, semana ativa, cupom de desconto, tela Serviços, "Hoje" da Katryn e navegação nova.
