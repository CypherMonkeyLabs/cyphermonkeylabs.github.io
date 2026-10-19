import { defineConfig } from "@playwright/test";

const chrome = {
  channel: "chrome",
  launchOptions: {
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--host-resolver-rules=MAP cyphermonkeylabs.com 127.0.0.1"]
  }
};

export default defineConfig({
  testDir: ".",
  testMatch: "homepage.spec.js",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8766",
    trace: "off",
    ...chrome
  },
  webServer: {
    command: "python3 -m http.server 8766 --bind 127.0.0.1",
    cwd: "..",
    port: 8766,
    reuseExistingServer: true,
    timeout: 15000
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
