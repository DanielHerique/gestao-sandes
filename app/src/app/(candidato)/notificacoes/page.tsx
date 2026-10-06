import { requireProfile } from "@/lib/auth/session";
import { listarNotificacoes } from "@/lib/data/notificacoes";
import { NotificacaoItem } from "@/components/notificacoes/notificacao-item";

export default async function NotificacoesPage() {
  const profile = await requireProfile();
  const notificacoes = await listarNotificacoes(profile.id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Notificações</h1>
      {notificacoes.length === 0 ? (
        <p className="text-sm text-foreground/60">Nenhuma notificação ainda.</p>
      ) : (
        <ul className="space-y-2">
          {notificacoes.map((n) => (
            <NotificacaoItem key={n.id} notificacao={n} />
          ))}
        </ul>
      )}
    </div>
  );
}
