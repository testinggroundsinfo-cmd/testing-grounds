import { Award, Rocket, Sparkles, Star } from "lucide-react";
import { T } from "@/components/i18n/T";

export type ActivityBadgeKind = "verifiedTester" | "prolificCreator" | "communityFavorite" | "risingStar";

const badgeIcons: Record<ActivityBadgeKind, typeof Award> = {
  verifiedTester: Award,
  prolificCreator: Rocket,
  communityFavorite: Sparkles,
  risingStar: Star,
};

export function ActivityBadges({ badges }: { badges: ActivityBadgeKind[] }) {
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const Icon = badgeIcons[badge];
        return (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
          >
            <Icon className="h-3.5 w-3.5" />
            <T k={`badges.${badge}`} />
          </span>
        );
      })}
    </div>
  );
}
