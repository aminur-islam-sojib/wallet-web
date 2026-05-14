"use server";

import { z } from "zod";

import { createCredentialsUser } from "@/lib/users";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Use a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignUpState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function signUpWithCredentials(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  try {
    await createCredentialsUser(parsed.data);
    return { status: "success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign up.";
    return { status: "error", message };
  }
}
