# Solicitações do MVP: briefing para implementação

Documento de contexto para um agente que vai implementar as alterações pedidas pela cliente (Sandes) após os testes do MVP. Origem: mensagens da Katryn (mentora/admin) e do Gui (Sandes) no grupo do WhatsApp. O PDF enviado a eles está em `docs/Primeiras-Solicitacoes-do-MVP.pdf`.

## Como usar este documento

1. Os 9 itens abaixo descrevem o pedido original, a interpretação aprovada pelo Daniel e o que deve ser feito.
2. Itens com status **Decidido** podem ser implementados direto.
3. Itens com status **Aguardando cliente** dependem da seção "Respostas da cliente" no fim do documento. O Daniel vai colar as respostas lá. Não implemente esses itens sem a resposta; se faltar, pergunte ao Daniel.
4. Não implemente nada fora do que está aqui. Ao terminar, liste o que foi feito por item.

Stack: app Next.js em `app/` (rotas em `app/src/app/(admin)` e `(candidato)`), Supabase com migrations em `app/supabase/migrations` (a última existente é `0006_fase2.sql`; crie `0007_...` para mudanças de schema). Gamificação em `app/src/lib/gamification/` (`pontos.ts`, `rotulos.ts`, `regras.ts`). Candidaturas em `app/src/lib/data/candidaturas.ts`. Tipos em `app/src/lib/types/database.ts`. Verifique o estado atual do código antes de editar, pois há mudanças da fase 2 ainda não commitadas.

Estilo de texto na interface: português do Brasil, direto, sem travessão e sem emojis.

---

## Item 1: Validação da indicação da Sandes pela mentora

- **Status:** Decidido
- **Pedido (Katryn):** "Automatizar minha validação que realizei a referência e uma visão para que eu a faça." (print da modal Nova candidatura, com campos de perfis de recrutadores no LinkedIn)
- **Interpretação:** hoje a indicação da Sandes (item do checklist) é conferida manualmente. A mentora quer uma tela própria para fazer essa validação e que o restante seja automático.
- **Fazer:**
  - Ao cadastrar uma candidatura com perfis de recrutadores, ela entra numa fila de validação da mentora.
  - Nova tela admin "Validações": lista candidaturas aguardando, com empresa, cargo e perfis informados.
  - A mentora marca "Indicação feita" ou devolve com observação.
  - Ao validar, o item de indicação do checklist é marcado automaticamente e o mentorado recebe notificação.
- **Fora de escopo:** validar automaticamente se os perfis de LinkedIn são válidos. A validação é apenas da indicação da Sandes (decisão do Daniel: custo e complexidade).

## Item 2: Cadastro de mentorado pela mentora

- **Status:** Decidido
- **Pedido (Katryn):** "Quero viver a experiência do 0, como criar uma nova conta de mentorado?"
- **Fazer:**
  - Botão "Novo mentorado" no painel admin. Campos: nome, e-mail, plano contratado. Cria a conta com senha provisória.
  - A conta nasce zerada: 0 pontos, sem candidaturas, no ponto de partida do plano (itens 5 e 6).
- **Regras:** o cadastro é sempre feito pela mentora. Não há autocadastro nem link de convite. Não será entregue conta de teste separada.

## Item 3: Texto de boas-vindas

- **Status:** Decidido
- **Pedido (Gui):** trocar o texto abaixo do nome do candidato.
- **Fazer:** na tela Início do mentorado, abaixo de "Olá, [nome]", usar exatamente: `Vamos entender o seu momento e escolher um próximo passo possível.` Remover a menção atual a "cerca de cinco minutos". Arquivo provável: `app/src/app/(candidato)/inicio/page.tsx`.

## Item 4: "Próximo passo" explícito nos níveis

- **Status:** Decidido
- **Pedido (Gui):** sempre que mencionar o próximo nível, deixar claro que é o próximo passo. Exemplo: "Faltam 30 pontos para você alcançar o próximo passo: Direção Clara".
- **Fazer:** frase padrão `Faltam X pontos para você alcançar o próximo passo: [nome do nível]` em todos os lugares onde o próximo nível aparece (Início, Progresso, Trilha). No último nível, mostrar mensagem de conclusão no lugar.

## Item 5: Tutorial de como a ferramenta funciona

- **Status:** Decidido
- **Pedido (Gui):** "Senti falta de um pequeno tutorial de como a ferramenta funciona."
- **Fazer:**
  - Passo a passo de 4 a 5 telas curtas no primeiro acesso: pontos e níveis, cadastrar candidaturas, checklist, currículo com IA, documentos.
  - Pode ser pulado. Fica disponível depois por botão "Como funciona" no menu.
  - Controlar "tutorial visto" por usuário (campo no perfil).
  - Somente passo a passo simples dentro do sistema. Sem vídeo.
  - Textos curtos; a mentora poderá revisar depois.

## Item 6: Ponto de partida baseado no plano contratado

- **Status:** Aguardando cliente
- **Pedido (Gui):** "um ponto de partida, onde o candidato inicia a jornada baseada no plano contratado e os níveis que ele pode alcançar."
- **Fazer:**
  - Cada mentorado tem um plano registrado (escolhido pela mentora no item 2).
  - No primeiro acesso, tela "Seu ponto de partida" mostrando o plano e a escada de níveis possíveis, com o nível inicial destacado.
  - A régua de níveis passa a respeitar o plano (nível inicial e níveis alcançáveis).
- **Depende de resposta:** quais são os planos, o nível inicial de cada um e até qual nível cada plano alcança. Ver "Respostas da cliente".

## Item 7: Novos nomes das colunas de candidaturas

- **Status:** Decidido
- **Pedido (Gui):** colunas passam a ser Em andamento, Entrevistas, Aprovado e Reprovado.
- **Mapeamento:**
  - Indefinido vira Em andamento
  - Entrevista vira Entrevistas
  - Fechada vira Aprovado (equivalentes, confirmado pelo Daniel)
  - Retorno negativo vira Reprovado
- **Fazer:** migrar os valores de status existentes no banco (migration), atualizar tipos, rótulos (`rotulos.ts`), filtros, relatório PDF (`app/src/lib/pdf/relatorio-pdf.ts`) e qualquer regra de pontos que dependa desses status. Sem perda de dados.

## Item 8: Nova ordem do checklist

- **Status:** Decidido
- **Pedido (Gui):** ordem 1 currículo, 2 seguir a página da empresa, 3 solicitar conexão, 4 indicação da Sandes.
- **Ordem final de exibição:**
  1. Currículo enviado
  2. Seguir a página da empresa no LinkedIn
  3. Solicitar conexão ao responsável pelo recrutamento no LinkedIn
  4. Indicação de perfil profissional feita pela Sandes
- Só muda a ordem de exibição. A barra de progresso (0/4) e os dados salvos continuam iguais. Tabela: `candidatura_checklist`.

## Item 9: Pontos indevidos ao mover candidatura para coluna errada

- **Status:** Aguardando cliente (proposta abaixo é do time, não pedido literal)
- **Pedido (Gui):** "O sistema precisa entender quando o cliente moveu alguma vaga de forma errada, pois, quando ele move a vaga para uma coluna que não seria a correta, soma-se pontos na trilha."
- **Contexto:** hoje existem eventos de pontos como `status_mudou_para_entrevista` (15 pts) e `status_atualizado_apos_5_dias_parado` (5 pts) em `app/src/lib/gamification/pontos.ts`, e a pontuação é calculada em `app/src/lib/data/pontuacao.ts`. Mover para a frente e voltar pode pontuar repetidamente.
- **Proposta a implementar (ajustar conforme resposta da cliente):**
  - Pontos de movimentação dados uma única vez por candidatura e por etapa.
  - Ao voltar a candidatura para a coluna anterior, estornar os pontos daquela etapa.
  - Mover direto para Aprovado ou Reprovado pede confirmação em duas etapas.
  - Movimentos suspeitos (várias mudanças em poucos minutos, ou pular etapas) ficam sinalizados no painel da mentora e não pontuam até ela revisar.
  - A mentora pode ajustar ou estornar pontos manualmente no perfil do mentorado.
- **Depende de resposta:** quais movimentos a cliente considera "errados" e se o mentorado pode ir direto de Em andamento para Aprovado sem passar por Entrevistas.

---

## Respostas da cliente

O Daniel cola aqui as respostas recebidas. O agente deve ler esta seção antes de implementar os itens 6 e 9.

### Item 6: planos e níveis

(colar resposta)

### Item 9: movimentos errados

(colar resposta)

### Outras observações / correções da cliente

(colar resposta)
