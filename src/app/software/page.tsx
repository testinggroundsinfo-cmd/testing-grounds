import { AppShell } from "@/components/layout/AppShell";
import { ProjectGridPlaceholder } from "@/components/project/ProjectGridPlaceholder";

export default function SoftwarePage() {
  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold">App &amp; Software</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Web/SaaS, iOS, Android, Desktop e estensioni browser
      </p>
      <ProjectGridPlaceholder category="software" />
    </AppShell>
  );
}
