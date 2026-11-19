import { Skeleton, SkeletonKanban, TelaCarregando } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <TelaCarregando className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-12 w-52 rounded-full" />
      </div>
      <SkeletonKanban />
    </TelaCarregando>
  );
}
