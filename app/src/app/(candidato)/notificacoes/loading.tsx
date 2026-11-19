import { SkeletonCabecalho, SkeletonLista, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonLista itens={5} />
    </TelaCarregando>
  );
}
