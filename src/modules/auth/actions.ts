"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/modules/auth/schemas";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid credentials format" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email or password is incorrect" };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
