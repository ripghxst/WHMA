import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <AuthHeading title="Sign in">
        Welcome back. Sign in to manage your horses.
      </AuthHeading>
      {/* The form reads ?next= and ?error= from the URL. */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </>
  );
}
