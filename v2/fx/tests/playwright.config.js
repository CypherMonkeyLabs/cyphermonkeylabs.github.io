import { defineConfig } from '@playwright/test';

const chromeArgs = ['--no-sandbox', '--disable-dev-shm-usage'];

export default defineConfig({
  testDir: '.',
  testMatch: 'demo.spec.js',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  timeout: 120000,
  use: {
    baseURL: 'http://127.0.0.1:8877',
    channel: 'chrome',
    trace: 'off',
    launchOptions: { args: chromeArgs },
  },
  webServer: {
    command: 'python3 -m http.server 8877 --bind 127.0.0.1',
    cwd: '../../..',
    port: 8877,
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, hasTouch: false, isMobile: false },
    },
    {
      name: 'phone',
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
    },
    {
      name: 'short',
      use: { viewport: { width: 390, height: 430 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
    },
    {
      name: 'reduced',
      use: {
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'webgl-off',
      use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
  ],
});
