import { SkeletonCabecalho, SkeletonCartao, SkeletonNumeros, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-6">
      <SkeletonCabecalho />
      <SkeletonNumeros />
      <SkeletonCartao linhas={5} />
    </TelaCarregando>
  );
}
