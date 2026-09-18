/**
 * Runtime-safe ad configuration.
 *
 * Ezoic values are intentionally optional while the site is awaiting approval.
 * Once Ezoic provides the account details, configure them through the
 * NEXT_PUBLIC_EZOIC_* variables rather than hard-coding provider identifiers.
 */
export const ezoicPublisherId =
  process.env.NEXT_PUBLIC_EZOIC_PUBLISHER_ID?.trim() || null;

export const ezoicAdsTxtUrl =
  process.env.NEXT_PUBLIC_EZOIC_ADS_TXT_URL?.trim() || null;

export const isEzoicConfigured = Boolean(ezoicPublisherId);

export const adFormats = {
  sidebar: {
    desktop: "300x600",
    wide: "336x280",
    mobile: "300x250",
  },
  footer: {
    desktop: "970x90",
    medium: "728x90",
  },
} as const;
