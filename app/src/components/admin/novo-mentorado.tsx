"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useFeedback } from "@/components/ui/feedback";
import { PLANO_LABELS, type PlanoNome } from "@/lib/types/database";
import { criarMentoradoAction } from "@/app/(admin)/admin/candidatos/actions";

const campo = "min-h-11 w-full rounded-xl border bg-surface px-3.5 text-sm";
const PLANOS = Object.keys(PLANO_LABELS) as PlanoNome[];

export function NovoMentorado() {
  const fb = useFeedback();
  const [aberto, setAberto] = useState(false);
  const [pending, start] = useTransition();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState<PlanoNome>("reconexao_profissional");
  const [criado, setCriado] = useState<{ email: string; senha: string } | null>(null);

  function fechar() {
    setAberto(false);
    setCriado(null);
    setNome("");
    setEmail("");
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await criarMentoradoAction({ nome, email, plano });
      if (r.ok) setCriado({ email: r.email, senha: r.senha });
      else fb.erro("Não foi possível cadastrar", r.erro);
    });
  }

  async function copiar() {
    if (!criado) return;
    try {
      await navigator.clipboard.writeText(`E-mail: ${criado.email}\nSenha provisória: ${criado.senha}`);
      fb.sucesso("Acesso copiado");
    } catch {
      fb.erro("Não foi possível copiar", "Anote o acesso exibido na tela.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-brand-fg"
      >
        <Icon name="mais" className="h-4 w-4" /> Novo mentorado
      </button>

      <Modal
        aberto={aberto}
        onFechar={fechar}
        titulo={criado ? "Mentorado cadastrado" : "Novo mentorado"}
        subtitulo={criado ? undefined : "A conta começa zerada, com 0 pontos e sem candidaturas."}
      >
        {criado ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">Envie este acesso ao mentorado. A senha aparece só agora.</p>
            <dl className="space-y-3 rounded-2xl border bg-brand-soft p-4 text-sm">
              <div><dt className="eyebrow !text-foreground/50">E-mail</dt><dd className="mt-1 break-all font-medium">{criado.email}</dd></div>
              <div><dt className="eyebrow !text-foreground/50">Senha provisória</dt><dd className="num mt-1 font-medium">{criado.senha}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copiar} className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg">Copiar acesso</button>
              <button type="button" onClick={fechar} className="min-h-11 rounded-xl border px-5 text-sm hover:bg-brand-soft">Concluir</button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Nome</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required className={campo} autoComplete="off" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">E-mail</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={campo} autoComplete="off" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Plano contratado</span>
              <select value={plano} onChange={(e) => setPlano(e.target.value as PlanoNome)} className={campo}>
                {PLANOS.map((p) => <option key={p} value={p}>{PLANO_LABELS[p]}</option>)}
              </select>
            </label>
            <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-brand px-5 text-sm text-brand-fg disabled:opacity-50">
              {pending ? "Cadastrando..." : "Cadastrar mentorado"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
