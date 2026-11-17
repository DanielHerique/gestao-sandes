// Utilitários de agenda (sem acesso a banco). Fuso fixo de Brasília (UTC-3, sem horário de verão).
export const FUSO = "America/Sao_Paulo";
const OFFSET_MS = 3 * 3600000;

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const ANTECEDENCIA_AGENDAR_H = 12; // mínimo para marcar
export const ANTECEDENCIA_CANCELAR_H = 24; // mínimo para o candidato cancelar
export const JANELA_DIAS = 14;

export interface Slot {
  inicio: string; // ISO UTC
  fim: string;
}

/** "14:30:00" -> minutos desde 00:00 */
function minutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Data (ano, mês, dia) de Brasília + minutos -> instante UTC */
function paraUtc(ano: number, mes: number, dia: number, min: number): number {
  return Date.UTC(ano, mes, dia, 0, min) + OFFSET_MS;
}

export function gerarSlots(
  blocos: { dia_semana: number; hora_inicio: string; hora_fim: string; duracao_min: number }[],
  ocupados: { inicio: string; fim: string }[],
  agora = Date.now(),
): Slot[] {
  const ocup = ocupados.map((o) => [new Date(o.inicio).getTime(), new Date(o.fim).getTime()] as const);
  const limiteInicial = agora + ANTECEDENCIA_AGENDAR_H * 3600000;
  const hojeBr = new Date(agora - OFFSET_MS);
  const slots: Slot[] = [];

  for (let d = 0; d <= JANELA_DIAS; d++) {
    const dia = new Date(Date.UTC(hojeBr.getUTCFullYear(), hojeBr.getUTCMonth(), hojeBr.getUTCDate() + d));
    const dow = dia.getUTCDay();
    for (const b of blocos.filter((x) => x.dia_semana === dow)) {
      const fimBloco = minutos(b.hora_fim);
      for (let m = minutos(b.hora_inicio); m + b.duracao_min <= fimBloco; m += b.duracao_min) {
        const ini = paraUtc(dia.getUTCFullYear(), dia.getUTCMonth(), dia.getUTCDate(), m);
        const fim = ini + b.duracao_min * 60000;
        if (ini < limiteInicial) continue;
        if (ocup.some(([a, z]) => ini < z && fim > a)) continue;
        slots.push({ inicio: new Date(ini).toISOString(), fim: new Date(fim).toISOString() });
      }
    }
  }
  return slots.sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function formatarDiaCompleto(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: FUSO });
}
export function formatarDiaCurto(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: FUSO }).replace(".", "");
}
export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO });
}
export function formatarDataHora(iso: string): string {
  return `${formatarDiaCurto(iso)}, ${formatarHora(iso)}`;
}
/** Chave AAAA-MM-DD do dia em Brasília, para agrupar */
export function chaveDia(iso: string): string {
  return new Date(new Date(iso).getTime() - OFFSET_MS).toISOString().slice(0, 10);
}
