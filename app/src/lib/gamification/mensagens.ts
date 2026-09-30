// Mensagens do sistema — guia de tom incorporado de KAT_Estrategia_de_Gamificacao.docx
// (seção 8 do documento original, SEM o conceito de mascote — ver documentos/DECISOES_GAMIFICACAO.md)
//
// Guia de tom:
// - Direto: uma mensagem, uma razão, uma ação sugerida.
// - Específico: reconhece o que foi feito, nunca elogio genérico.
// - Adulto: sem diminutivos, sem euforia constante, sem linguagem infantil.
// - Honesto: nunca promete vaga, prazo ou retorno do mercado.
// - Acolhedor: valida a dificuldade sem terminar a mensagem só na emoção.

export type SituacaoMensagem =
  | "primeiro_acesso"
  | "missao_concluida"
  | "ritmo_mantido"
  | "ritmo_interrompido"
  | "curriculo_finalizado"
  | "candidatura_enviada"
  | "entrevista_marcada"
  | "reprovacao"
  | "sem_resposta"
  | "conquista_vaga";

export const MENSAGENS_SISTEMA: Record<SituacaoMensagem, string> = {
  primeiro_acesso:
    "Vamos entender seu momento e escolher um próximo passo possível. Leva cerca de cinco minutos.",
  missao_concluida:
    "Você transformou uma experiência em evidência. Isso fortalece sua narrativa profissional.",
  ritmo_mantido:
    "Mais uma semana com movimento. Consistência aqui significa avançar no seu ritmo, com intenção.",
  ritmo_interrompido:
    "Sua trajetória continua aqui. Quer retomar com uma missão de dez minutos ou atualizar sua prioridade?",
  curriculo_finalizado:
    "Seu currículo agora mostra melhor o impacto da sua trajetória. O próximo passo é alinhar essa história ao LinkedIn.",
  candidatura_enviada:
    "Candidatura registrada. Anote a próxima ação e a data de acompanhamento para não depender da memória.",
  entrevista_marcada:
    "Boa notícia. Vamos preparar três histórias que comprovem sua aderência à vaga.",
  reprovacao:
    "Essa resposta pode frustrar. Quando fizer sentido, registre o que você aprendeu e escolha um ajuste para o próximo processo.",
  sem_resposta:
    "O silêncio não mede sua competência. Você pode fazer um contato de acompanhamento e manter outras oportunidades em movimento.",
  conquista_vaga:
    "Você abriu um novo capítulo. Agora vamos organizar seus primeiros 30 dias e preservar o que aprendeu nesta jornada.",
};
