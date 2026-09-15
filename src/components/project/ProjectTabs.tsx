"use client";

import { useState } from "react";
import { BugForm } from "@/components/feedback/BugForm";
import { ReviewForm } from "@/components/feedback/ReviewForm";
import { CollaboratorForm } from "@/components/feedback/CollaboratorForm";
import { ReportProjectButton } from "@/components/moderation/ReportProjectButton";

const tabs = [
  { id: "bugs", label: "Bug report" },
  { id: "reviews", label: "Recensioni & consigli" },
  { id: "collab", label: "Candidati come collaboratore" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProjectTabs({ slug, projectId, category }: { slug: string; projectId: string; category: "gaming" | "software" }) {
  const [tab, setTab] = useState<TabId>("bugs");
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                tab === item.id
                  ? "bg-accent text-ink-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ReportProjectButton projectSlug={slug} />
      </div>

      {tab === "bugs" ? <BugForm category={category} projectId={projectId} /> : null}
      {tab === "reviews" ? <ReviewForm category={category} projectId={projectId} /> : null}
      {tab === "collab" ? <CollaboratorForm projectId={projectId} /> : null}
    </section>
  );
}
