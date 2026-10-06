"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/icons";

// ---------- Toasts (avisos de ação concluída) ----------
type TipoToast = "sucesso" | "erro" | "info";
interface ToastItem {
  id: number;
  tipo: TipoToast;
  titulo: string;
  detalhe?: string;
}

// ---------- Confirmação (com digitação opcional) ----------
export interface OpcoesConfirmacao {
  titulo: string;
  descricao?: string;
  rotuloConfirmar?: string;
  /** Quando true, a pessoa precisa digitar CONFIRMAR para liberar o botão. */
  digitar?: boolean;
  perigo?: boolean;
}

interface Contexto {
  toast: (tipo: TipoToast, titulo: string, detalhe?: string) => void;
  confirmar: (opcoes: OpcoesConfirmacao) => Promise<boolean>;
}

const FeedbackContext = createContext<Contexto | null>(null);

const PALAVRA = "CONFIRMAR";

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialogo, setDialogo] = useState<
    (OpcoesConfirmacao & { resolver: (v: boolean) => void }) | null
  >(null);
  const [texto, setTexto] = useState("");
  const proximoId = useRef(1);

  const toast = useCallback((tipo: TipoToast, titulo: string, detalhe?: string) => {
    const id = proximoId.current++;
    setToasts((t) => [...t.slice(-3), { id, tipo, titulo, detalhe }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tipo === "erro" ? 6000 : 3800);
  }, []);

  const confirmar = useCallback(
    (opcoes: OpcoesConfirmacao) =>
      new Promise<boolean>((resolver) => {
        setTexto("");
        setDialogo({ ...opcoes, resolver });
      }),
    [],
  );

  function fechar(valor: boolean) {
    dialogo?.resolver(valor);
    setDialogo(null);
  }

  useEffect(() => {
    if (!dialogo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dialogo.resolver(false);
        setDialogo(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogo]);

  const liberado = !dialogo?.digitar || texto.trim().toUpperCase() === PALAVRA;

  return (
    <FeedbackContext.Provider value={{ toast, confirmar }}>
      {children}

      {/* Toasts */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-5"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === "erro" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-ink-fg"
            style={{ boxShadow: "var(--shadow-lift)", animation: "toast-in .25s ease-out" }}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                t.tipo === "erro" ? "bg-rose-500 text-white" : "bg-brand text-brand-fg"
              }`}
            >
              <Icon name={t.tipo === "erro" ? "fechar" : "check"} className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 text-sm leading-snug">
              <span className="block font-medium">{t.titulo}</span>
              {t.detalhe && <span className="block text-ink-muted">{t.detalhe}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Confirmação */}
      {dialogo && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => fechar(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-titulo"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-surface p-6"
            style={{ boxShadow: "var(--shadow-lift)", animation: "toast-in .2s ease-out" }}
          >
            <h2 id="confirm-titulo" className="text-xl">{dialogo.titulo}</h2>
            {dialogo.descricao && (
              <p className="mt-2 text-sm text-foreground/65">{dialogo.descricao}</p>
            )}
            {dialogo.digitar && (
              <div className="mt-4">
                <label htmlFor="confirm-texto" className="mb-1.5 block text-sm">
                  Para continuar, digite <strong>{PALAVRA}</strong>
                </label>
                <input
                  id="confirm-texto"
                  autoFocus
                  autoComplete="off"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && liberado) fechar(true);
                  }}
                  className="w-full px-3.5 py-2"
                  placeholder={PALAVRA}
                />
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => fechar(false)}
                className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!liberado}
                onClick={() => fechar(true)}
                className={`min-h-11 rounded-xl px-5 text-sm font-semibold disabled:opacity-40 ${
                  dialogo.perigo ? "bg-rose-600 text-white" : "bg-brand text-brand-fg"
                }`}
              >
                {dialogo.rotuloConfirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback fora do FeedbackProvider");
  return {
    sucesso: (t: string, d?: string) => ctx.toast("sucesso", t, d),
    erro: (t: string, d?: string) => ctx.toast("erro", t, d),
    info: (t: string, d?: string) => ctx.toast("info", t, d),
    confirmar: ctx.confirmar,
  };
}
