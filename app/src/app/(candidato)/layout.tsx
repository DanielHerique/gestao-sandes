import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProfile } from "@/lib/auth/session";
import { gerarNotificacoesComportamentais } from "@/lib/data/notificacoes-automaticas";

const NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: "🏠" },
  { href: "/candidaturas", label: "Candidaturas", icon: "📋" },
  { href: "/documentos", label: "Documentos", icon: "📄" },
  { href: "/curriculo", label: "Currículo (IA)", icon: "🧠" },
  { href: "/exercicios", label: "Exercícios", icon: "✍️" },
  { href: "/progresso", label: "Progresso", icon: "🏆" },
  { href: "/prompts", label: "Prompts de IA", icon: "💬" },
  { href: "/notificacoes", label: "Notificações", icon: "🔔" },
];

export default async function CandidatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  // Regras automáticas (PRD 3.8): idempotente, no máximo 1 aviso por tipo a cada 3 dias.
  await gerarNotificacoesComportamentais(profile.id).catch(() => undefined);

  return (
    <AppShell nav={NAV} subtitulo="Consultoria & RH" logoutSlot={<LogoutButton />}>
      {children}
    </AppShell>
  );
}
