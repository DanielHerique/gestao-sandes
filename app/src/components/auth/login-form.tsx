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
    <form
      action={handleSubmit}
      className="w-full max-w-sm rounded-lg border bg-white p-6 dark:bg-neutral-900"
    >
      <h1 className="mb-1 text-lg font-semibold">Sandes CRM</h1>
      <p className="mb-6 text-sm text-neutral-500">Entre com sua conta</p>

      <label className="mb-1 block text-sm font-medium">E-mail</label>
      <input
        type="email"
        name="email"
        required
        className="mb-3 w-full rounded border px-3 py-2 text-sm dark:bg-neutral-950"
      />

      <label className="mb-1 block text-sm font-medium">Senha</label>
      <input
        type="password"
        name="senha"
        required
        className="mb-4 w-full rounded border px-3 py-2 text-sm dark:bg-neutral-950"
      />

      {erro && <p className="mb-3 text-sm text-rose-600">{erro}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
