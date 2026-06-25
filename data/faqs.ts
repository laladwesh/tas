export type Faq = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

/* Single source of truth for the FAQ section AND the FAQPage structured data
   (rich results in Google). Keep answers as plain, accurate text. */
export const faqs: Faq[] = [
  {
    question: "What types of fencing do you offer in Perth?",
    answer:
      "We install Colorbond, timber, aluminium slat, pool fencing, gates, automation and retaining walls across Perth.",
    defaultOpen: true,
  },
  {
    question: "What are the benefits of Colorbond fencing in Perth?",
    answer:
      "Colorbond fencing is durable, low maintenance, weather-resistant, and ideal for Perth conditions.",
  },
  {
    question: "Is aluminium slat fencing suitable for Perth's climate?",
    answer:
      "Yes — when installed correctly and with the right materials, aluminium slat fencing performs well in Perth.",
  },
  {
    question: "Does Stag Fencing install compliant fencing services in Perth?",
    answer:
      "Yes, at Stag Fencing all fencing service installations meet Western Australian safety regulations.",
  },
];
