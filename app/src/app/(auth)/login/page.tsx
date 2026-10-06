import { LoginForm } from "@/components/auth/login-form";
import { Marca } from "@/components/icons";

const PONTOS = [
  "Candidaturas organizadas em um só lugar",
  "Documentos e assinaturas sem troca de mensagens",
  "Seu progresso e suas conquistas, passo a passo",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <aside className="relative hidden overflow-hidden bg-ink p-14 text-ink-fg lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(242,172,10,.22) 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-52 -left-24 h-[460px] w-[460px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(242,172,10,.12) 0%, transparent 65%)" }}
        />
        <div className="relative flex items-center gap-3">
          <Marca tamanho={44} />
          <div className="leading-tight">
            <p className="font-display text-xl font-semibold">Sandes</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Consultoria &amp; RH
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow !text-brand">Mentoria de carreira</p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Cada passo da sua transição, com método.
          </h2>
          <ul className="mt-10 space-y-4 text-[15px] text-ink-muted">
            {PONTOS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-muted">
          Acesso exclusivo para mentorados e equipe da Sandes.
        </p>
      </aside>

      {/* Formulário */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Marca />
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">Sandes</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/50">
                Consultoria &amp; RH
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
