import { Skeleton, SkeletonCabecalho, SkeletonCartao, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="max-w-3xl space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonCartao linhas={4} />
      <Skeleton className="h-12 w-44 rounded-full" />
    </TelaCarregando>
  );
}
