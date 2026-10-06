import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAdmin } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/candidatos", label: "Carteira de candidatos", icon: "carteira" },
  { href: "/admin/prompts", label: "Prompts de IA", icon: "prompts" },
  { href: "/admin/documentos", label: "Templates de documentos", icon: "documentos" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();
  return (
    <AppShell
      nav={NAV}
      subtitulo="Painel admin"
      usuario={{ nome: profile.nome, email: profile.email }}
      logoutSlot={<LogoutButton />}
    >
      {children}
    </AppShell>
  );
}
