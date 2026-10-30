export const site = {
  name: "WHMA Horse Registry",
  association: "Wild Horse & Mustang Association",
  mainSiteUrl: "https://ttr-whma.weebly.com",
  criteriaUrl: "https://ttr-whma.weebly.com/registration.html",
  teamUrl: "https://ttr-whma.weebly.com/meet-the-team.html",
};

export const mainNav = [
  { href: "/registry", label: "Registry" },
  { href: "/members", label: "Members" },
  { href: "/horses/new", label: "Register a horse" },
] as const;

/**
 * Classified breeds and their registration codes, as published on the
 * WHMA registration page. Moves to the `breeds` table in T03.
 * TODO(T03): the Foundation sheet uses BR / CM / PZ for Brumby, Camargue
 * and Przewalski's; waiting on the client to confirm which codes are correct.
 */
export const classifiedBreeds = [
  { code: "AM", name: "American Mustang" },
  { code: "KM", name: "Kiger Mustang" },
  { code: "CP", name: "Chincoteague Pony" },
  { code: "NK", name: "Nokota" },
  { code: "BY", name: "Brumby" },
  { code: "WD", name: "Wild Donkey" },
  { code: "ZB", name: "Zebra" },
  { code: "CA", name: "Camargue" },
  { code: "PH", name: "Przewalski's Horse" },
] as const;
