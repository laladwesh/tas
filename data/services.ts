export type Service = {
  title: string;
  price: string;
  image: string;
};

/* Empty by design. Services live in MongoDB — add them in /admin/services. */
export const services: Service[] = [];
