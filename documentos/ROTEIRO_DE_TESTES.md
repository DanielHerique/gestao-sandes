# Roteiro de testes — Sandes CRM

Marque cada item com `[x]` quando funcionar. Se algo falhar, anote **a tela, o que você fez e o que apareceu** (um print ajuda muito).

## Antes de começar

- [ ] O SQL `app/supabase/migrations/0004_storage_policies.sql` foi rodado no SQL Editor do Supabase (sem ele, documentos não abrem).
- [ ] O deploy mais recente está no ar na Vercel (atualize a página com Cmd+Shift+R).
- [ ] As 3 variáveis do Supabase estão cadastradas na Vercel.
- [ ] Para testar o analisador de currículo: `ANTHROPIC_API_KEY` cadastrada na Vercel.
- [ ] Teste em **dois tamanhos**: no celular (ou janela estreita) e no computador.

**Contas de demonstração** (senha combinada com o Daniel):

| Papel | E-mail | Situação |
|---|---|---|
| Admin | contato@forgid.com | Katryn |
| Candidato | candidato.teste@forgid.com | Plano Essência & Propósito, perfil completo |
| Candidato | mariana.costa@exemplo.com | Plano Clareza & Futuro |
| Candidato | rafael.souza@exemplo.com | Plano Reconexão, 22 dias parado (deve aparecer como risco) |
| Candidato | juliana.prado@exemplo.com | Sem plano, conta nova |

---

## 1. Acesso e navegação

- [ ] Login com e-mail e senha corretos leva à tela certa (admin → Dashboard; candidato → Início).
- [ ] Senha errada mostra "E-mail ou senha inválidos".
- [ ] Sem estar logado, abrir qualquer endereço interno redireciona para o login.
- [ ] Candidato digitando `/admin` no endereço é barrado.
- [ ] No celular, o botão ☰ abre e fecha o menu, e o menu fecha ao escolher uma tela.
- [ ] No computador, o menu lateral fica fixo.
- [ ] Nenhuma tela tem barra de rolagem lateral no celular.
- [ ] Botão "Sair" funciona.

## 2. Candidato

### Início (`/inicio`)
- [ ] Mostra nível, pontos e barra de progresso.
- [ ] Os 4 números (candidaturas no mês, total, % que viraram entrevista, tempo médio) batem com as candidaturas.
- [ ] "Próximos passos" mostra itens coerentes e clicar leva à tela certa.
- [ ] "Conquistas" mostra as liberadas e as bloqueadas.
- [ ] "Linha do tempo" lista a atividade em ordem, da mais recente para a mais antiga.
- [ ] Com a **Juliana** (conta nova): aparece a mensagem de boas-vindas e o passo "Registrar sua primeira candidatura".

### Candidaturas (`/candidaturas`)
- [ ] "+ Nova candidatura": só cargo e empresa são obrigatórios; ao salvar, o card aparece em **Indefinido**.
- [ ] No celular, as 4 colunas rolam para o lado e o seletor "Status" muda a coluna do card.
- [ ] No computador, arrastar o card entre colunas funciona.
- [ ] Marcar itens do checklist atualiza a barrinha (0/4 a 4/4) e continua marcado depois de atualizar a página.
- [ ] Mudar para **Entrevista** gera pontos (confira em Progresso).
- [ ] Os campos da planilha original da Katryn existem no formulário (segmento, data de envio, link da vaga, LinkedIn da empresa, plataforma, recrutador, notas). **Katryn: falta algum?**

### Documentos (`/documentos`)
- [ ] Lista os documentos com o status certo (Pendente de assinatura / Assinado).
- [ ] "Ver / baixar" abre o PDF.
- [ ] "Enviar assinado" aceita um PDF; depois o status muda para **Assinado** e a data aparece.
- [ ] Um candidato **não vê** documentos de outro.

### Currículo (IA) (`/curriculo`)
- [ ] Enviar um PDF real retorna score, cargos compatíveis e pontos de melhoria.
- [ ] Colar a descrição de uma vaga retorna também a aderência à vaga.
- [ ] A contagem "(N restantes)" diminui só em análises bem-sucedidas.
- [ ] Depois de 3 análises, o envio é bloqueado com aviso.
- [ ] Arquivo que não é PDF é recusado.
- [ ] Se a IA falhar, aparece mensagem clara e a cota **não** é gasta.
- [ ] **Katryn: o resultado da IA faz sentido para o currículo enviado?**

### Exercícios (`/exercicios`)
- [ ] **Lista Mestra:** adicionar, editar e excluir uma experiência; os dados continuam depois de atualizar.
- [ ] **Shazam, Autoconhecimento e PDI** aparecem só para o plano **Essência & Propósito** (testar com Candidato Teste e com Mariana).
- [ ] Shazam: as 5 etapas salvam e dá para marcar como concluído.
- [ ] Autoconhecimento: as 9 perguntas e a lista de empresas-alvo salvam.
- [ ] PDI: adicionar metas por competência (curto/médio/longo prazo) e linhas do 5W2H; excluir funciona.
- [ ] No celular, as abas rolam para o lado.

### Progresso (`/progresso`)
- [ ] Nível atual, pontos e "faltam X pontos" estão corretos.
- [ ] A trilha dos 5 níveis marca os já alcançados.
- [ ] Repetir a mesma ação muitas vezes no mesmo dia **para** de pontuar (limite diário: 5 candidaturas e 8 itens de checklist).

### Prompts de IA (`/prompts`)
- [ ] Lista, busca por título e filtro por categoria funcionam.
- [ ] "Copiar" coloca o texto na área de transferência.

### Notificações (`/notificacoes`)
- [ ] Lista institucionais e comportamentais; clicar marca como lida.
- [ ] Com o **Rafael** (22 dias parado): aparece o aviso de inatividade.
- [ ] Abrir o app várias vezes **não** repete o mesmo aviso.
- [ ] Uma candidatura sem atualização há 10 dias ou mais gera aviso de "candidatura parada".

## 3. Admin (Katryn)

### Dashboard (`/admin`)
- [ ] Os 4 números (total, engajados, risco, documentos pendentes) estão coerentes.
- [ ] O **Rafael** aparece em "Alertas de risco de evasão".
- [ ] A lista da carteira abre o perfil do candidato ao clicar.

### Carteira (`/admin/candidatos`)
- [ ] Busca por nome e por e-mail.
- [ ] Filtros por plano, situação (risco, engajado, documento pendente, sem candidaturas) e ordenação.
- [ ] No celular aparece em cartões; no computador, em tabela.

### Perfil do candidato
- [ ] Atribuir ou trocar o plano salva, e os módulos do candidato mudam (conferir em Exercícios com o login dele).
- [ ] Mostra candidaturas, exercícios, documentos, análises de currículo e pontuação.
- [ ] **Anotações privadas:** adicionar uma anotação; confirmar que o candidato **não** a vê.
- [ ] **Exportar relatório (PDF):** baixa um PDF com os dados corretos.

### Templates de documentos (`/admin/documentos`)
- [ ] Criar template enviando um PDF, com a opção "requer assinatura".
- [ ] Selecionar vários candidatos e enviar em lote.
- [ ] Entrar como um desses candidatos e conferir que o documento chegou e abre.

### Prompts de IA (`/admin/prompts`)
- [ ] Criar, editar e excluir um prompt; marcar "novo" e "destaque".
- [ ] O prompt novo aparece na visão do candidato.

## 4. Fluxos de ponta a ponta

**A. Onboarding de um candidato novo (critério de "MVP pronto" do cronograma)**
1. Admin cria o usuário no Supabase (Authentication → Users, com `nome` e `role` em user metadata).
2. Admin atribui um plano.
3. Admin envia o contrato em lote.
4. Candidato entra, assina o documento, registra 3 candidaturas e move uma para Entrevista.
5. Admin abre o perfil e vê tudo isso refletido (pontos, linha do tempo, documento assinado).

**B. Evasão:** usar o Rafael → ele aparece no alerta do dashboard → admin escreve uma anotação privada.

**C. Currículo:** candidato envia o PDF, aplica as melhorias, envia de novo e compara os scores.

## 5. Segurança básica

- [ ] Um candidato só enxerga os próprios dados (candidaturas, documentos, notificações).
- [ ] Candidato não consegue abrir telas `/admin/...`.
- [ ] Anotações privadas nunca aparecem para o candidato.
- [ ] Antes de usar com pessoas reais: **trocar as senhas de teste e gerar novas chaves do Supabase**.

## 6. Perguntas para a Katryn

- [ ] Os pesos de pontuação fazem sentido? (candidatura +10, checklist +5, entrevista +15, currículo +10, exercício +25, documento assinado +10, vaga fechada +100)
- [ ] Os limiares de nível (30 / 80 / 150 / 250 pontos) estão bons?
- [ ] "Risco de evasão" = mais de 7 dias sem atividade. É o critério certo?
- [ ] Os avisos automáticos estão no tom que ela quer? (2 dias sem cadastrar, 10 dias parada)
- [ ] Faltou algum campo ou fluxo que ela usa hoje na planilha?

## Registro de problemas

| Tela | O que fiz | O que aconteceu | Prioridade |
|---|---|---|---|
|  |  |  |  |
