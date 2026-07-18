export type Faq = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

/* Empty by design. FAQs live in MongoDB — add them in /admin/faqs. */
export const faqs: Faq[] = [];
