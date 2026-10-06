"use client";

import { useState } from "react";
import type {
  ExercicioAutoconhecimento,
  ExercicioListaMestraLinha,
  ExercicioPdi5w2h,
  ExercicioPdiMeta,
  ExercicioShazam,
  ExercicioStatus,
} from "@/lib/types/database";
import { ListaMestra } from "./lista-mestra";
import { Shazam } from "./shazam";
import { Autoconhecimento } from "./autoconhecimento";
import { Pdi } from "./pdi";

type Aba = "lista_mestra" | "shazam" | "autoconhecimento" | "pdi";

export function ExerciciosTabs({
  autoconhecimentoLiberado,
  listaMestra,
  shazam,
  autoconhecimento,
  pdiMetas,
  pdi5w2h,
  pdiStatus,
}: {
  autoconhecimentoLiberado: boolean;
  listaMestra: ExercicioListaMestraLinha[];
  shazam: ExercicioShazam | null;
  autoconhecimento: ExercicioAutoconhecimento | null;
  pdiMetas: ExercicioPdiMeta[];
  pdi5w2h: ExercicioPdi5w2h[];
  pdiStatus: ExercicioStatus;
}) {
  const [aba, setAba] = useState<Aba>("lista_mestra");

  const abas: { id: Aba; label: string; disponivel: boolean }[] = [
    { id: "lista_mestra", label: "Lista Mestra", disponivel: true },
    { id: "shazam", label: "Ferramenta Shazam", disponivel: autoconhecimentoLiberado },
    {
      id: "autoconhecimento",
      label: "Aprofundando o Autoconhecimento",
      disponivel: autoconhecimentoLiberado,
    },
    { id: "pdi", label: "PDI", disponivel: autoconhecimentoLiberado },
  ];

  return (
    <div>
      <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {abas.map((item) => (
          <button
            key={item.id}
            disabled={!item.disponivel}
            onClick={() => setAba(item.id)}
            className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm ${
              aba === item.id
                ? "border-b-2 border-brand font-medium"
                : "text-foreground/60"
            } ${!item.disponivel ? "cursor-not-allowed opacity-40" : ""}`}
            title={
              !item.disponivel
                ? "Disponível apenas no plano Essência & Propósito"
                : undefined
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {aba === "lista_mestra" && <ListaMestra linhas={listaMestra} />}
      {aba === "shazam" && autoconhecimentoLiberado && (
        <Shazam dadosIniciais={shazam} />
      )}
      {aba === "autoconhecimento" && autoconhecimentoLiberado && (
        <Autoconhecimento dadosIniciais={autoconhecimento} />
      )}
      {aba === "pdi" && autoconhecimentoLiberado && (
        <Pdi
          metasIniciais={pdiMetas}
          linhas5w2hIniciais={pdi5w2h}
          statusInicial={pdiStatus}
        />
      )}
    </div>
  );
}
