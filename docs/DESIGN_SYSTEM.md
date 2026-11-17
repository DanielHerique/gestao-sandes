# Design system Sandes: regras visuais do projeto

Fonte: arquivo Figma "Plataforma Sandes - Design" (v1.0, outubro de 2026), definido pela Sandes. Resumo completo em `docs/figma-plataforma-sandes.md`; capturas em `telas_figma/`.

**Estas regras valem para todo código de interface. Antes de criar ou alterar tela ou componente, siga este documento. Mudou o visual no Figma? Atualize aqui e em `app/src/app/globals.css` primeiro, depois as telas.**

## Camadas

1. **Primitivos** (cores cruas): só dentro de `globals.css`, nunca usados direto em componente.
2. **Tokens** (cor por papel, espaço, raio, sombra): variáveis CSS em `globals.css` e tema do Tailwind com o mesmo nome do Figma (`--color-bg-surface`, `--spacing-16`, `--radius-lg`, `--shadow-float`).
3. **Componentes** (Botão, Etiqueta, Campo, Cartão, Item de missão, Selo de nível, Navegação, Ícones): uma peça por vez, reaproveitada em todas as telas.
4. **Telas**: só montam componentes. Sem estilo próprio, só layout.

## Regras que não se negociam

- Nenhum hex, px ou fonte solta no código de tela. Tudo vem de token ou componente.
- Um botão principal (âmbar com texto carvão) por seção. Nunca texto branco sobre âmbar, nem âmbar como letra em fundo claro.
- Alvo de toque de no mínimo 48 px, com foco sempre visível.
- Sucesso, erro e informação sempre com texto, nunca só com cor.
- Etiqueta nunca é clicável. Se precisa de clique, é Botão.
- Campo com rótulo acima. Placeholder não substitui o rótulo, e o erro diz como resolver, em vermelho.
- Um cartão escuro por tela, no conteúdo mais importante. Nunca dois cartões escuros vizinhos.
- Funciona em 390, 810 e 1440 px sem rolagem lateral, navegável por teclado, contraste AA.
- Ícones de linha (traço 2, cantos arredondados, grade 24 px), nunca preenchidos e nunca emoji.
- Textos: português do Brasil, direto, sem travessão e sem emoji. Títulos com até 10 palavras, sem ponto final.
- Só tema claro (o Figma não define tema escuro).

## Cores

| Token | Valor | Uso |
|---|---|---|
| amber/500 | #FF9800 | Botão principal, progresso, marca |
| amber/200 | #FFD580 | Cupom, cartão premium, oferta |
| amber/100 | #FFF0D1 | Etiqueta, item ativo, pendência |
| amber/700 | #9E6400 | Texto âmbar em fundo claro |
| charcoal/900 | #1F2429 | Texto principal, seções escuras |
| graphite/800 | #2E353C | Escuro secundário, trilho |
| gray/600 | #585F63 | Texto de apoio |
| gray/200 | #E6E7E8 | Borda hairline |
| mist/100 | #F1F2F3 | Superfície neutra |
| offwhite/50 | #F7F7F4 | Fundo da página |
| white | #FFFFFF | Cartões |
| success/700 e /100 | #2F6F3E e #E7F3EA | Sucesso (texto e ícone, fundo) |
| error/700 e /100 | #B3261E e #FDE0E0 | Erro (texto e ícone, fundo) |
| info/700 e /100 | #1A5FB4 e #E3EFFD | Informação (texto, fundo) |

Proporção: cerca de 65% fundos claros, 20% carvão e 15% âmbar. Contraste do botão: carvão sobre âmbar 8,3:1.

## Tipografia

Asap em tudo, pesos 400, 600 e 700.

| Estilo | Tamanho/linha | Peso |
|---|---|---|
| Display (h1) | 32/38 | 700 |
| Title | 24/30 | 700 |
| Heading | 18/24 | 600 |
| Body | 16/24 | 400 |
| Body strong | 16/24 | 600 |
| Small | 14/20 | 400 |
| Small strong | 14/20 | 600 |
| Caption | 12/16 | 600 |
| Button | 16/20 | 600 |
| Number | 28/32 | 700 |

## Espaço, raios e sombras

- Grade de 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 64, 96.
- Raios: sm (etiquetas), md (campos e notas), lg (cartões), full (botões e filtros). Filho nunca mais redondo que o pai.
- Sombras: flutuante (hover de cartão clicável e menus) e sobreposição (modal e folha inferior). Em repouso, só borda hairline. Borda ou sombra, nunca as duas fortes.

## Componentes

- **Botão:** pílula. Principal âmbar com texto carvão. Secundário com borda carvão. Link para ações leves. Altura mínima de 48 px.
- **Etiqueta:** status, etapa, pontos e categoria.
- **Campo:** rótulo acima, ajuda opcional abaixo, erro em vermelho.
- **Cartão:** claro por padrão, escuro para o mais importante, âmbar claro para oferta e premium. Texto de apoio com até 3 linhas.
- **Item de missão:** tarefa curta com tempo e pontos; a linha inteira é área de toque. Sem contagem regressiva e sem punição por missão não feita.
- **Selo de nível e cartão de plano:** nível por marco em fundo escuro. Plano com um único recomendado, ao centro.
- **Navegação:** celular com barra superior e barra inferior de até 5 itens (item ativo indicado por fundo âmbar claro e peso, não só por cor). Desktop com cabeçalho superior.

## Como mudar o visual

1. Altere o token em `globals.css` (nunca o valor na tela).
2. Se faltar peça, siga: procurar no Figma, combinar peças existentes, pedir ao designer, registrar aqui e no Figma.
