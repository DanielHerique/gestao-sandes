import { Skeleton, SkeletonCabecalho, SkeletonTabela, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <Skeleton className="h-12 w-full max-w-sm" />
      <SkeletonTabela />
    </TelaCarregando>
  );
}
