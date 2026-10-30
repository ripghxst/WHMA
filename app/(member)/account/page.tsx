import type { Metadata } from "next";
import { Suspense } from "react";

import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

import { PasswordForm, ProfileForm } from "./account-forms";

export const metadata: Metadata = { title: "Your account" };

async function AccountDetails() {
  const { email, profile } = await requireUser("/account");

  return (
    <>
      <section aria-labelledby="profile-heading" className="mt-10">
        <h2
          id="profile-heading"
          className="border-b border-rule pb-3 heading-caps text-xl text-dust"
        >
          Member profile
        </h2>
        <dl className="mt-5 mb-6 flex gap-4 text-sm">
          <dt className="label-caps text-saddle">Email</dt>
          <dd className="text-ink">{email}</dd>
        </dl>
        <ProfileForm profile={profile} />
      </section>

      <section aria-labelledby="password-heading" className="mt-14">
        <h2
          id="password-heading"
          className="border-b border-rule pb-3 heading-caps text-xl text-dust"
        >
          Password
        </h2>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </section>

      <form action={signOut} className="mt-14 border-t border-rule pt-6">
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="page-container max-w-3xl py-14">
      <h1 className="heading-caps text-3xl text-ink">Your account</h1>
      <Suspense
        fallback={
          <p className="mt-10 text-dust italic">Loading your account…</p>
        }
      >
        <AccountDetails />
      </Suspense>
    </div>
  );
}
