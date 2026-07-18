/* ===========================================================================
   Content TYPES only.

   There is deliberately NO sample content here. Everything the site shows comes
   from MongoDB, entered through /admin. If a collection is empty, the matching
   section simply doesn't render — we never invent placeholder content.
   =========================================================================== */

export type ServiceItem = {
  slug: string;
  title: string;
  priceFrom: string;
  image: string;
  excerpt: string;
};

export type ProductItem = {
  slug: string;
  title: string;
  /** Display string, e.g. "$99.50 – $146.80". */
  price: string;
  /** Lowest price in INTEGER CENTS. Money is never a float. */
  priceCents: number;
  image: string;
  category: string;
  subCategory?: string;
  homeRow: "popular" | "affordable" | "";
};

export type ArticleItem = {
  slug: string;
  title: string;
  excerpt: string;
  /** Blank line = new paragraph, "## " = subheading. */
  body: string;
  image: string;
  category: string;
  readTime: string;
  publishedAt: string; // ISO date
};

export type ProjectItem = {
  title: string;
  image: string;
  category: string;
  suburb: string;
  featured: boolean;
};

export type ReviewItem = {
  name: string;
  role: string;
  quote: string;
  rating: string;
  image: string;
  avatar: string;
};

/* Empty by design — the DB is the only source of content. */
export const servicesCatalog: ServiceItem[] = [];
export const productsCatalog: ProductItem[] = [];
export const articlesCatalog: ArticleItem[] = [];
export const projectsCatalog: ProjectItem[] = [];
export const reviewsCatalog: ReviewItem[] = [];
export const servicesFaqs: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}[] = [];
