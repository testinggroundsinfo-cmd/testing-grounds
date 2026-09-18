"use client";

import { useState } from "react";
import { BugForm } from "@/components/feedback/BugForm";
import { ReviewForm } from "@/components/feedback/ReviewForm";
import { CollaboratorForm } from "@/components/feedback/CollaboratorForm";
import { ReportProjectButton } from "@/components/moderation/ReportProjectButton";
import { ProjectComments } from "@/components/project/ProjectComments";
import { PublicFeedbackLists } from "@/components/feedback/PublicFeedbackLists";
import { useLocale } from "@/components/i18n/LocaleProvider";

const tabIds = ["overview", "media", "changelog", "bugs", "community"] as const;
type TabId = (typeof tabIds)[number];

export function ProjectTabs({
  projectTitle,
  projectId,
  projectOwnerId,
  category,
  overview,
  media,
  changelog,
}: {
  projectTitle: string;
  projectId: string;
  projectOwnerId?: string;
  category: "gaming" | "software";
  overview: React.ReactNode;
  media: React.ReactNode;
  changelog: React.ReactNode;
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("overview");
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("project.tabs.overview") },
    { id: "media", label: t("project.tabs.media") },
    { id: "changelog", label: t("project.tabs.changelog") },
    { id: "bugs", label: t("project.tabs.bugs") },
    { id: "community", label: t("project.tabs.community") },
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

      {tab === "overview" ? overview : null}
      {tab === "media" ? media : null}
      {tab === "changelog" ? changelog : null}
      {tab === "bugs" ? <BugForm category={category} projectId={projectId} /> : null}
      {tab === "community" ? (
        <div className="space-y-8">
          <ProjectComments projectId={projectId} projectOwnerId={projectOwnerId} />
          <ReviewForm category={category} projectId={projectId} />
          <CollaboratorForm projectId={projectId} />
          <PublicFeedbackLists projectId={projectId} projectOwnerId={projectOwnerId} />
        </div>
      ) : null}
    </section>
  );
}
