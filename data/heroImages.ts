export type HeroImage = {
  src: string;
  alt: string;
};

/* Empty by design. Hero slides live in MongoDB — add them in /admin/hero. */
export const heroImages: HeroImage[] = [];
