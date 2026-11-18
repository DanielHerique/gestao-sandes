/** Serviços da Sandes (valores do Figma). Pagamento fora da plataforma. */
export const DESCONTO_SERVICOS = 5;

export interface Servico {
  nome: string;
  descricao: string;
  preco: number;
}

export const SERVICOS: Servico[] = [
  { nome: "Apresentação & Confiança", descricao: "Simulação de entrevista e revisão do seu LinkedIn.", preco: 699 },
  { nome: "Conexão & Autoridade", descricao: "Estratégia de rede e posicionamento no LinkedIn.", preco: 699 },
  { nome: "Mentoria Essência & Propósito", descricao: "Seis sessões com autoconhecimento e plano de carreira.", preco: 3899 },
];

export const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Número do WhatsApp da Sandes (somente dígitos, com DDI), definido em NEXT_PUBLIC_WHATSAPP_SANDES. */
export function linkWhatsapp(mensagem: string): string | null {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_SANDES ?? "").replace(/\D/g, "");
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
