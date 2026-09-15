import { AppShell } from "@/components/layout/AppShell";
import { ProjectGridPlaceholder } from "@/components/project/ProjectGridPlaceholder";

export default function GamingPage() {
  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold">Gaming</h1>
      <p className="mb-8 text-sm text-zinc-400">
        PC, Mobile, WebGL e Console · Pre-Alpha, Alpha, Closed Beta, Playtest
      </p>
      <ProjectGridPlaceholder category="gaming" />
    </AppShell>
  );
}
