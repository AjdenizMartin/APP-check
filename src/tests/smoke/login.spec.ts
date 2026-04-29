import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./fixtures/auth";

test("login correcto", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByText("Reception Shortcuts")).toBeVisible();
});
