import { SkeletonCabecalho, SkeletonCartao, SkeletonLista, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="max-w-3xl space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonLista itens={4} />
      <SkeletonCartao linhas={2} />
    </TelaCarregando>
  );
}
