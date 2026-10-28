import { defineConfig, devices } from '@playwright/test';

const clientUrl = 'http://127.0.0.1:5174';
const apiUrl = 'http://127.0.0.1:5000';
const useCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: useCI,
  retries: useCI ? 1 : 0,
  reporter: useCI ? 'github' : 'list',
  use: {
    baseURL: clientUrl,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
  },
  webServer: [
    {
      command: 'npm run dev -w server',
      url: `${apiUrl}/`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        PORT: '5000',
        MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/samudra-alert-e2e',
        JWT_ACCESS_SECRET: 'playwright-access-secret',
        JWT_REFRESH_SECRET: 'playwright-refresh-secret',
        CLIENT_URL: clientUrl,
      },
    },
    {
      command: 'npm run dev -w client -- --host 127.0.0.1',
      url: clientUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
