// Ícones de traço (24x24), todos com a mesma espessura, herdam a cor do texto.
const PATHS: Record<string, React.ReactNode> = {
  inicio: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></>,
  candidaturas: <><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="9.5" y="4" width="5" height="10" rx="1.5" /><rect x="16" y="4" width="5" height="13" rx="1.5" /></>,
  documentos: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></>,
  curriculo: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><path d="m17.5 4 .6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" /></>,
  exercicios: <><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /><path d="m14.5 7.5 2 2" /></>,
  progresso: <><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /><path d="M12 13v4M8.5 20h7" /></>,
  prompts: <><path d="M4 5h16v11H11l-5 4v-4H4z" /><path d="M8 9.5h8M8 12.5h5" /></>,
  notificacoes: <><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" /><path d="M10 21h4" /></>,
  dashboard: <><rect x="3.5" y="3.5" width="7" height="8" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="5" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /><rect x="3.5" y="14.5" width="7" height="6" rx="1.5" /></>,
  carteira: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3 20c.5-3.4 3-5.2 6-5.2s5.5 1.8 6 5.2" /><path d="M16 5.6a3 3 0 0 1 0 5.8M18 14.8c1.8.6 2.7 2.2 3 5.2" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  fechar: <><path d="M6 6l12 12M18 6 6 18" /></>,
  sair: <><path d="M10 4H5v16h5" /><path d="M14 8l4 4-4 4M18 12H9" /></>,
  status: <><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></>,
  medalha: <><circle cx="12" cy="9" r="5" /><path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7" /></>,
  cadeado: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  estrela: <><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z" /></>,
  seta: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
};

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name] ?? PATHS.estrela}
    </svg>
  );
}

export function Marca({ tamanho = 36 }: { tamanho?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-brand-fg"
      style={{
        width: tamanho,
        height: tamanho,
        fontSize: tamanho * 0.5,
        background: "linear-gradient(145deg, #ffc533 0%, #dc9500 100%)",
        boxShadow: "0 0 0 3px rgba(242,172,10,.18), 0 6px 14px -6px rgba(220,149,0,.8)",
      }}
    >
      S
    </span>
  );
}
