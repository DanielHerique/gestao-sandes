# Guia de teste do Sandes CRM — para a equipe

Este guia é para quem vai usar o sistema e conferir se tudo funciona. Não precisa saber nada de tecnologia.

Para cada funcionalidade, você vai encontrar:

- **O que faz:** para que serve a tela.
- **Como testar:** o passo a passo.
- **Deve acontecer:** o resultado esperado. Se for isso, marque ✅. Se não for, anote.

## Como registrar o que encontrou

Se algo não funcionar como descrito, anote:

1. **Em qual tela** você estava.
2. **O que você fez** (o último clique ou ação).
3. **O que apareceu** (se puder, tire um print).

Envie tudo para o Daniel. Dúvidas e sugestões também são bem-vindas: se algo estiver confuso, estranho ou faltando, **isso também é um resultado importante do teste**.

## Antes de começar

- Teste no **celular** e no **computador**. Muita gente vai usar pelo celular.
- Endereço do sistema: ______________________ (o Daniel passa).
- Se a tela parecer desatualizada, atualize a página (no computador: Cmd+Shift+R no Mac ou Ctrl+F5 no Windows).
- A senha de todas as contas de teste foi combinada com o Daniel.

### Contas de teste

| Quem | E-mail | Para que serve |
|---|---|---|
| Katryn (administradora) | contato@forgid.com | Ver o sistema como a Katryn vê |
| Candidato Teste | candidato.teste@forgid.com | Plano Essência & Propósito, perfil completo |
| Mariana | mariana.costa@exemplo.com | Plano Clareza & Futuro |
| Rafael | rafael.souza@exemplo.com | Plano Reconexão, parado há 22 dias (deve aparecer como "em risco") |
| Juliana | juliana.prado@exemplo.com | Sem plano, conta nova |

> Dica: para trocar de conta, use o botão **Sair** e entre com a próxima.

---

# PARTE 1 — Visão do candidato

Entre com **candidato.teste@forgid.com**, salvo quando indicado outra conta.

## 1. Entrar e sair

**O que faz:** protege o sistema com e-mail e senha.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Entre com e-mail e senha corretos. | Abre a tela **Início** do candidato. | ☐ |
| Tente entrar com a senha errada. | Aparece a mensagem "E-mail ou senha inválidos". | ☐ |
| Clique em **Sair**. | Volta para a tela de login. | ☐ |
| Sem estar logado, tente abrir uma tela interna do sistema. | O sistema leva você para o login. | ☐ |
| Logado como candidato, tente acessar a área da Katryn (acrescente `/admin` no fim do endereço). | O sistema não deixa entrar. | ☐ |

## 2. Menu e navegação

**O que faz:** leva o candidato de uma tela para outra.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| No celular, toque no botão ☰. | O menu abre. Tocar de novo fecha. | ☐ |
| No celular, escolha uma tela no menu. | A tela abre e o menu fecha sozinho. | ☐ |
| No computador, olhe o lado esquerdo. | O menu fica sempre visível. | ☐ |
| No celular, passe por todas as telas. | Nenhuma tela "balança" para o lado. | ☐ |

## 3. Início

**O que faz:** é a "página inicial" do candidato, com um resumo da jornada dele.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra o **Início**. | Aparecem nível, pontos e uma barra de progresso. | ☐ |
| Olhe os 4 números (candidaturas no mês, total, % que viraram entrevista, tempo médio). | Os números combinam com as candidaturas cadastradas. | ☐ |
| Olhe **Próximos passos** e clique em um. | Os passos fazem sentido e o clique leva à tela certa. | ☐ |
| Olhe **Conquistas**. | Aparecem as conquistas já liberadas e as que ainda estão bloqueadas. | ☐ |
| Olhe a **linha do tempo**. | Mostra a atividade da mais recente para a mais antiga. | ☐ |
| Entre com a **Juliana** (conta nova). | Aparece uma mensagem de boas-vindas e o passo "Registrar sua primeira candidatura". | ☐ |

## 4. Candidaturas

**O que faz:** funciona como o quadro de acompanhamento das vagas em que o candidato se inscreveu. Cada vaga é um cartão que passa por etapas.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Clique em **+ Nova candidatura** e preencha só cargo e empresa. | Dá para salvar. O cartão aparece na coluna **Indefinido**. | ☐ |
| Tente salvar sem cargo ou sem empresa. | O sistema avisa que falta preencher. | ☐ |
| No **computador**, arraste um cartão para outra coluna. | O cartão muda de coluna e continua lá depois de atualizar a página. | ☐ |
| No **celular**, deslize para o lado para ver as 4 colunas. | Todas as colunas aparecem. | ☐ |
| No celular, use o seletor **Status** de um cartão. | O cartão vai para a coluna escolhida. | ☐ |
| Marque itens do **checklist** de um cartão. | A barrinha de progresso avança (de 0/4 até 4/4) e a marcação continua depois de atualizar a página. | ☐ |
| Mude um cartão para **Entrevista**. | O candidato ganha pontos (conferir na tela **Progresso**). | ☐ |
| Abra o formulário e compare com a planilha que a Katryn usa hoje. | **Katryn:** os campos da planilha estão todos aqui? Falta algum? | ☐ |

## 5. Documentos

**O que faz:** o candidato recebe documentos (como contrato), lê e envia a versão assinada.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra **Documentos**. | Aparece a lista, cada um com sua situação: "Pendente de assinatura" ou "Assinado". | ☐ |
| Clique em **Ver / baixar**. | O documento (PDF) abre. | ☐ |
| Em um documento pendente, clique em **Enviar assinado** e escolha um PDF. | A situação muda para "Assinado" e aparece a data. | ☐ |
| Compare os documentos de duas contas diferentes. | Cada candidato vê apenas os seus. | ☐ |

## 6. Currículo (análise com IA)

**O que faz:** o candidato envia o currículo em PDF e a inteligência artificial dá uma nota, sugere cargos e aponta o que melhorar. Cada candidato tem **3 análises**.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Envie um currículo em PDF de verdade. | Aparecem a nota, os cargos compatíveis e os pontos de melhoria. | ☐ |
| Cole também a descrição de uma vaga e envie. | Aparece também o quanto o currículo combina com a vaga. | ☐ |
| Olhe o contador "(N restantes)". | Diminui a cada análise que deu certo. | ☐ |
| Faça 3 análises e tente uma quarta. | O sistema bloqueia e avisa que o limite acabou. | ☐ |
| Tente enviar um arquivo que não seja PDF (foto, Word). | O sistema recusa. | ☐ |
| Se a análise der erro. | Aparece uma mensagem clara e a análise **não** é descontada. | ☐ |
| **Katryn:** leia o resultado. | O que a IA disse faz sentido para aquele currículo? | ☐ |

## 7. Exercícios

**O que faz:** reúne os exercícios de autoconhecimento e planejamento de carreira. Alguns só aparecem para quem tem o plano **Essência & Propósito**.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Em **Lista Mestra**, adicione uma experiência, edite e depois exclua. | Tudo funciona e os dados continuam depois de atualizar a página. | ☐ |
| Entre com o **Candidato Teste** e com a **Mariana**, e compare as abas de Exercícios. | **Shazam, Autoconhecimento e PDI** aparecem só para o Candidato Teste (plano Essência & Propósito). | ☐ |
| **Shazam:** preencha as 5 etapas e marque como concluído. | Tudo salva e fica concluído. | ☐ |
| **Autoconhecimento:** responda as 9 perguntas e monte a lista de empresas-alvo. | Tudo salva. | ☐ |
| **PDI:** adicione metas de curto, médio e longo prazo e linhas do 5W2H. Depois exclua uma. | Adicionar e excluir funcionam. | ☐ |
| No celular, olhe as abas dos exercícios. | Dá para deslizar as abas para o lado. | ☐ |

## 8. Progresso e pontos

**O que faz:** mostra o nível do candidato e quantos pontos ele tem. Os pontos premiam o que ele faz (candidatar-se, avançar uma vaga, concluir exercícios).

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra **Progresso**. | Aparecem nível atual, pontos e "faltam X pontos" para o próximo nível. As contas batem. | ☐ |
| Olhe a trilha com os 5 níveis. | Os níveis já alcançados aparecem marcados. | ☐ |
| Cadastre mais de 5 candidaturas no mesmo dia. | A partir da 6ª, não dá mais pontos naquele dia (o mesmo vale para mais de 8 itens de checklist). | ☐ |

## 9. Prompts de IA

**O que faz:** biblioteca de textos prontos para o candidato copiar e usar em ferramentas de IA (como o ChatGPT).

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Use a busca por título e o filtro por categoria. | A lista mostra só o que combina. | ☐ |
| Clique em **Copiar** e cole em outro lugar (bloco de notas, WhatsApp). | O texto do prompt aparece. | ☐ |

## 10. Notificações

**O que faz:** o sistema manda avisos ao candidato, tanto informativos quanto lembretes quando ele fica parado.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra **Notificações** e clique em um aviso. | Aparecem avisos informativos e de lembrete. Ao clicar, o aviso é marcado como lido. | ☐ |
| Entre com o **Rafael** (parado há 22 dias). | Aparece um aviso de que ele está há muito tempo sem atividade. | ☐ |
| Entre e saia do sistema várias vezes. | O mesmo aviso não se repete. | ☐ |
| Uma candidatura sem mudança há 10 dias ou mais. | Gera o aviso de "candidatura parada". | ☐ |

---

# PARTE 2 — Visão da Katryn (administradora)

Entre com **contato@forgid.com**.

## 11. Dashboard

**O que faz:** é o painel geral, com a situação de todos os candidatos de relance.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra o **Dashboard**. | Aparecem 4 números: total de candidatos, engajados, em risco e com documento pendente. Os números fazem sentido. | ☐ |
| Olhe **Alertas de risco de evasão**. | O **Rafael** aparece na lista. | ☐ |
| Clique em um candidato da lista. | Abre o perfil dele. | ☐ |

## 12. Carteira de candidatos

**O que faz:** lista todos os candidatos, com busca e filtros.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Busque pelo nome e depois pelo e-mail. | Os dois jeitos encontram a pessoa. | ☐ |
| Filtre por plano. | Aparecem só os candidatos daquele plano. | ☐ |
| Filtre por situação (em risco, engajado, documento pendente, sem candidaturas). | A lista muda conforme o filtro. | ☐ |
| Mude a ordenação. | A lista reorganiza. | ☐ |
| Veja no celular e no computador. | No celular aparece em cartões, no computador em tabela. | ☐ |

## 13. Perfil do candidato

**O que faz:** reúne tudo sobre um candidato em um só lugar.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Abra o perfil de um candidato. | Aparecem candidaturas, exercícios, documentos, análises de currículo e pontuação. | ☐ |
| Atribua ou troque o **plano** e salve. | Fica salvo. Ao entrar com a conta do candidato, os exercícios disponíveis mudam de acordo com o plano. | ☐ |
| Escreva uma **anotação privada**. | A anotação aparece no perfil. Ao entrar com a conta do candidato, ele **não** vê a anotação. | ☐ |
| Clique em **Exportar relatório (PDF)**. | Baixa um PDF com os dados corretos do candidato. | ☐ |

## 14. Templates de documentos

**O que faz:** permite criar um modelo de documento (como um contrato) e enviar para vários candidatos de uma só vez.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Crie um template enviando um PDF. Teste com e sem a opção "requer assinatura". | O template é criado e aparece na lista. | ☐ |
| Selecione vários candidatos e envie em lote. | O envio é confirmado. | ☐ |
| Entre com um desses candidatos. | O documento chegou em **Documentos** e abre normalmente. | ☐ |

## 15. Prompts de IA (administração)

**O que faz:** a Katryn cadastra os prompts que os candidatos veem.

| Como testar | Deve acontecer | ✅ |
|---|---|---|
| Crie um prompt, marcando "novo" e "destaque". Depois edite e exclua. | As três ações funcionam. | ☐ |
| Crie um prompt e entre com um candidato. | O prompt novo aparece na biblioteca dele. | ☐ |

---

# PARTE 3 — Testes de ponta a ponta

Aqui você simula situações reais do começo ao fim.

**A. Candidato novo**
O Daniel cria o acesso. A Katryn atribui um plano e envia o contrato. O candidato entra, assina, registra 3 candidaturas e move uma para Entrevista. A Katryn abre o perfil e vê os pontos, a linha do tempo e o documento assinado. ☐

**B. Candidato em risco de desistir**
O Rafael aparece no alerta do Dashboard. A Katryn abre o perfil dele e escreve uma anotação privada. ☐

**C. Melhoria do currículo**
O candidato envia o currículo, aplica as melhorias sugeridas, envia de novo e compara as notas. ☐

---

# PARTE 4 — Privacidade

| Conferir | ✅ |
|---|---|
| Um candidato só vê as próprias candidaturas, documentos e notificações. | ☐ |
| Um candidato não consegue abrir as telas da Katryn. | ☐ |
| As anotações privadas nunca aparecem para o candidato. | ☐ |

> **Antes de usar com candidatos de verdade:** o Daniel precisa trocar as senhas de teste e renovar as chaves de segurança do sistema.

---

# PARTE 5 — Perguntas para a Katryn

Estas respostas ajudam a ajustar o sistema ao seu jeito de trabalhar.

1. **Pontos.** Os valores fazem sentido? Nova candidatura +10, item do checklist +5, entrevista +15, currículo analisado +10, exercício concluído +25, documento assinado +10, vaga fechada +100.
   Sua resposta: ______________________

2. **Níveis.** O candidato muda de nível com 30, 80, 150 e 250 pontos. Está bom?
   Sua resposta: ______________________

3. **Risco de desistência.** Hoje, o candidato é considerado "em risco" depois de mais de 7 dias sem atividade. É o critério certo?
   Sua resposta: ______________________

4. **Avisos automáticos.** O tom das mensagens está como você quer? (lembrete após 2 dias sem cadastrar candidatura, aviso após 10 dias com candidatura parada)
   Sua resposta: ______________________

5. **O que falta.** Existe algum campo ou etapa que você usa hoje na planilha e não encontrou aqui?
   Sua resposta: ______________________

---

*Sandes Consultoria & RH · Obrigado por testar!*
