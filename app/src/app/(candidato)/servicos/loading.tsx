import { SkeletonCabecalho, SkeletonCartao, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="max-w-2xl space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonCartao />
      <SkeletonCartao />
      <SkeletonCartao />
    </TelaCarregando>
  );
}
