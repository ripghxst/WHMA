import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/auth-heading";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    <>
      <AuthHeading title="Become a member">
        Create an account to register your horses with the WHMA.
      </AuthHeading>
      <SignUpForm />
    </>
  );
}
