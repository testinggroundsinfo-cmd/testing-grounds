export type SortableProject = {
  created_at?: string | null;
  upvote_count?: number | null;
};

/**
 * Sorts projects by popularity (community upvotes first, most recent as tiebreaker).
 * Falls back to 0 upvotes when the field hasn't been fetched/is missing.
 */
export function sortByPopularity<T extends SortableProject>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const votesA = a.upvote_count ?? 0;
    const votesB = b.upvote_count ?? 0;
    if (votesB !== votesA) return votesB - votesA;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
}

/** Sorts projects by creation date, most recent first. */
export function sortByNewest<T extends SortableProject>(projects: T[]): T[] {
  return [...projects].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}