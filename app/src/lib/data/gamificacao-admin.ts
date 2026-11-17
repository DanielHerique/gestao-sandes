import { createAdminClient } from "@/lib/supabase/admin";
import { PONTOS_POR_ACAO, type AcaoPontuavel } from "@/lib/gamification/pontos";
import { carregarRegras, type ConfigGamificacao } from "@/lib/gamification/regras";

export interface LinhaRegra {
  acao: AcaoPontuavel;
  pontos: number;
  limiteDiario: number | null;
  ativo: boolean;
}

export async function obterRegrasParaEdicao(): Promise<{ linhas: LinhaRegra[]; config: ConfigGamificacao }> {
  const r = await carregarRegras();
  const linhas = (Object.keys(PONTOS_POR_ACAO) as AcaoPontuavel[]).map((acao) => ({
    acao,
    pontos: r.pontos[acao],
    limiteDiario: r.limites[acao] ?? null,
    ativo: r.ativas[acao] !== false,
  }));
  return { linhas, config: r.config };
}

export async function salvarRegras(linhas: LinhaRegra[], config: ConfigGamificacao): Promise<void> {
  const admin = createAdminClient();
  const agora = new Date().toISOString();

  const { error: e1 } = await admin.from("gamificacao_regras").upsert(
    linhas.map((l) => ({
      acao: l.acao,
      pontos: Math.max(0, Math.round(l.pontos)),
      limite_diario: l.limiteDiario === null ? null : Math.max(0, Math.round(l.limiteDiario)),
      ativo: l.ativo,
      updated_at: agora,
    })),
  );
  if (e1) throw e1;

  const { error: e2 } = await admin.from("gamificacao_config").upsert(
    Object.entries(config).map(([chave, valor]) => ({
      chave,
      valor: Math.max(0, Math.round(valor)),
      updated_at: agora,
    })),
  );
  if (e2) throw e2;
}
