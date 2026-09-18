"use client";

import { useState } from "react";
import { BugForm } from "@/components/feedback/BugForm";
import { ReviewForm } from "@/components/feedback/ReviewForm";
import { CollaboratorForm } from "@/components/feedback/CollaboratorForm";
import { ReportProjectButton } from "@/components/moderation/ReportProjectButton";
import { ProjectComments } from "@/components/project/ProjectComments";
import { useLocale } from "@/components/i18n/LocaleProvider";

const tabIds = ["discussions", "bugs", "reviews", "collab"] as const;
type TabId = (typeof tabIds)[number];

export function ProjectTabs({
  projectTitle,
  projectId,
  projectOwnerId,
  category,
}: {
  projectTitle: string;
  projectId: string;
  projectOwnerId?: string;
  category: "gaming" | "software";
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("discussions");
  const tabs: { id: TabId; label: string }[] = [
    { id: "discussions", label: t("project.discussionsTab") },
    { id: "bugs", label: t("project.bugsTab") },
    { id: "reviews", label: t("project.reviewsTab") },
    { id: "collab", label: t("project.collabTab") },
  ];

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
        <ReportProjectButton projectId={projectId} projectTitle={projectTitle} />
      </div>

      {tab === "discussions" ? <ProjectComments projectId={projectId} projectOwnerId={projectOwnerId} /> : null}
      {tab === "bugs" ? <BugForm category={category} projectId={projectId} /> : null}
      {tab === "reviews" ? <ReviewForm category={category} projectId={projectId} /> : null}
      {tab === "collab" ? <CollaboratorForm projectId={projectId} /> : null}
    </section>
  );
}
