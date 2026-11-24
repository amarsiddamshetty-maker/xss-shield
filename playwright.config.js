import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } }],
  webServer: [{
    command: 'node scripts/e2e-server.js',
    url: 'http://127.0.0.1:3100/api/health',
    reuseExistingServer: false,
    timeout: 30000,
  }, {
    command: 'node scripts/e2e-public-server.js',
    url: 'http://127.0.0.1:3101/api/health',
    reuseExistingServer: false,
    timeout: 30000,
  }],
});
