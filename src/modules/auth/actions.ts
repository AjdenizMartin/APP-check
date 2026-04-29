"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { logger } from "@/lib/logging/logger";
import { loginSchema } from "@/modules/auth/schemas";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn("sensitive_action", { action: "LOGIN", requestId, result: "error" });
    return { error: "Invalid credentials format" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    logger.info("sensitive_action", { action: "LOGIN", requestId, result: "success" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn("sensitive_action", { action: "LOGIN", requestId, result: "error" });
      return { error: "Email or password is incorrect" };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
