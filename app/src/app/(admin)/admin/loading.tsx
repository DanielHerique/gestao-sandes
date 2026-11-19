import { SkeletonCabecalho, SkeletonLista, SkeletonNumeros, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-8">
      <SkeletonCabecalho subtitulo />
      <SkeletonNumeros />
      <SkeletonLista itens={4} />
    </TelaCarregando>
  );
}
