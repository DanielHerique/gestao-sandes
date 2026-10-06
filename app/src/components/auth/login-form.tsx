"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { loginAction } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Campos controlados: depois de um erro, e-mail e senha continuam preenchidos.
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);

  function handleSubmit() {
    setErro(null);
    const dados = new FormData();
    dados.set("email", email);
    dados.set("senha", senha);
    startTransition(async () => {
      const resultado = await loginAction(dados);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <form action={handleSubmit} className="w-full">
      <h1 className="font-display text-4xl font-semibold leading-tight">Bem-vindo(a)</h1>
      <p className="mb-8 mt-2 text-sm text-foreground/60">
        Entre com a conta que a consultoria criou para você.
      </p>

      <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
        E-mail
      </label>
      <input
        id="email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full px-3.5 py-2"
      />

      <label htmlFor="senha" className="mb-1.5 block text-sm font-medium">
        Senha
      </label>
      <div className="relative mb-5">
        <input
          id="senha"
          type={mostrar ? "text" : "password"}
          name="senha"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full py-2 pl-3.5 pr-12"
        />
        <button
          type="button"
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={mostrar}
          onClick={() => setMostrar((v) => !v)}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-foreground/50 transition-colors hover:bg-brand-soft hover:text-brand-strong"
        >
          <Icon name={mostrar ? "olhoFechado" : "olho"} className="h-[18px] w-[18px]" />
        </button>
      </div>

      {erro && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400"
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-xl bg-brand px-4 py-2.5 text-[15px] text-brand-fg disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
