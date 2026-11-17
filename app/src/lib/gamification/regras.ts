import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LIMITE_DIARIO_POR_ACAO,
  NIVEIS,
  PONTOS_POR_ACAO,
  type AcaoPontuavel,
  type NivelDefinicao,
} from "@/lib/gamification/pontos";

// Regras editáveis pelo admin (tabelas gamificacao_regras e gamificacao_config).
// Sem registro ou sem as tabelas, vale o padrão do PRD (pontos.ts).

export interface ConfigGamificacao {
  nivel_2_pontos: number;
  nivel_3_pontos: number;
  nivel_4_pontos: number;
  nivel_5_pontos: number;
  aviso_dias_sem_cadastrar: number;
  aviso_dias_candidatura_parada: number;
  bonus_dias_parada: number;
}

export const CONFIG_PADRAO: ConfigGamificacao = {
  nivel_2_pontos: 30,
  nivel_3_pontos: 80,
  nivel_4_pontos: 150,
  nivel_5_pontos: 250,
  aviso_dias_sem_cadastrar: 2,
  aviso_dias_candidatura_parada: 10,
  bonus_dias_parada: 5,
};

export interface RegrasGamificacao {
  pontos: Record<AcaoPontuavel, number>;
  limites: Partial<Record<AcaoPontuavel, number>>;
  ativas: Partial<Record<AcaoPontuavel, boolean>>;
  config: ConfigGamificacao;
}

export const carregarRegras = cache(async (): Promise<RegrasGamificacao> => {
  const regras: RegrasGamificacao = {
    pontos: { ...PONTOS_POR_ACAO },
    limites: { ...LIMITE_DIARIO_POR_ACAO },
    ativas: {},
    config: { ...CONFIG_PADRAO },
  };
  try {
    const admin = createAdminClient();
    const [{ data: linhas, error: e1 }, { data: cfg, error: e2 }] = await Promise.all([
      admin.from("gamificacao_regras").select("acao, pontos, limite_diario, ativo"),
      admin.from("gamificacao_config").select("chave, valor"),
    ]);
    if (!e1) {
      for (const l of linhas ?? []) {
        const acao = l.acao as AcaoPontuavel;
        if (!(acao in regras.pontos)) continue;
        regras.pontos[acao] = l.pontos;
        if (l.limite_diario === null) delete regras.limites[acao];
        else regras.limites[acao] = l.limite_diario;
        regras.ativas[acao] = l.ativo;
      }
    }
    if (!e2) {
      for (const c of cfg ?? []) {
        if (c.chave in regras.config) (regras.config as unknown as Record<string, number>)[c.chave] = c.valor;
      }
    }
  } catch {
    // mantém o padrão
  }
  return regras;
});

export function niveisComConfig(config: ConfigGamificacao): NivelDefinicao[] {
  const minimos = [0, config.nivel_2_pontos, config.nivel_3_pontos, config.nivel_4_pontos, config.nivel_5_pontos];
  return NIVEIS.map((n, i) => ({ ...n, pontosMinimos: minimos[i] }));
}

export async function carregarNiveis(): Promise<NivelDefinicao[]> {
  return niveisComConfig((await carregarRegras()).config);
}
