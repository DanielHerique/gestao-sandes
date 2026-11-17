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
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-ink-fg transition-colors hover:bg-white/10"
    >
      <Icon name="sair" className="h-[18px] w-[18px]" />
      Sair
    </button>
  );
}
