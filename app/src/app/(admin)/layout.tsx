import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAdmin } from "@/lib/auth/session";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/candidatos", label: "Carteira", icon: "carteira" },
  { href: "/admin/validacoes", label: "Validações", icon: "validacoes" },
  { href: "/admin/documentos", label: "Documentos", icon: "documentos" },
];

const MAIS: NavItem[] = [
  { href: "/admin/gamificacao", label: "Regras de gamificação", icon: "engrenagem" },
  { href: "/admin/prompts", label: "Prompts de IA", icon: "prompts" },
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
      mais={MAIS}
      subtitulo="Painel admin"
      usuario={{ nome: profile.nome, email: profile.email }}
      logoutSlot={<LogoutButton />}
    >
      {children}
    </AppShell>
  );
}
