import { defineConfig, devices } from '@playwright/test';

const desktop = { ...devices['Desktop Chrome'], locale: 'he-IL' };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', testIgnore: /request-access/, use: { ...desktop, baseURL: 'http://localhost:4173/' } },
    {
      name: 'mobile-360',
      testIgnore: /request-access/,
      use: { ...desktop, viewport: { width: 360, height: 740 }, baseURL: 'http://localhost:4173/' },
    },
    // Built with a test-only config (mailto mode) to exercise the access-request flow.
    {
      name: 'request-access',
      testMatch: /request-access/,
      use: { ...desktop, baseURL: 'http://localhost:4174/' },
    },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview',
      url: 'http://localhost:4173/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'SITE_CONFIG=./tests/e2e/site.config.e2e.json npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port 4174 --strictPort',
      url: 'http://localhost:4174/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
