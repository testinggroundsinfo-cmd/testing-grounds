/**
 * Runtime-safe ad configuration.
 *
 * Monetization runs exclusively through Google AdSense (client
 * ca-pub-7880355475837757), loaded globally via the script tag in
 * `src/app/layout.tsx` and declared in `public/ads.txt`.
 */
export const adsenseClientId = "ca-pub-7880355475837757";

export const adFormats = {
  sidebar: {
    desktop: "160x600",
    compact: "250x250",
    mobile: "300x250",
  },
  footer: {
    desktop: "970x90",
    medium: "728x90",
  },
} as const;
