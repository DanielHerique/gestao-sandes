"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLANO_LABELS } from "@/lib/types/database";

export interface LinhaCarteira {
  id: string;
  nome: string;
  email: string;
  plano: string | null;
  candidaturasAtivas: number;
  totalCandidaturas: number;
  pontos: number;
  diasSemAtividade: number | null;
  documentosPendentes: number;
  risco: boolean;
  entrouEm: string;
}

type Ordem = "nome" | "pontos" | "atividade" | "entrada";

const campo =
  "min-h-10 rounded-lg border bg-background px-3 text-sm";

export function CarteiraComFiltros({ linhas }: { linhas: LinhaCarteira[] }) {
  const [busca, setBusca] = useState("");
  const [plano, setPlano] = useState("");
  const [situacao, setSituacao] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("nome");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const r = linhas.filter((l) => {
      if (termo && !`${l.nome} ${l.email}`.toLowerCase().includes(termo)) return false;
      if (plano === "sem_plano" && l.plano) return false;
      if (plano && plano !== "sem_plano" && l.plano !== plano) return false;
      if (situacao === "risco" && !l.risco) return false;
      if (situacao === "engajado" && l.risco) return false;
      if (situacao === "doc_pendente" && l.documentosPendentes === 0) return false;
      if (situacao === "sem_candidaturas" && l.totalCandidaturas > 0) return false;
      return true;
    });
    return [...r].sort((a, b) => {
      switch (ordem) {
        case "pontos":
          return b.pontos - a.pontos;
        case "atividade":
          return (b.diasSemAtividade ?? 9999) - (a.diasSemAtividade ?? 9999);
        case "entrada":
          return b.entrouEm.localeCompare(a.entrouEm);
        default:
          return a.nome.localeCompare(b.nome);
      }
    });
  }, [linhas, busca, plano, situacao, ordem]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className={`${campo} sm:col-span-2 lg:col-span-1`}
        />
        <select value={plano} onChange={(e) => setPlano(e.target.value)} className={campo}>
          <option value="">Todos os planos</option>
          {Object.entries(PLANO_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
          <option value="sem_plano">Sem plano</option>
        </select>
        <select value={situacao} onChange={(e) => setSituacao(e.target.value)} className={campo}>
          <option value="">Qualquer situação</option>
          <option value="risco">Risco de evasão</option>
          <option value="engajado">Engajados</option>
          <option value="doc_pendente">Documento pendente</option>
          <option value="sem_candidaturas">Sem candidaturas</option>
        </select>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className={campo}>
          <option value="nome">Ordenar: nome</option>
          <option value="pontos">Ordenar: mais pontos</option>
          <option value="atividade">Ordenar: mais tempo parado</option>
          <option value="entrada">Ordenar: entrada recente</option>
        </select>
      </div>

      <p className="mb-2 text-xs text-foreground/60">
        {filtradas.length} de {linhas.length} candidatos
      </p>

      {filtradas.length === 0 ? (
        <p className="rounded-lg border bg-surface p-4 text-sm text-foreground/60">
          Nenhum candidato com esses filtros.
        </p>
      ) : (
        <>
          {/* Cartões no celular */}
          <ul className="space-y-2 md:hidden">
            {filtradas.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/candidatos/${l.id}`}
                  className="block rounded-xl border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.nome}</p>
                      <p className="truncate text-xs text-foreground/60">{l.email}</p>
                    </div>
                    {l.risco && (
                      <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        Risco
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-foreground/70">
                    {l.plano ? PLANO_LABELS[l.plano as keyof typeof PLANO_LABELS] : "Sem plano"}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-background p-2">
                      <p className="text-base font-semibold">{l.candidaturasAtivas}</p>
                      <p className="text-foreground/60">ativas</p>
                    </div>
                    <div className="rounded-lg bg-background p-2">
                      <p className="text-base font-semibold">{l.pontos}</p>
                      <p className="text-foreground/60">pontos</p>
                    </div>
                    <div className="rounded-lg bg-background p-2">
                      <p className="text-base font-semibold">
                        {l.diasSemAtividade === null ? "—" : `${l.diasSemAtividade}d`}
                      </p>
                      <p className="text-foreground/60">parado</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tabela a partir de md */}
          <div className="hidden overflow-x-auto rounded-xl border bg-surface md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-foreground/60">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Ativas</th>
                  <th className="px-4 py-3 font-medium">Pontos</th>
                  <th className="px-4 py-3 font-medium">Última atividade</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-brand-soft/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/candidatos/${l.id}`} className="font-medium hover:underline">
                        {l.nome}
                      </Link>
                      <p className="text-xs text-foreground/60">{l.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {l.plano ? PLANO_LABELS[l.plano as keyof typeof PLANO_LABELS] : "—"}
                    </td>
                    <td className="px-4 py-3">{l.candidaturasAtivas}</td>
                    <td className="px-4 py-3">{l.pontos}</td>
                    <td className="px-4 py-3">
                      {l.diasSemAtividade === null ? "—" : `${l.diasSemAtividade}d atrás`}
                    </td>
                    <td className="px-4 py-3">
                      {l.risco ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Risco
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Engajado
                        </span>
                      )}
                      {l.documentosPendentes > 0 && (
                        <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {l.documentosPendentes} doc
                        </span>
                      )}
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
