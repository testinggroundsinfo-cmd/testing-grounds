export type ProjectCategory = "gaming" | "software";
export type ProjectType = "project" | "mod";

export type DevelopmentStatus =
  | "pre_alpha"
  | "alpha"
  | "closed_beta"
  | "mvp"
  | "playtest";

export type GamingPlatform = "pc" | "mobile" | "webgl" | "console";

export type SoftwarePlatform =
  | "web_saas"
  | "mobile_ios"
  | "mobile_android"
  | "desktop"
  | "browser_extension";

export type PlatformKind = GamingPlatform | SoftwarePlatform;

export type DistributionKind =
  | "iframe"
  | "direct_link"
  | "testflight"
  | "play_beta"
  | "steam_playtest"
  | "drive"
  | "mega"
  | "itch"
  | "zip";

export type BugKind =
  | "crash"
  | "gameplay"
  | "graphics"
  | "audio"
  | "ui_ux"
  | "performance"
  | "network"
  | "localization"
  | "other";

export type CollaboratorRole =
  | "game_design"
  | "qa_tester"
  | "translations"
  | "development"
  | "community"
  | "art"
  | "other";

export type ReportReason =
  | "malware"
  | "phishing"
  | "copyright"
  | "inappropriate"
  | "spam"
  | "other";

export type Project = {
  id: string;
  owner_id: string;
  category: ProjectCategory;
  title: string;
  short_description?: string | null;
  slug: string;
  description: string;
  development_status: DevelopmentStatus;
  platforms: PlatformKind[];
  tags: string[];
  cover_url: string | null;
  youtube_url: string | null;
  iframe_url: string | null;
  distribution_kind: DistributionKind | null;
  distribution_url: string | null;
  alternative_links?: AlternativeLink[];
  is_published: boolean;
  created_at: string;
  project_type?: ProjectType;
  game_slug?: string | null;
  game_title?: string | null;
  mod_version?: string | null;
  compatibility?: string | null;
  mod_type?: string | null;
  mod_dependencies?: string | null;
  game_cover_url?: string | null;
  mod_file_url?: string | null;
  notify_new_bugs?: boolean;
};

export type AlternativeLink = {
  label: string;
  url: string;
};

export type ProjectRelease = {
  id: string;
  project_id: string;
  version: string;
  changelog: string | null;
  download_url: string | null;
  created_at: string;
};

export type BugReport = {
  id: string;
  project_id: string;
  title: string;
  kind: BugKind;
  steps_to_reproduce: string;
  status: string;
  created_at: string;
};

export type Review = {
  id: string;
  project_id: string;
  gameplay: number | null;
  graphics: number | null;
  balance: number | null;
  fun: number | null;
  usability: number | null;
  usefulness: number | null;
  ui_quality: number | null;
  comment: string;
  created_at: string;
};

export type Application = {
  id: string;
  project_id: string;
  applicant_id: string;
  role: CollaboratorRole;
  message: string;
  portfolio_url: string | null;
  status: string;
  created_at: string;
};

export type ProjectInsert = Omit<
  Project,
  "id" | "created_at" | "owner_id" | "is_published"
> & {
  owner_id: string;
  is_published?: boolean;
};
