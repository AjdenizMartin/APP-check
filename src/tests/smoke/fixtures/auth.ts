import { expect, type Page } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  const email = process.env.E2E_ADMIN_EMAIL ?? "admin@appplus.local";
  const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_DEFAULT_PASSWORD ?? "Change123!";

  await page.goto("/login");
  await page.getByLabel("Work Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
}

export async function apiRequest<T>(page: Page, path: string, init?: RequestInit): Promise<T> {
  const response = await page.evaluate(
    async ({ path, init }) => {
      const res = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      const text = await res.text();
      let json: unknown = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = { raw: text };
      }
      return { ok: res.ok, status: res.status, json };
    },
    { path, init },
  );

  if (!response.ok) {
    throw new Error(`API ${path} failed (${response.status}): ${JSON.stringify(response.json)}`);
  }

  return response.json as T;
}
