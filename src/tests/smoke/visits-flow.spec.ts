import { test, expect } from "@playwright/test";
import { apiRequest, loginAsAdmin } from "./fixtures/auth";

type ApiCustomer = { data: { id: string; fullName: string; internalCode?: string | null } };
type ApiDashboard = { data: { activeVisits: Array<{ id: string; status: string; customer: { fullName: string } }> } };

test("crear cliente y hacer check-in", async ({ page }) => {
  await loginAsAdmin(page);

  const unique = `E2E-${Date.now()}`;
  const customer = await apiRequest<ApiCustomer>(page, "/api/customers", {
    method: "POST",
    body: JSON.stringify({
      fullName: `E2E Customer ${unique}`,
      phone: `+35387${String(Date.now()).slice(-6)}`,
      address: "Athlone Test Address",
      internalCode: unique,
      notes: "E2E customer",
    }),
  });

  await apiRequest(page, "/api/visits", {
    method: "POST",
    body: JSON.stringify({ customerId: customer.data.id }),
  });

  await page.goto("/dashboard/visits");
  await page.getByPlaceholder(/Search active customer/i).fill(unique);
  await expect(page.getByText(`E2E Customer ${unique}`)).toBeVisible();
});

test("check-out de cliente activo", async ({ page }) => {
  await loginAsAdmin(page);

  const dashboard = await apiRequest<ApiDashboard>(page, "/api/dashboard");
  const active = dashboard.data.activeVisits.find((visit) => visit.status === "ACTIVE");
  expect(active).toBeTruthy();

  await apiRequest(page, "/api/visits/checkout", {
    method: "POST",
    body: JSON.stringify({
      visitId: active!.id,
      amountIn: 15,
      amountOut: 0,
      currency: "EUR",
    }),
  });

  await page.goto("/dashboard/history");
  await expect(page.getByText(active!.customer.fullName).first()).toBeVisible();
});

test("force checkout global", async ({ page }) => {
  await loginAsAdmin(page);

  const unique = `E2E-FORCE-${Date.now()}`;
  const customer = await apiRequest<ApiCustomer>(page, "/api/customers", {
    method: "POST",
    body: JSON.stringify({
      fullName: `Force Customer ${unique}`,
      phone: `+35386${String(Date.now()).slice(-6)}`,
      address: "Mullingar Test Address",
      internalCode: unique,
      notes: "E2E force checkout",
    }),
  });

  await apiRequest(page, "/api/visits", {
    method: "POST",
    body: JSON.stringify({ customerId: customer.data.id }),
  });

  await page.goto("/dashboard");
  const acceptAllDialogs = async (dialog: { accept: () => Promise<void> }) => {
    await dialog.accept();
  };
  page.on("dialog", acceptAllDialogs);
  await page.getByRole("button", { name: /Force check-out all/i }).click();
  page.off("dialog", acceptAllDialogs);

  await expect.poll(async () => {
    const refreshed = await apiRequest<ApiDashboard>(page, "/api/dashboard");
    return refreshed.data.activeVisits.some((visit) => visit.customer.fullName === `Force Customer ${unique}`);
  }).toBe(false);
});
