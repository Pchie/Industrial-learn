import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry"
  },
  webServer: {
    command:
      "npm run build --workspace @industrial-learn/web && npm run start --workspace @industrial-learn/web -- --hostname 127.0.0.1 --port 3100",
    env: {
      APP_BASE_URL: "http://127.0.0.1:3100",
      INDUSTRIAL_LEARN_E2E: "true",
      INDUSTRIAL_LEARN_AUTH_MODE: "local",
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_PROJECT_REF: "",
      SUPABASE_DB_URL: ""
    },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
