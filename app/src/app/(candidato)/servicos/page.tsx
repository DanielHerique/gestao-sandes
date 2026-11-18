import { requireProfile } from "@/lib/auth/session";
import { DESCONTO_SERVICOS, SERVICOS, linkWhatsapp, moeda } from "@/lib/servicos";

function BotaoWhats({ mensagem, rotulo, principal = true }: { mensagem: string; rotulo: string; principal?: boolean }) {
  const href = linkWhatsapp(mensagem);
  const cls = principal ? "bg-brand text-brand-fg" : "border border-ink text-foreground";
  if (!href) return <p className="text-sm text-foreground/60">O contato por WhatsApp será liberado em breve.</p>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 font-semibold ${cls}`}>
      {rotulo}
    </a>
  );
}

export default async function ServicosPage() {
  const profile = await requireProfile();
  const nome = profile.nome.split(" ")[0];

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Sandes</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Serviços</h1>
        <p className="mt-3 text-foreground/60">
          Seu desconto de {DESCONTO_SERVICOS}% vale em todos. A conversa acontece no WhatsApp.
        </p>
      </header>

      <ul className="space-y-3">
        {SERVICOS.map((s) => (
          <li key={s.nome} className="rounded-2xl border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="!text-base !text-foreground">{s.nome}</h2>
              <p className="num text-lg font-bold">{moeda(s.preco)}</p>
            </div>
            <p className="mt-1 text-sm text-foreground/60">{s.descricao}</p>
            <div className="mt-4">
              <BotaoWhats rotulo="Conversar no WhatsApp" mensagem={`Olá! Sou ${nome} e quero conversar sobre ${s.nome}.`} />
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl bg-premium p-5">
        <p className="eyebrow !text-foreground">Premium · agenda limitada</p>
        <h2 className="mt-1 !text-xl !text-foreground">Consultoria individual com Katryn Sandes</h2>
        <p className="mt-2 text-sm">Para decisões que pedem um olhar sênior. Sob consulta.</p>
        <div className="mt-4">
          <BotaoWhats principal={false} rotulo="Solicitar horário" mensagem={`Olá! Sou ${nome} e quero solicitar um horário de consultoria individual.`} />
        </div>
      </section>
    </div>
  );
}
