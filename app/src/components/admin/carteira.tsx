"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { PLANO_LABELS } from "@/lib/types/database";
import type { LinhaCarteiraDados } from "@/lib/data/admin";

export type LinhaCarteira = LinhaCarteiraDados;

export interface FiltrosAtuais {
  busca: string;
  plano: string;
  situacao: string;
  ordem: string;
}

const campo = "min-h-10 w-full rounded-xl border bg-surface px-3 text-sm";

function Selo({ children, tom }: { children: React.ReactNode; tom: "risco" | "ok" | "doc" }) {
  const cores = {
    risco: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
    ok: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    doc: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  }[tom];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cores}`}>{children}</span>;
}

// Os filtros vão para o endereço (?busca=…&plano=…), e o servidor consulta só a página pedida.
export function CarteiraComFiltros({
  linhas,
  total,
  filtros,
}: {
  linhas: LinhaCarteira[];
  total: number;
  filtros: FiltrosAtuais;
}) {
  const router = useRouter();
  const caminho = usePathname();
  const [busca, setBusca] = useState(filtros.busca);
  const primeira = useRef(true);

  function ir(novo: Partial<FiltrosAtuais>) {
    const f = { ...filtros, busca, ...novo };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) qs.set(k, v);
    router.push(`${caminho}${qs.size ? `?${qs.toString()}` : ""}`);
  }

  // Busca por texto com pequena espera, para não consultar a cada tecla
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (busca.trim() !== filtros.busca) ir({ busca: busca.trim() });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const temFiltro = filtros.busca || filtros.plano || filtros.situacao;

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar candidato"
            className={campo}
          />
        </div>
        <select aria-label="Plano" value={filtros.plano} onChange={(e) => ir({ plano: e.target.value })} className={campo}>
          <option value="">Todos os planos</option>
          {Object.entries(PLANO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
          <option value="sem_plano">Sem plano</option>
        </select>
        <select aria-label="Situação" value={filtros.situacao} onChange={(e) => ir({ situacao: e.target.value })} className={campo}>
          <option value="">Qualquer situação</option>
          <option value="risco">Risco de evasão</option>
          <option value="engajado">Engajados</option>
          <option value="doc_pendente">Documento pendente</option>
          <option value="sem_candidaturas">Sem candidaturas</option>
        </select>
        <select aria-label="Ordenação" value={filtros.ordem} onChange={(e) => ir({ ordem: e.target.value })} className={campo}>
          <option value="">Ordenar: nome</option>
          <option value="pontos">Ordenar: mais pontos</option>
          <option value="atividade">Ordenar: mais tempo parado</option>
          <option value="entrada">Ordenar: entrada recente</option>
        </select>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-foreground/60">
        <span className="num">{total} {total === 1 ? "candidato" : "candidatos"}</span>
        {temFiltro && (
          <Link href={caminho} className="font-medium text-brand-strong hover:underline">
            Limpar filtros
          </Link>
        )}
      </div>

      {linhas.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-foreground/60">
          Nenhum candidato com esses filtros.
        </p>
      ) : (
        <>
          {/* Cartões abaixo de lg */}
          <ul className="space-y-2.5 lg:hidden">
            {linhas.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/candidatos/${l.id}`} className="block rounded-2xl border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.nome}</p>
                      <p className="truncate text-xs text-foreground/55">{l.email}</p>
                    </div>
                    {l.risco ? <Selo tom="risco">Risco</Selo> : <Selo tom="ok">Engajado</Selo>}
                  </div>
                  <p className="mt-2 text-xs text-foreground/65">
                    {l.plano ? PLANO_LABELS[l.plano as keyof typeof PLANO_LABELS] : "Sem plano"}
                    {l.documentosPendentes > 0 && ` · ${l.documentosPendentes} documento(s) pendente(s)`}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      [String(l.candidaturasAtivas), "ativas"],
                      [String(l.pontos), "pontos"],
                      [l.diasSemAtividade === null ? "—" : `${l.diasSemAtividade}d`, "parado"],
                    ].map(([v, r]) => (
                      <div key={r} className="rounded-xl bg-background p-2">
                        <p className="num font-display text-lg font-semibold">{v}</p>
                        <p className="text-foreground/55">{r}</p>
                      </div>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tabela a partir de lg, sem rolagem lateral */}
          <div className="hidden rounded-2xl border bg-surface lg:block">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b text-left text-foreground/55">
                  <th className="w-[30%] px-4 py-3 font-medium">Nome</th>
                  <th className="w-[20%] px-4 py-3 font-medium">Plano</th>
                  <th className="w-[9%] px-4 py-3 font-medium">Ativas</th>
                  <th className="w-[9%] px-4 py-3 font-medium">Pontos</th>
                  <th className="w-[14%] px-4 py-3 font-medium">Atividade</th>
                  <th className="w-[18%] px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-brand-soft/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/candidatos/${l.id}`} className="block truncate font-medium hover:underline">
                        {l.nome}
                      </Link>
                      <p className="truncate text-xs text-foreground/55">{l.email}</p>
                    </td>
                    <td className="truncate px-4 py-3">
                      {l.plano ? PLANO_LABELS[l.plano as keyof typeof PLANO_LABELS] : "—"}
                    </td>
                    <td className="num px-4 py-3">{l.candidaturasAtivas}</td>
                    <td className="num px-4 py-3">{l.pontos}</td>
                    <td className="px-4 py-3">{l.diasSemAtividade === null ? "—" : `${l.diasSemAtividade}d atrás`}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {l.risco ? <Selo tom="risco">Risco</Selo> : <Selo tom="ok">Engajado</Selo>}
                        {l.documentosPendentes > 0 && <Selo tom="doc">{l.documentosPendentes} doc</Selo>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function IconeCarteira() {
  return <Icon name="carteira" className="h-5 w-5" />;
}
