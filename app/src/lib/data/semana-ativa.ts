import { createClient } from "@/lib/supabase/server";

export interface SemanaAtiva {
  rotulo: string; // S1..S5, Agora
  ativa: boolean;
}

/** Segunda-feira 00:00 da semana da data informada. */
function inicioDaSemana(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

/**
 * Semana ativa: basta uma ação na semana (vaga registrada ou qualquer evento
 * da plataforma). Devolve as últimas 6 semanas, a última é "Agora".
 */
export async function semanasAtivas(candidatoId: string, total = 6): Promise<SemanaAtiva[]> {
  const supabase = await createClient();
  const atual = inicioDaSemana(new Date());
  const desde = new Date(atual);
  desde.setDate(desde.getDate() - 7 * (total - 1));
  const desdeIso = desde.toISOString();

  const [{ data: eventos }, { data: vagas }] = await Promise.all([
    supabase.from("pontuacao_eventos").select("created_at").eq("candidato_id", candidatoId).gte("created_at", desdeIso),
    supabase.from("candidaturas").select("created_at").eq("candidato_id", candidatoId).gte("created_at", desdeIso),
  ]);

  const datas = [...(eventos ?? []), ...(vagas ?? [])].map((x) => inicioDaSemana(new Date(x.created_at)).getTime());
  const conjunto = new Set(datas);

  return Array.from({ length: total }, (_, i) => {
    const ini = new Date(desde);
    ini.setDate(ini.getDate() + 7 * i);
    return { rotulo: i === total - 1 ? "Agora" : `S${i + 1}`, ativa: conjunto.has(ini.getTime()) };
  });
}
