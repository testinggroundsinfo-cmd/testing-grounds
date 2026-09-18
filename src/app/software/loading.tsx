import { AppShell } from "@/components/layout/AppShell";
import { ProjectCatalogSkeleton } from "@/components/project/ProjectSkeletons";

export default function Loading() {
  return <AppShell><ProjectCatalogSkeleton /></AppShell>;
}
