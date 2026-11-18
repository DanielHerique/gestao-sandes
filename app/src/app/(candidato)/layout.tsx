import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { BotaoComoFunciona, Tutorial } from "@/components/tutorial";
import { requireProfile } from "@/lib/auth/session";
import { gerarNotificacoesComportamentais } from "@/lib/data/notificacoes-automaticas";
import { gerarLembretesDeSessao } from "@/lib/data/agenda";

const NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: "inicio" },
  { href: "/candidaturas", label: "Vagas", icon: "candidaturas" },
  { href: "/curriculo", label: "Currículo", icon: "curriculo" },
  { href: "/exercicios", label: "Exercícios", icon: "exercicios" },
  { href: "/documentos", label: "Documentos", icon: "documentos" },
];

const MAIS: NavItem[] = [
  { href: "/progresso", label: "Progresso", icon: "progresso" },
  { href: "/prompts", label: "Prompts de IA", icon: "prompts" },
  { href: "/notificacoes", label: "Notificações", icon: "notificacoes" },
];

export default async function CandidatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  // Regras automáticas (PRD 3.8): idempotente, no máximo 1 aviso por tipo a cada 3 dias.
  await gerarNotificacoesComportamentais(profile.id).catch(() => undefined);
  await gerarLembretesDeSessao(profile.id).catch(() => undefined);

  return (
    <AppShell
      nav={NAV}
      mais={MAIS}
      sino="/notificacoes"
      subtitulo="Consultoria & RH"
      usuario={{ nome: profile.nome, email: profile.email }}
      logoutSlot={
        <>
          <BotaoComoFunciona />
          <LogoutButton />
        </>
      }
    >
      <Tutorial jaVisto={profile.tutorial_visto} />
      {children}
    </AppShell>
  );
}
