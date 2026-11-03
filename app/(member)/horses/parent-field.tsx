"use client";

import { useEffect, useId, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";

import { searchParents, type ParentOption } from "./actions";

export type Breed = { id: number; name: string; is_classified: boolean };

export type ParentValue = {
  /** Linked registered horse, or null for a manual entry. */
  linked: ParentOption | null;
  name: string;
  breedId: number | null;
};

type Props = {
  role: "sire" | "dam";
  value: ParentValue;
  onChange: (value: ParentValue) => void;
  breeds: Breed[];
  excludeId: string | null;
  error?: string;
};

export function ParentField({
  role,
  value,
  onChange,
  breeds,
  excludeId,
  error,
}: Props) {
  const uid = useId();
  const label = role === "sire" ? "Sire" : "Dam";
  const sex = role === "sire" ? "stallion" : "mare";
  const [mode, setMode] = useState<"registered" | "manual">(
    value.linked || !value.name ? "registered" : "manual",
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ParentOption[] | null>(null);
  const [searching, startSearch] = useTransition();

  // Search as the member types, after a short pause.
  useEffect(() => {
    if (mode !== "registered" || value.linked || query.trim().length < 2)
      return;
    const timer = setTimeout(() => {
      startSearch(async () => {
        setResults(await searchParents(query, sex, excludeId));
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, mode, sex, excludeId, value.linked]);

  const switchMode = (next: "registered" | "manual") => {
    setMode(next);
    setResults(null);
    setQuery("");
    onChange({ linked: null, name: "", breedId: null });
  };

  return (
    <fieldset
      aria-describedby={error ? `${uid}-error` : undefined}
      className={cn(
        "rounded-xs border bg-card p-5",
        error ? "border-rejected" : "border-rule",
      )}
    >
      <legend className="px-1 heading-caps text-lg text-ink">{label}</legend>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2" role="radiogroup">
        {(
          [
            ["registered", "Registered with the WHMA"],
            ["manual", "Not registered"],
          ] as const
        ).map(([m, text]) => (
          <label key={m} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={`${uid}-mode`}
              checked={mode === m}
              onChange={() => switchMode(m)}
              className="accent-rust"
            />
            {text}
          </label>
        ))}
      </div>

      {mode === "registered" &&
        (value.linked ? (
          <div className="flex items-start justify-between gap-4 rounded-xs border border-rule bg-paper p-4">
            <div>
              <p className="text-lg text-ink">{value.linked.name}</p>
              <p className="text-sm text-saddle">
                {[value.linked.breed, value.linked.foundation && "Foundation"]
                  .filter(Boolean)
                  .join(" · ")}
                {value.linked.number && (
                  <span className="ml-2 font-mono text-xs text-ink">
                    {value.linked.number}
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({ linked: null, name: "", breedId: null })
              }
            >
              Change
            </Button>
          </div>
        ) : (
          <div>
            <Field
              id={`${uid}-search`}
              label={`Find the ${label.toLowerCase()}`}
              hint={`Search approved ${sex}s by name or WHMA number.`}
            >
              <Input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim().length < 2) setResults(null);
                }}
                placeholder="e.g. Knight or WHMA-AM2"
                autoComplete="off"
              />
            </Field>
            {searching && (
              <p className="mt-2 text-sm text-dust italic">Searching…</p>
            )}
            {!searching && results && (
              <ul className="mt-2 divide-y divide-rule rounded-xs border border-rule bg-paper">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-dust italic">
                    No registered {sex}s match. If the {label.toLowerCase()}{" "}
                    isn&apos;t registered, choose &ldquo;Not registered&rdquo;
                    above.
                  </li>
                ) : (
                  results.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ linked: r, name: "", breedId: null });
                          setResults(null);
                          setQuery("");
                        }}
                        className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-card"
                      >
                        <span>
                          <span className="text-ink">{r.name}</span>
                          <span className="ml-2 text-sm text-dust">
                            {r.breed}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-saddle">
                          {r.number ?? (r.foundation ? "Foundation" : "")}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ))}

      {mode === "manual" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={`${uid}-name`}
            label={`${label} name`}
            hint="Include the brand, e.g. [WCRX]"
          >
            <Input
              value={value.name}
              maxLength={120}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </Field>
          <Field id={`${uid}-breed`} label={`${label} breed`}>
            <Select
              value={value.breedId ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  breedId: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <BreedOptions breeds={breeds} />
            </Select>
          </Field>
        </div>
      )}

      {error && (
        <p id={`${uid}-error`} className="mt-3 text-sm text-rejected">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Breed <option>s, classified breeds first. */
export function BreedOptions({ breeds }: { breeds: Breed[] }) {
  return (
    <>
      <option value="">Choose a breed</option>
      <optgroup label="Classified breeds">
        {breeds
          .filter((b) => b.is_classified)
          .map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
      </optgroup>
      <optgroup label="Other breeds">
        {breeds
          .filter((b) => !b.is_classified)
          .map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
      </optgroup>
    </>
  );
}
