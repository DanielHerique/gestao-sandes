"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const resultado = await loginAction(formData);
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
        className="mb-4 w-full px-3.5 py-2"
      />

      <label htmlFor="senha" className="mb-1.5 block text-sm font-medium">
        Senha
      </label>
      <input
        id="senha"
        type="password"
        name="senha"
        autoComplete="current-password"
        required
        className="mb-5 w-full px-3.5 py-2"
      />

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
