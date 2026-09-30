import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_ITEMS = [
  { href: "/candidaturas", label: "Candidaturas" },
  { href: "/documentos", label: "Documentos" },
  { href: "/curriculo", label: "Currículo (IA)" },
  { href: "/progresso", label: "Progresso" },
  { href: "/exercicios", label: "Exercícios" },
  { href: "/prompts", label: "Prompts de IA" },
  { href: "/notificacoes", label: "Notificações" },
];

export default function CandidatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r p-4">
        <div>
          <p className="mb-6 text-lg font-semibold">Sandes</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
