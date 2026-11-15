"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { submitHorse } from "@/app/(member)/dashboard/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { missingForSubmission, PHOTO_BUCKET } from "@/lib/horses";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import type {
  BoardInput,
  HorseInput,
  PhotoManifest,
} from "@/lib/validation/horse";

import type { SaveResult } from "./actions";
import {
  BreedOptions,
  ParentField,
  type Breed,
  type ParentValue,
} from "./parent-field";
import { PhotoField, type PhotoItem } from "./photo-field";

export type HorseFormInput = HorseInput & { board?: BoardInput };

type Props = {
  horseId: string | null;
  /** "member" registers and submits; "board" edits any horse and its board-only fields. */
  mode: "member" | "board";
  saveAction: (
    input: HorseFormInput,
    horseId: string | null,
  ) => Promise<SaveResult>;
  syncPhotosAction: (
    horseId: string,
    manifest: PhotoManifest,
  ) => Promise<{ error?: string }>;
  /** First storage folder for new uploads: the member's id, or "board". */
  photoFolder: string;
  /** Where to go after saving. */
  returnTo: string;
  /** Board mode only: current board fields and the members who can own a horse. */
  board?: {
    initial: BoardInput;
    members: { id: string; name: string }[];
  };
  initial: HorseInput;
  initialSire: ParentValue;
  initialDam: ParentValue;
  initialPhotos: PhotoItem[];
  initialPrimaryKey: string | null;
  breeds: Breed[];
  /** Set when the board sent the horse back for changes. */
  reviewNote: string | null;
};

type Errors = Partial<Record<string, string>>;

const extension: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-rule pt-8 lg:grid-cols-[14rem_1fr] lg:gap-10">
      <div>
        <h2 className="heading-caps text-xl text-dust">{title}</h2>
        {hint && <p className="mt-2 text-sm text-dust">{hint}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function HorseForm(props: Props) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const horseId = useRef(props.horseId);
  const [values, setValues] = useState(props.initial);
  const [sire, setSire] = useState(props.initialSire);
  const [dam, setDam] = useState(props.initialDam);
  const [photos, setPhotos] = useState(props.initialPhotos);
  const [primaryKey, setPrimaryKey] = useState(props.initialPrimaryKey);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [board, setBoard] = useState(props.board?.initial);
  const resubmitting = Boolean(props.reviewNote);
  const isBoard = props.mode === "board";

  const set = <K extends keyof HorseInput>(key: K, value: HorseInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const text = (key: keyof HorseInput) => ({
    value: (values[key] as string | null) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, e.target.value),
  });

  const classified = (p: ParentValue) =>
    p.linked
      ? p.linked.classified
      : Boolean(breedsById(props.breeds, p.breedId)?.is_classified);
  const parentsKnown =
    (sire.linked || sire.breedId) && (dam.linked || dam.breedId);
  const notEligible = parentsKnown && !classified(sire) && !classified(dam);

  async function save(intent: "draft" | "submit") {
    setFormError(null);
    setErrors({});

    const input: HorseInput = {
      ...values,
      sire_id: sire.linked?.id ?? null,
      sire_name: sire.linked ? null : sire.name,
      sire_breed_id: sire.linked ? null : sire.breedId,
      dam_id: dam.linked?.id ?? null,
      dam_name: dam.linked ? null : dam.name,
      dam_breed_id: dam.linked ? null : dam.breedId,
    };
    const payload: HorseFormInput = board ? { ...input, board } : input;

    if (intent === "submit") {
      const missing = missingForSubmission(input, photos.length);
      if (missing.length) {
        setErrors(
          Object.fromEntries(
            missing.map((m) => [m.field, `Add the ${m.label} to submit.`]),
          ),
        );
        setFormError(
          `Before submitting, add: ${missing.map((m) => m.label).join(", ")}.`,
        );
        return;
      }
    }

    try {
      setStep("Saving…");
      const saved = await props.saveAction(payload, horseId.current);
      if (!saved.ok) {
        setErrors(
          Object.fromEntries(
            Object.entries(saved.fieldErrors ?? {}).map(([k, v]) => [
              // sire_id / sire_name / sire_breed_id all belong to the Sire box.
              k.replace(/^(sire|dam)_.*/, "$1").replace(/^board\./, ""),
              v[0],
            ]),
          ),
        );
        setFormError(saved.error);
        return;
      }
      horseId.current = saved.id;

      // Upload new photos straight to storage, then record them.
      const uploaded = [...photos];
      for (let i = 0; i < uploaded.length; i++) {
        const photo = uploaded[i];
        if (photo.kind !== "new") continue;
        setStep(`Uploading photos (${i + 1} of ${uploaded.length})…`);
        const path = `${props.photoFolder}/${saved.id}/${crypto.randomUUID()}.${extension[photo.blob.type] ?? "jpg"}`;
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, photo.blob, { contentType: photo.blob.type });
        if (error) {
          setFormError("A photo could not be uploaded. Please try again.");
          return;
        }
        uploaded[i] = {
          key: photo.key,
          kind: "existing",
          path,
          url: photo.url,
        };
        // Keep progress, so a retry doesn't upload the same photo twice.
        setPhotos([...uploaded]);
      }

      setStep("Saving photos…");
      const synced = await props.syncPhotosAction(
        saved.id,
        uploaded.map((p) => ({
          path: p.kind === "existing" ? p.path : "",
          isPrimary: p.key === primaryKey,
        })),
      );
      if (synced.error) {
        setFormError(synced.error);
        return;
      }

      if (intent === "submit") {
        setStep("Submitting…");
        const submitted = await submitHorse(saved.id);
        if (submitted.error) {
          setFormError(submitted.error);
          return;
        }
      }

      router.push(
        isBoard
          ? props.returnTo
          : `${props.returnTo}?${intent === "submit" ? "submitted" : "saved"}=1`,
      );
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setStep(null);
    }
  }

  const busy = step !== null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        // Enter in a field: members submit, the board just saves.
        void save(isBoard ? "draft" : "submit");
      }}
      className="flex flex-col gap-10"
    >
      {props.reviewNote && (
        <Alert
          tone="warning"
          title="Changes requested by the registration board"
        >
          <p className="whitespace-pre-line">{props.reviewNote}</p>
        </Alert>
      )}

      <Section title="Identity">
        <Field
          id="registered_name"
          label="Registered name"
          hint="Include the brand, e.g. [WCRX] Knight's Rules Apply"
          error={errors.registered_name}
          required
        >
          <Input maxLength={120} {...text("registered_name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="barn_name" label="Barn name" error={errors.barn_name}>
            <Input maxLength={60} {...text("barn_name")} />
          </Field>
          <Field id="sex" label="Sex" error={errors.sex} required>
            <Select
              value={values.sex ?? ""}
              onChange={(e) =>
                set("sex", (e.target.value || null) as HorseInput["sex"])
              }
            >
              <option value="">Choose</option>
              <option value="stallion">Stallion</option>
              <option value="mare">Mare</option>
              <option value="gelding">Gelding</option>
            </Select>
          </Field>
        </div>
      </Section>

      {isBoard && board && (
        <Section
          title="Board record"
          hint="Only the registration board can change these."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="registration_number"
              label="WHMA number"
              hint="Leave empty for Foundation horses without a number."
              error={errors.registration_number}
            >
              <Input
                className="font-mono! uppercase"
                value={board.registration_number ?? ""}
                onChange={(e) =>
                  setBoard({ ...board, registration_number: e.target.value })
                }
              />
            </Field>
            <Field
              id="registration_date"
              label="Registration date"
              error={errors.registration_date}
            >
              <Input
                type="date"
                value={board.registration_date ?? ""}
                onChange={(e) =>
                  setBoard({
                    ...board,
                    registration_date: e.target.value || null,
                  })
                }
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <Field
              id="owner_id"
              label="Owner"
              hint="The member account this horse belongs to."
              error={errors.owner_id}
            >
              <Select
                value={board.owner_id ?? ""}
                onChange={(e) =>
                  setBoard({ ...board, owner_id: e.target.value || null })
                }
              >
                <option value="">No owner (Foundation or imported)</option>
                {props.board?.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={board.is_foundation}
                onChange={(e) =>
                  setBoard({ ...board, is_foundation: e.target.checked })
                }
                className="accent-rust"
              />
              Foundation horse
            </label>
          </div>
        </Section>
      )}

      <Section
        title="Breed & genetics"
        hint="Copy these from the horse's in-game stable records."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="breed_id"
            label="Listed breed"
            hint="Not listed? Ask the registration team."
            error={errors.breed_id}
            required
          >
            <Select
              value={values.breed_id ?? ""}
              onChange={(e) =>
                set("breed_id", e.target.value ? Number(e.target.value) : null)
              }
            >
              <BreedOptions breeds={props.breeds} />
            </Select>
          </Field>
          <Field
            id="pedigree"
            label="Pedigree"
            hint="e.g. Purebred"
            error={errors.pedigree}
          >
            <Input
              maxLength={40}
              list="pedigree-options"
              {...text("pedigree")}
            />
          </Field>
        </div>
        <datalist id="pedigree-options">
          <option value="Purebred" />
          <option value="Crossbred" />
        </datalist>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="phenotype"
            label="Coat (phenotype)"
            hint="e.g. Buttermilk Buckskin Roan"
            error={errors.phenotype}
            required
          >
            <Input maxLength={80} {...text("phenotype")} />
          </Field>
          <Field
            id="genotype"
            label="Genotype"
            hint="Breeding code, e.g. B_CR_RN"
            error={errors.genotype}
            required
          >
            <Input
              maxLength={40}
              className="font-mono!"
              {...text("genotype")}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            id="height"
            label="Height"
            hint="e.g. 15.2hh"
            error={errors.height}
          >
            <Input maxLength={20} {...text("height")} />
          </Field>
          <Field id="eye_color" label="Eye colour" error={errors.eye_color}>
            <Input maxLength={30} {...text("eye_color")} />
          </Field>
          <Field
            id="base_stats"
            label="Base stats"
            hint="e.g. [9-9] 9/8/9/8"
            error={errors.base_stats}
            required
          >
            <Input
              maxLength={40}
              className="font-mono!"
              {...text("base_stats")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Parents"
        hint="Pick registered parents from the registry, or enter their name and breed."
      >
        <ParentField
          role="sire"
          value={sire}
          onChange={setSire}
          breeds={props.breeds}
          excludeId={props.horseId}
          error={errors.sire}
        />
        <ParentField
          role="dam"
          value={dam}
          onChange={setDam}
          breeds={props.breeds}
          excludeId={props.horseId}
          error={errors.dam}
        />
        {notEligible && (
          <Alert tone="warning" title="Check eligibility">
            Neither parent is a classified breed. WHMA registers horses with at
            least one classified parent.{" "}
            <a href={site.criteriaUrl} className="underline underline-offset-4">
              Registration criteria
            </a>
          </Alert>
        )}
      </Section>

      <Section
        title="Photos"
        hint="Clear in-game screenshots of the horse. The main photo is shown in the registry."
      >
        <PhotoField
          photos={photos}
          primaryKey={primaryKey}
          onChange={(next, primary) => {
            setPhotos(next);
            setPrimaryKey(primary);
          }}
          error={errors.photos}
          disabled={busy}
        />
      </Section>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-rule bg-paper px-4 py-4 sm:-mx-6 sm:px-6">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="flex flex-wrap items-center gap-3">
          {isBoard ? (
            <Button disabled={busy} onClick={() => void save("draft")}>
              Save changes
            </Button>
          ) : (
            <>
              <Button type="submit" disabled={busy}>
                {resubmitting ? "Resubmit for review" : "Submit for review"}
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void save("draft")}
              >
                {resubmitting ? "Save changes" : "Save draft"}
              </Button>
            </>
          )}
          <Link
            href={props.returnTo}
            className="text-sm text-dust hover:text-ink"
          >
            Cancel
          </Link>
          {step && (
            <span role="status" className="text-sm text-dust italic">
              {step}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

function breedsById(breeds: Breed[], id: number | null) {
  return id ? breeds.find((b) => b.id === id) : undefined;
}
