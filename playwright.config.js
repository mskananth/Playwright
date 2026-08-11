// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 40 * 1000,
  expect: {
    timeout: 40 * 1000,
  },
  reporter: "html",
  // use: {
  //   browserName: "chromium",
  //   viewport: { width: 1920, height: 1080 },
  //   deviceScaleFactor: 1,
  //   /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
  // },
  use: {
    headless: false,
    viewport: null,
    // deviceScaleFactor: 1,
    launchOptions: {
      args: ["--window-position=0,0", "--window-size=1920,1080"],
    },
  },
});
