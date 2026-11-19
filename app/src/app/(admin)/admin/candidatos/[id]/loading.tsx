import { SkeletonCabecalho, SkeletonCartao, SkeletonNumeros, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho subtitulo />
      <SkeletonNumeros />
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCartao linhas={4} />
        <SkeletonCartao linhas={4} />
      </div>
    </TelaCarregando>
  );
}
