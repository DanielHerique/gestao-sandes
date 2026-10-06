import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/candidatos", label: "Carteira de candidatos", icon: "👥" },
  { href: "/admin/prompts", label: "Prompts de IA", icon: "💬" },
  { href: "/admin/documentos", label: "Templates de documentos", icon: "📄" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell nav={NAV} subtitulo="Painel admin" logoutSlot={<LogoutButton />}>
      {children}
    </AppShell>
  );
}
