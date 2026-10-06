"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground/60 hover:bg-brand-soft"
    >
      Sair
    </button>
  );
}
