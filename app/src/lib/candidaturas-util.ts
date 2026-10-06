/** Perfis de recrutadores ficam num único campo, um por linha. */
export function lerPerfisRecrutadores(valor: string | null | undefined): string[] {
  return (valor ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function juntarPerfisRecrutadores(perfis: string[]): string | undefined {
  const limpos = perfis.map((p) => p.trim()).filter(Boolean);
  return limpos.length ? limpos.join("\n") : undefined;
}
