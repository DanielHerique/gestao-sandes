import { SkeletonCabecalho, SkeletonCartao, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCartao />
        <SkeletonCartao />
        <SkeletonCartao />
        <SkeletonCartao />
      </div>
    </TelaCarregando>
  );
}
