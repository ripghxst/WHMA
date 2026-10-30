// TODO(T08): replace with real approved horses from the database, then delete this file.
// Rows copied from the client's Official Database sheet, so the layout is reviewed with real data.
export const sampleEntries = [
  {
    number: "WHMA-AM-236415",
    name: "[WCRX] Moonwake",
    breed: "Mustang",
    sex: "Mare",
    coat: "Crescent Smoky Cream Snowflake",
    owner: "Brooklyn",
    date: "2026-08-11",
  },
  {
    number: "WHMA-ZB2-243561",
    name: "(PETE) Safari",
    breed: "Zebra",
    sex: "Mare",
    coat: "Blue Roan Stripe",
    owner: "Peter",
    date: "2026-08-07",
  },
  {
    number: "WHMA-AM2-135462",
    name: "[WCRX] Crowned In Saltwater",
    breed: "Mustang",
    sex: "Mare",
    coat: "Smoky Cream Leopard",
    owner: "GHXST",
    date: "2026-08-06",
  },
  {
    number: "WHMA-AM1-324561",
    name: "{777} Buttered Biscuit",
    breed: "Mustang",
    sex: "Stallion",
    coat: "Buttermilk Buckskin Roan",
    owner: "Vyxxen",
    date: "2026-08-06",
  },
  {
    number: "WHMA-KM2-216435",
    name: "[WCRX] A Knight's Sunflowers",
    breed: "Kiger Mustang",
    sex: "Mare",
    coat: "Dappled Smoky Black Overo",
    owner: "Kitsua",
    date: "2026-08-05",
  },
];

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
