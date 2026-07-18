/** Canonical origin for the site. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://stagfencing.com.au"
).replace(/\/$/, "");
