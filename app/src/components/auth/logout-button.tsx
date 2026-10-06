"use client";

import { useTransition } from "react";
import { Icon } from "@/components/icons";
import { logoutAction } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-ink-fg"
    >
      <Icon name="sair" className="h-[18px] w-[18px]" />
      Sair
    </button>
  );
}
