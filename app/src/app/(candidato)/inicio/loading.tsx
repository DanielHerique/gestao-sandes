import { Skeleton, SkeletonCabecalho, SkeletonCartao, SkeletonNumeros, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <Skeleton className="h-12 w-48 rounded-full" />
      <SkeletonCartao linhas={4} />
      <SkeletonNumeros />
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCartao />
        <SkeletonCartao />
      </div>
    </TelaCarregando>
  );
}
