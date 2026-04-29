import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/smoke",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/appplus_athlone",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-auth-secret",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "e2e-auth-secret",
      AUTH_URL: process.env.AUTH_URL ?? "http://127.0.0.1:3100",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3100",
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "true",
    },
  },
  projects: [
    {
      name: "chromium",
      workers: 1,
  use: { ...devices["Desktop Chrome"] },
    },
  ],
});
