import { z } from "zod";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .nullable()
    .transform((v) => v || null);

const id = z.number().int().positive().nullable();

/** Fields a member can set on a horse. Only the name is needed for a draft. */
export const horseSchema = z.object({
  registered_name: z
    .string()
    .trim()
    .min(1, "Enter the horse's registered name.")
    .max(120, "Use 120 characters or fewer."),
  barn_name: text(60),
  sex: z.enum(["stallion", "mare", "gelding"]).nullable(),
  breed_id: id,
  pedigree: text(40),
  phenotype: text(80),
  genotype: text(40),
  height: text(20),
  eye_color: text(30),
  base_stats: text(40),
  sire_id: z.guid().nullable(),
  sire_name: text(120),
  sire_breed_id: id,
  dam_id: z.guid().nullable(),
  dam_name: text(120),
  dam_breed_id: id,
});

export type HorseInput = z.input<typeof horseSchema>;
export type HorseValues = z.output<typeof horseSchema>;

export const emptyHorse: HorseInput = {
  registered_name: "",
  barn_name: "",
  sex: null,
  breed_id: null,
  pedigree: "",
  phenotype: "",
  genotype: "",
  height: "",
  eye_color: "",
  base_stats: "",
  sire_id: null,
  sire_name: "",
  sire_breed_id: null,
  dam_id: null,
  dam_name: "",
  dam_breed_id: null,
};

/** A photo as the form sends it to the server, in display order. */
export const photoManifestSchema = z
  .array(z.object({ path: z.string().min(1), isPrimary: z.boolean() }))
  .max(5);

export type PhotoManifest = z.infer<typeof photoManifestSchema>;
