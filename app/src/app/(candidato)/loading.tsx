import { SkeletonCabecalho, SkeletonCartao, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonCartao />
      <SkeletonCartao linhas={2} />
    </TelaCarregando>
  );
}
