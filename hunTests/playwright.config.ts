import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Carga las variables del .env en process.env antes de que Playwright las use
dotenv.config();

export default defineConfig({
  testDir: './specs',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
