export type Service = {
  title: string;
  price: string;
  image: string;
};

/* ===========================================================================
  EDIT THIS ARRAY for the "Our Services" grid.
   Images live in /public — reference them with a leading slash, e.g. "/asbestos.png".
   =========================================================================== */
export const services: Service[] = [
  { title: "Asbestos Fence Removal", price: "$99/lm", image: "/asbestos.png" },
  { title: "Color Bond Fencing", price: "$99/lm", image: "/color-bond.png" },
  { title: "Gates & Automation", price: "$99/lm", image: "/gates-auto.png" },
  { title: "Retaining walls", price: "$99/lm", image: "/retain.png" },
];
