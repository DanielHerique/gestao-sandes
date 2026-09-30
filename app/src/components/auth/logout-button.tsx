"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="rounded-md px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      Sair
    </button>
  );
}
